import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { scoreHours, creditPlan, schoolDay, studentRanges } from '../server/scoring.js';
assert.equal(scoreHours({L:1e30,C:1e30,S:100,T:1,R:2}),4);
assert.equal(schoolDay(new Date('2026-12-31T16:01:00Z')),'2027-01-01');
const history=[];
for(let i=0;i<5;i++) {
  const entry={id:String(i),version:'git-hours-v1',user_id:'u',day:'2026-09-06',year:'2026',repo:`r${i}`,metrics:{added:1,deleted:0,L:1,C:0,S:1,T:0,R:0,source_files:['a.py']}};
  const plan=creditPlan(history,entry);
  if(i<4) assert.equal(plan.hours,0); else assert.ok(plan.hours>=.25);
  for(const c of history) if(plan.merged_ids.includes(c.id)) c.status='merged';
  history.push({...entry,...plan,metrics:entry.metrics});
}
assert.equal(history.filter(c=>c.status==='merged').length,4);
assert.equal(creditPlan(history.slice(0, 4).map(c => ({ ...c, status: 'pending' })), { ...history[0], day: '2026-09-07' }).hours, 0);
const entry={...history.at(-1),day:'2026-09-07',metrics:{...history.at(-1).metrics,C:50}};
assert.ok(creditPlan([{...entry,hours:39.9,status:'credited'}],entry).hours < .101);
assert.equal(creditPlan([{...entry,hours:40,status:'credited'}],entry).hours,0);
assert.equal(creditPlan([{...entry,year:'2025',hours:40,status:'credited'}],entry).hours,scoreHours(entry.metrics));
assert.deepEqual(studentRanges([{repo:'r',before:'a',head:'b',user_id:'alice'},{repo:'r',before:'b',head:'c',user_id:'bob'}],'r','a','c','alice'),[{base:'a',head:'b',user_id:'alice'}]);

const dir=mkdtempSync(join(tmpdir(),'patd-score-'));
mkdirSync(join(dir,'server','.data'),{recursive:true});
writeFileSync(join(dir,'package.json'),'{"type":"module"}');
symlinkSync(resolve('node_modules'),join(dir,'node_modules'));
for(const f of ['index.js','store.js','auth.js','seed.js','git.js','scoring.js','score_diff.py']) copyFileSync(resolve('server',f),join(dir,'server',f));
let child; const port=19371; let stderr=''; let reviewerIds='';
async function start() {
  child=spawn(process.execPath,[join(dir,'server/index.js')],{env:{...process.env,API_PORT:String(port),SCORING_PYTHON:resolve('.venv/bin/python'),CI_REPORT_TOKEN:'local-test-secret',REVIEWER_IDS:reviewerIds},stdio:['ignore','pipe','pipe']});
  child.stderr.on('data',s=>stderr+=s);
  await new Promise((resolve,reject)=>{ child.stdout.once('data',resolve);child.once('exit',c=>reject(new Error(`Server exited ${c}: ${stderr}`)));child.once('error',reject); });
}
async function stop(){const done=new Promise(r=>child.once('exit',r));child.kill();await done;}
async function call(path,body,cookie,token){
  const r=await fetch(`http://localhost:${port}/api${path}`,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(cookie?{cookie}:{}),...(token?{authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};
}
const git=(cwd,...args)=>execFileSync('git',['-C',cwd,...args],{stdio:['ignore','pipe','pipe']}).toString().trim();
try {
  await start();
  assert.equal((await call('/contributions')).status,401);
  const alice=await call('/auth/register',{name:'Test Alice',email:'alice@example.test',password:'testpass123'});
  const bob=await call('/auth/register',{name:'Test Bob',email:'bob@example.test',password:'testpass123'});
  const reviewer=await call('/auth/register',{name:'Test Reviewer',email:'reviewer@example.test',password:'testpass123'});
  reviewerIds=reviewer.body.user.id;
  await stop(); await start();
  const a=await call('/assignments',{node_id:'school-clubs:build'},alice.cookie);
  const input={assignment_id:a.body.id,title:'Search implementation',body:'Built and tested the school club search logic.',points:9999,R:2,T:1,user_id:bob.body.user.id};
  assert.equal((await call('/contributions',input,bob.cookie)).status,403);
  assert.equal((await call('/contributions',input,alice.cookie)).status,409);
  await call('/assignments',{node_id:'school-clubs:build'},bob.cookie);
  const work=join(dir,'work');mkdirSync(work);
  const url=`http://localhost:${port}/git/${a.body.repo}.git`;
  const auth='Authorization: Basic '+Buffer.from('alice@example.test:testpass123').toString('base64');
  assert.equal((await fetch(url+'/info/refs?service=git-upload-pack')).status,401);
  git(work,'-c',`http.extraHeader=${auth}`,'clone',url,'.');
  git(work,'config','user.name','Untrusted commit author');git(work,'config','user.email','bob@example.test');
  writeFileSync(join(work,'search.py'),'def search(x):\n'+Array.from({length:30},(_,i)=>`    if x == ${i}: return ${i}\n`).join('')+'    return -1\n');
  mkdirSync(join(work,'tests'));writeFileSync(join(work,'tests/test_search.py'),'def test_search():\n    assert True\n');
  git(work,'add','.');git(work,'commit','-m','Implement search');
  let head=git(work,'rev-parse','HEAD');
  git(work,'-c',`http.extraHeader=${auth}`,'push','origin','main');
  assert.equal((await call('/assignments/'+a.body.id+'/submission',undefined,alice.cookie)).body.can_finish,true);
  assert.equal((await call('/contributions',input,bob.cookie)).status,409);
  const bobAuth='Authorization: Basic '+Buffer.from('bob@example.test:testpass123').toString('base64');
  writeFileSync(join(work,'buddy.py'),'def buddy(x):\n    if x: return 1\n    return 0\n');
  git(work,'add','.');git(work,'commit','-m','Peer contribution');
  git(work,'-c',`http.extraHeader=${bobAuth}`,'push','origin','main');
  head=git(work,'rev-parse','HEAD');
  assert.equal((await call('/ci-results',{repo:a.body.repo,head,passed:true},alice.cookie)).status,403);
  assert.equal((await call('/ci-results',{repo:a.body.repo,head:'0'.repeat(40),passed:true},undefined,'local-test-secret')).status,400);
  assert.equal((await call('/ci-results',{repo:a.body.repo,head,passed:true},undefined,'local-test-secret')).status,201);
  assert.equal((await call('/assignments/'+a.body.id+'/review',{head,rating:2},alice.cookie)).status,403);
  assert.equal((await call('/assignments/'+a.body.id+'/review',{head,rating:1},reviewer.cookie)).status,201);
  const saved=await call('/contributions',input,alice.cookie);
  assert.equal(saved.status,201,JSON.stringify(saved.body));
  assert.equal(saved.body.metrics.T,1);assert.equal(saved.body.metrics.R,1);
  assert.equal(saved.body.user_id,alice.body.user.id);assert.ok(saved.body.hours>0 && saved.body.hours<4);
  assert.equal(saved.body.hours,scoreHours(saved.body.metrics));
  assert.equal(saved.body.head,head);
  assert.equal(saved.body.title, 'Finished: Build the club directory');
  assert.ok(saved.body.body.startsWith('System-scored '));
  assert.notEqual(saved.body.body,input.body);
  assert.equal(saved.body.metrics.C,32); // 31 in search + 1 in Alice's test; Bob's function is excluded
  const bobSaved=await call('/contributions',{assignment_id:a.body.id},bob.cookie);
  assert.equal(bobSaved.status,201,JSON.stringify(bobSaved.body));
  assert.equal(bobSaved.body.metrics.C,2);assert.equal(bobSaved.body.metrics.T,0);
  assert.equal((await call('/contributions',input,alice.cookie)).status,409);
  assert.equal((await call('/assignments',undefined,alice.cookie)).body[0].status,'done');
  writeFileSync(join(work,'extra.py'),'x = 2\n');git(work,'add','.');git(work,'commit','-m','Too late');
  assert.throws(()=>git(work,'-c',`http.extraHeader=${auth}`,'push','origin','main'));
  await stop();await start();
  const feed=await call('/contributions',undefined,alice.cookie);
  assert.equal(feed.body.feed.length,2);assert.equal(feed.body.scores.find(s=>s.user_id===alice.body.user.id).score,saved.body.hours);
  assert.equal(feed.body.scores.find(s=>s.user_id===bob.body.user.id).score,bobSaved.body.hours);
  console.log('PASS: authenticated real HTTP push → rule scoring → finished task → persistent hours; spoofing, duplicate, CI, yearly cap, tiny-change aggregation, shared attribution');
} finally {
  if(child && child.exitCode===null) await stop();
  rmSync(dir,{recursive:true,force:true});
}
