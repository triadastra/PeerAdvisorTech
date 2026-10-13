import assert from 'node:assert/strict';
import { tools, toolFor, myProjectTasks, projectTaskState } from '../src/components/workspace/navigation.js';
assert.equal(new Set(tools.map(t => t.id)).size, tools.length);
assert.equal(toolFor('missing').id, 'home');
for (const tool of tools) { assert.equal(toolFor(tool.id), tool); assert.equal(toolFor(tool.key), tool); }
const projects = [{ title: 'Project', tasks: [
  { id: 'mine', members: ['me'] }, { id: 'other', members: ['other'] },
  { id: 'archived', members: ['me'], archived_at: 123 }, { id: 'empty' },
] }];
assert.deepEqual(myProjectTasks(projects, 'me').map(t => t.id), ['mine']);
assert.equal(myProjectTasks(projects, 'me')[0].project_title, 'Project');
assert.deepEqual(myProjectTasks(projects, undefined), []);
for (const [task, expected] of [
  [{ archived_at: 1, pr: 'url' }, 'Archived'], [{ pr: 'url' }, 'PR opened'],
  [{ status: 'done' }, 'Completed'], [{ submission: {} }, 'In review'],
  [{ status: 'review' }, 'In review'], [{}, 'Ready to start'],
  [{ recruiting_ends_at: 1001 }, 'Finding teammates'], [{ recruiting_ends_at: 1000 }, 'In progress'],
]) assert.equal(projectTaskState(task, 1000), expected);
// Read errors must reach the UI; a failed API is not an empty list.
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async () => new Response(JSON.stringify({error:'Session expired'}), {status:401});
  const { listTasks, listEvents, listTracks, listAssignments, listForum, listProfiles } = await import('../src/lib/db.js');
  for (const read of [listTasks, listEvents, listTracks, listAssignments, listForum, listProfiles]) await assert.rejects(read, /Session expired/);
  globalThis.fetch = async () => { throw new Error('offline'); };
  await assert.rejects(listTasks, /connection is unavailable/);
} finally { globalThis.fetch = originalFetch; }
console.log('Studio routes, task summaries, recruitment boundary and error propagation passed');

const { taskAccess, plural, studioLink } = await import('../src/components/workspace/taskActions.js');
const open = {status: 'open', members: []};
assert.equal(taskAccess(open, 'me', false).canJoin, true);
assert.equal(taskAccess({...open, members:['me']}, 'me', false).canJoin, false);
assert.equal(taskAccess({...open, members:['me']}, 'me', false).canComplete, true);
assert.equal(taskAccess(open, 'me', true).canComplete, false, 'Admin status alone does not grant team completion');
for (const extra of [{archived_at:1}, {status:'done'}, {pr:'url'}, {status:'review'}, {submission:{}}, {recruiting_ends_at:1000}]) assert.equal(taskAccess({...open,...extra}, 'me', false, 1000).canJoin, false);
assert.equal(taskAccess({...open, repository:'org/repo'}, 'me', false).canWork, false);
assert.equal(taskAccess({...open, repository:'org/repo'}, 'me', true).canWork, true);
assert.equal(taskAccess({...open, repository:'org/repo', members:['me']}, 'me', false).canComplete, false);
for (const admin of [true,false]) for (const extra of [{archived_at:1},{status:'done'},{pr:'url'}]) {
 const a=taskAccess({...open, members:['me'],repository:'org/repo',...extra}, 'me', admin);
 assert.equal(a.canWork, false); assert.equal(a.canComplete, false);
}
assert.equal(taskAccess({...open,repository:'org/repo',status:'review'},'me',true).canReview,true);
assert.equal(taskAccess({...open,repository:'org/repo',status:'review'},'me',false).canReview,false);
assert.equal(plural(1,'task'),'1 task'); assert.equal(plural(2,'task'),'2 tasks');
const link=new URL(studioLink('projects','project / 1','task & 2','https://patech.example'));
assert.equal(link.pathname,'/workspace'); assert.equal(link.searchParams.get('task'),'task & 2'); assert.equal(link.searchParams.get('project'),'project / 1');
console.log('Project card permissions, closed/archived states and share links passed');
