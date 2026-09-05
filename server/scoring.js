import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const exec = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
export const repoLocks = new Set();
export const scoreVersion = 'git-hours-v1';
export const scoreHours = ({ L, C, S, T = 0, R = 0 }) => Math.min(4, .4 * Math.log1p(L / 500) + .3 * Math.log1p(C / 10) + .15 * Math.log1p(Math.min(15, S)) + .3 * T + .4 * R);
export function schoolDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export async function analyze(repo, base, head) {
  const python = process.env.SCORING_PYTHON || join(here, '..', '.venv', 'bin', 'python');
  try {
    const { stdout } = await exec(python, [join(here, 'score_diff.py'), repo, base, head], { timeout: 60000, maxBuffer: 2 * 1024 * 1024 });
    return JSON.parse(stdout).metrics;
  } catch (err) {
    throw new Error(err.code === 'ENOENT' ? 'Scoring needs Python and Lizard. Ask the workspace administrator to install server/requirements.txt.' : 'The diff could not be scored. Check the source-file size, commit history, and scoring service.', { cause: err });
  }
}
export function combine(records) {
  const added = records.reduce((s, r) => s + r.metrics.added, 0);
  const deleted = records.reduce((s, r) => s + r.metrics.deleted, 0);
  const files = new Set(records.flatMap(r => r.metrics.source_files.map(f => `${r.repo}/${f}`)));
  return { added, deleted, L: Math.max(added, deleted), C: records.reduce((s, r) => s + r.metrics.C, 0), S: Math.min(15, files.size),
    T: records.some(r => r.metrics.T === 1) ? 1 : 0, R: Math.max(0, ...records.map(r => r.metrics.R)) };
}
export function creditPlan(records, entry) {
  const pending = records.filter(c => c.version === scoreVersion && c.user_id === entry.user_id && c.day === entry.day && c.status === 'pending');
  const group = [...pending, entry];
  const metrics = combine(group);
  const calculated = scoreHours(metrics);
  const used = records.filter(c => c.version === scoreVersion && c.user_id === entry.user_id && c.year === entry.year).reduce((s, c) => s + c.hours, 0);
  const qualifying = calculated >= .25;
  return { metrics, calculated, hours: qualifying ? Math.min(calculated, Math.max(0, 40 - used)) : 0,
    status: qualifying ? (used >= 40 ? 'yearly_cap' : 'credited') : 'pending', merged_ids: qualifying ? pending.map(c => c.id) : [] };
}

// Consecutive pushes by the same student are scored as one net diff. Shared
// tasks credit only that student's authenticated ranges, never a peer's work.
export function studentRanges(pushes, repo, base, head, userId) {
  const ranges = [];
  let cursor = base;
  for (const p of pushes.filter(p => p.repo === repo)) {
    if (p.before !== cursor) continue;
    const previous = ranges.at(-1);
    if (previous?.user_id === p.user_id && previous.head === p.before) previous.head = p.head;
    else ranges.push({ base: p.before, head: p.head, user_id: p.user_id });
    cursor = p.head;
    if (cursor === head) break;
  }
  if (cursor !== head) throw new Error('The push history cannot be verified. No hours were awarded; contact the administrator.');
  return ranges.filter(r => r.user_id === userId);
}
