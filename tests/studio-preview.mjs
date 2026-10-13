// Isolated UI fixture. Never used by the app or deployed as an API.
// npm run build && node tests/studio-preview.mjs
// Optional STUDIO_SCENARIO points to JSON: {admin, empty, fail, joinError}.
import express from 'express';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const app = express();
app.use(express.json());
const scenario = () => { try { return JSON.parse(readFileSync(process.env.STUDIO_SCENARIO, 'utf8')); } catch { return {}; } };
const member = { id: 'preview-member', name: 'Alex Chen', email: 'alex@example.test', vid: 'DEMO', role: 'Member' };
const account = () => ({ ...member, role: scenario().admin ? 'Admin' : 'Member' });
const task = (id, title, extra = {}) => ({ id, title, description: 'Read the brief, share an update with your team, and check the result before finishing.', status: 'open', members: [], ...extra });
const projects = [{ id: 'p1', title: 'A better school day', description: 'Small tools that make life on campus easier. Choose a task that fits your interests.', tasks: [task('t1', 'Map the student help journey', { members: [member.id], recruiting_ends_at: Date.now() + 3600000 }), task('t2', 'Design the club directory'), task('t3', 'Improve the search experience', { repository: 'example/school-directory', clone_url: 'https://example.test/git/t3', members: [member.id], base_sha: '1234567890', head: 'abcdef1234', recruiting_ends_at: Date.now() - 1000 })] }, { id: 'p2', title: 'Open campus', description: 'Help new students find their way.', tasks: [task('t4', 'Write an accessible welcome guide', { members: [member.id], status: 'review', repository: 'example/campus', submission: {} }), task('t5', 'Review map labels', { status: 'done', members: [member.id] })] }];
projects.unshift({id:'pa',title:'PA Tech',description:'PA Tech is the student-led service-learning group supporting school AI infrastructure.',tasks:[task('testing','[Testing] Upload for Getting Hours! 1 HOUR FOR TESTING THIS UPLOAD FUNCTION',{description:'This is a test field. It is not bound to any project. You can try submitting something here to help debug our Git system. You will receive 1 hour by default! (regardless of what code you posted).',members:[member.id],recruiting_ends_at:Date.now()-1000})]});
let events = [], tasks = [], forum = [];
app.get('/dashboard-api/oauth/sdk.js', (_req, res) => res.type('js').send('window.LaunchpadAuth={ready:async()=>({}),signOut(){},state:{}}'));
app.get('/api/auth/config', (_req, res) => res.json({ oauth: true }));
app.get('/api/auth/me', (_req, res) => res.json({ user: account() }));
app.get('/api/project-service/me', (_req, res) => res.json({ user_id: member.id, admin: !!scenario().admin, review_url: 'https://example.test/review' }));
app.use('/api', (req, res, next) => { if (scenario().fail && req.path === scenario().fail) return res.status(503).json({ error: 'Fixture service unavailable' }); next(); });
app.get('/api/project-service/projects', (_req, res) => res.json(scenario().empty ? [] : projects));
app.post('/api/project-service/tasks/:id/:action', (req, res) => {
  const t = projects.flatMap(p => p.tasks).find(t => t.id === req.params.id);
  if (scenario().joinError) return res.status(409).json({ error: 'Recruitment has closed. Choose another task.' });
  if (req.params.action === 'join') { t.members.push(member.id); t.recruiting_ends_at ||= Date.now() + 86400000; }
  if (req.params.action === 'submit') { t.status = 'review'; t.submission = {}; }
  if (req.params.action === 'archive') t.archived_at = Date.now();
  if (req.params.action === 'restore') t.archived_at = null;
  if (req.params.action === 'complete') t.status = 'done';
  res.json({ task: t });
});
app.post('/api/project-service/projects/:id/tasks', (req,res) => { if(!scenario().admin) return res.sendStatus(403); const t=task(String(Date.now()),req.body.title,{description:req.body.description}); projects.find(p=>p.id===req.params.id).tasks.push(t);res.json(t); });
app.get('/api/profiles', (_req, res) => res.json([account()]));
app.get('/api/tracks', (_req, res) => res.json([]));
app.get('/api/assignments', (_req, res) => res.json([]));
app.get('/api/tasks', (_req, res) => res.json(tasks));
app.post('/api/tasks', (req, res) => { if (!scenario().admin) return res.sendStatus(403); const t = { ...req.body, id: String(Date.now()), user_id: member.id, status: 'open' }; tasks.push(t); res.status(201).json(t); });
app.patch('/api/tasks/:id', (req, res) => { const t = tasks.find(t => t.id === req.params.id); Object.assign(t, req.body); res.json(t); });
app.get('/api/events', (_req, res) => res.json(events));
app.post('/api/events', (req, res) => { const e = { ...req.body, id: String(Date.now()), user_id: member.id }; events.push(e); res.status(201).json(e); });
app.get('/api/forum', (_req, res) => res.json(forum));
app.post('/api/forum', (req, res) => { const p = { ...req.body, id: String(Date.now()), user_id: member.id, author: member.name, created_at: new Date().toISOString() }; forum.push(p); res.status(201).json(p); });
app.get('/api/contributions', (_req, res) => res.json({ feed: [], scores: [], demo_feed: [], demo_scores: [], year: 2026, version: 2 }));
app.use(express.static(resolve('dist')));
app.use((_req, res) => res.sendFile(resolve('dist/index.html')));
app.listen(4175, '127.0.0.1', () => console.log('Synthetic Studio preview: http://127.0.0.1:4175/workspace'));
