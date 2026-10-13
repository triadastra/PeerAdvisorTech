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
