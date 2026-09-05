// ─────────────────────────────────────────────────────────────────────────
//  PATD WORKSPACE API — our own backend.
//  Auth (register / login / me / logout) + tasks + events, over a JSON store.
//  Read is team-wide (so calendar + insights reflect everyone); writes are
//  owner-only. In production it also serves the built front-end from /dist,
//  so the whole thing runs as one origin with no CORS.
// ─────────────────────────────────────────────────────────────────────────

import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { data, save } from './store.js';
import { hashPassword, verifyPassword, signToken, verifyToken, vidFor } from './auth.js';
import { buildTracks } from './seed.js';
import { ensureRepo, repoSlug, cloneUrl, gitHttpBackend, gitAvailable, authorizeGit, repoHead, REPOS_DIR } from './git.js';

import { analyze, repoLocks, scoreVersion, schoolDay, creditPlan, studentRanges } from './scoring.js';

// Static group/task tracks + a nodeId → { track, node } lookup.
const TRACKS = buildTracks();
const NODE_INDEX = new Map();
for (const t of TRACKS) for (const n of t.nodes) NODE_INDEX.set(n.id, { track: t, node: n });

const RECRUIT_MS = 24 * 60 * 60 * 1000; // 24h recruiting window
const loginOf = (u) => u?.email || legacyLoginOf(u);
const legacyLoginOf = (u) => (u?.email ? u.email.split('@')[0] : (u?.name || 'member').toLowerCase().replace(/[^a-z0-9]+/g, '')) || 'member';
const nameOf = (id) => data.users.find((u) => u.id === id)?.name || 'Member';
const effectiveStatus = (a) => (a.status === 'done' ? 'done' : (Date.now() > a.recruiting_ends_at ? 'active' : 'recruiting'));

const here = dirname(fileURLToPath(import.meta.url));
const ENV_FILE = join(here, '..', '.env');
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const DIST = join(here, '..', 'dist');
// API_PORT wins over the generic PORT so a dev launcher setting PORT (for the
// web server) can't accidentally rebind the API on top of it.
const PORT = process.env.API_PORT || process.env.PORT || (process.env.NODE_ENV === 'production' ? 3200 : 3001);
const COOKIE = 'patd_session';
const SECURE = process.env.NODE_ENV === 'production' && process.env.HTTPS === 'true';

const app = express();
app.use(express.json());

// Minimal cookie reader (no extra dependency).
app.use((req, _res, next) => {
  req.cookies = {};
  const header = req.headers.cookie;
  if (header) {
    for (const part of header.split(';')) {
      const i = part.indexOf('=');
      if (i > -1) req.cookies[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    }
  }
  next();
});

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, vid: u.vid, joined: u.created_at?.slice(0, 7) });

function setSession(res, userId) {
  res.cookie(COOKIE, signToken({ sub: userId }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: SECURE,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function currentUser(req) {
  const payload = verifyToken(req.cookies[COOKIE]);
  if (!payload?.sub) return null;
  return data.users.find((u) => u.id === payload.sub) || null;
}

function requireAuth(req, res, next) {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  req.user = user;
  next();
}

const isEmail = (s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

const applicationRateLimit = rateLimit({ windowMs: 60_000, limit: 5, message: { error: 'Too many submissions. Please wait a minute and try again.' } });
const assignmentRateLimit = rateLimit({ windowMs: 60_000, limit: 30, message: { error: 'Too many assignment requests. Please wait a minute and try again.' } });
const gitRateLimit = rateLimit({ windowMs: 60_000, limit: 120, message: { error: 'Too many git requests. Please wait a minute and try again.' } });

// ── Public member applications ───────────────────────────────────────────────
app.post('/api/contact/application', applicationRateLimit, async (req, res) => {
  const name = String(req.body?.name || '').trim().slice(0, 120);
  const year = String(req.body?.year || '').trim().slice(0, 4);
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 254);
  const focus = String(req.body?.focus || '').trim().slice(0, 500);
  const about = String(req.body?.about || '').trim().slice(0, 3000);
  const specs = Array.isArray(req.body?.specs) ? req.body.specs.map(String).slice(0, 20) : [];
  const entry = String(req.body?.entry || '').trim().slice(0, 5000);

  if (!name) return res.status(400).json({ error: 'Name is required.' });
  if (!/^\d{2,4}$/.test(year)) return res.status(400).json({ error: 'Enter a valid class year.' });
  if (!isEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const to = process.env.RESEND_TO_EMAIL || 'patech.shsid@outlook.com';
  if (!apiKey || !from) return res.status(503).json({ error: 'Email delivery is not configured yet.' });

  const text = [
    `Name: ${name}`,
    `Class: ’${year}`,
    `Email: ${email}`,
    `Focus: ${focus || '—'}`,
    `Interested specs: ${specs.join(', ') || '—'}`,
    '',
    'About:',
    about || '—',
    '',
    '--- people.js entry ---',
    entry || '—',
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `application-${crypto.randomUUID()}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New member application — ${name}`,
        text,
      }),
    });

    if (!response.ok) {
      const details = await response.json().catch(() => null);
      console.error('Resend rejected application email:', response.status, details?.message || details?.name || 'Unknown error');
      return res.status(502).json({ error: 'Email delivery failed. Please try again shortly.' });
    }

    const result = await response.json();
    res.status(201).json({ ok: true, id: result.id });
  } catch (error) {
    console.error('Resend application email failed:', error instanceof Error ? error.message : error);
    res.status(502).json({ error: 'Email delivery failed. Please try again shortly.' });
  }
});

// ── Auth ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!name) return res.status(400).json({ error: 'Name is required.' });
  if (!isEmail(email)) return res.status(400).json({ error: 'A valid email is required.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (data.users.some((u) => u.email === email)) return res.status(409).json({ error: 'An account with that email already exists.' });

  const id = crypto.randomUUID();
  const user = { id, email, name, role: 'Member', vid: vidFor(id), passwordHash: hashPassword(password), created_at: new Date().toISOString() };
  data.users.push(user);
  save();
  setSession(res, id);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = data.users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Wrong email or password.' });
  }
  setSession(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = currentUser(req);
  res.json({ user: user ? publicUser(user) : null });
});

// ── Profiles (team) ────────────────────────────────────────────────────────────
app.get('/api/profiles', requireAuth, (_req, res) => {
  res.json(data.users.map((u) => ({ id: u.id, name: u.name, role: u.role, vid: u.vid })));
});

// ── Tasks ─────────────────────────────────────────────────────────────────────
app.get('/api/tasks', requireAuth, (_req, res) => {
  res.json([...data.tasks].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')));
});

app.post('/api/tasks', requireAuth, (req, res) => {
  const title = String(req.body?.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  const task = {
    id: crypto.randomUUID(),
    user_id: req.user.id,
    title,
    spec: req.body?.spec ?? null,
    priority: req.body?.priority || 'Med',
    status: 'open',
    due: req.body?.due || null,
    created_at: new Date().toISOString(),
  };
  data.tasks.push(task);
  save();
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', requireAuth, (req, res) => {
  const task = data.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found.' });
  if (task.user_id !== req.user.id) return res.status(403).json({ error: 'Not your task.' });
  for (const k of ['title', 'spec', 'priority', 'status', 'due']) {
    if (k in (req.body || {})) task[k] = req.body[k];
  }
  save();
  res.json(task);
});

app.delete('/api/tasks/:id', requireAuth, (req, res) => {
  const i = data.tasks.findIndex((t) => t.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found.' });
  if (data.tasks[i].user_id !== req.user.id) return res.status(403).json({ error: 'Not your task.' });
  data.tasks.splice(i, 1);
  save();
  res.status(204).end();
});

// ── Events ───────────────────────────────────────────────────────────────────
app.get('/api/events', requireAuth, (_req, res) => {
  res.json([...data.events].sort((a, b) => (a.starts_at || '').localeCompare(b.starts_at || '')));
});

app.post('/api/events', requireAuth, (req, res) => {
  const title = String(req.body?.title || '').trim();
  const starts_at = req.body?.starts_at;
  if (!title) return res.status(400).json({ error: 'Title is required.' });
  if (!starts_at) return res.status(400).json({ error: 'A start time is required.' });
  const event = {
    id: crypto.randomUUID(),
    user_id: req.user.id,
    title,
    spec: req.body?.spec ?? null,
    starts_at,
    with_whom: req.body?.with_whom || null,
    created_at: new Date().toISOString(),
  };
  data.events.push(event);
  save();
  res.status(201).json(event);
});

app.delete('/api/events/:id', requireAuth, (req, res) => {
  const i = data.events.findIndex((e) => e.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found.' });
  if (data.events[i].user_id !== req.user.id) return res.status(403).json({ error: 'Not your event.' });
  data.events.splice(i, 1);
  save();
  res.status(204).end();
});

// ── Tracks (groups/tasks to apply to) ────────────────────────────────────────
app.get('/api/tracks', requireAuth, (_req, res) => {
  res.json(TRACKS);
});

// ── Assignments (claim a node → "Work on it", 24h recruiting, git repo) ───────
function publicAssignment(a, req) {
  const idx = NODE_INDEX.get(a.node_id);
  return {
    id: a.id,
    track_id: a.track_id,
    node_id: a.node_id,
    node_title: idx?.node.title || a.node_title || a.node_id,
    track_title: idx?.track.title || a.track_id,
    spec: idx?.track.spec ?? null,
    color: idx?.track.color || '#605e58',
    owner_id: a.owner_id,
    owner_name: nameOf(a.owner_id),
    member_ids: a.member_ids,
    members: a.member_ids.map(nameOf),
    status: effectiveStatus(a),
    recruiting_ends_at: a.recruiting_ends_at,
    created_at: a.created_at,
    repo: a.repo,
    scoring_base: a.scoring_base,
    // The clone URL carries the *requesting* member's login as the username.
    clone_url: a.repo ? cloneUrl(req, a.repo, loginOf(req.user)) : null,
  };
}

app.get('/api/assignments', requireAuth, (req, res) => {
  const rows = [...data.assignments]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .map((a) => publicAssignment(a, req));
  res.json(rows);
});

// Work on it — claim a node. Idempotent per (user, node): returns the existing
// claim if the user already joined it.
app.post('/api/assignments', requireAuth, assignmentRateLimit, (req, res) => {
  const nodeId = String(req.body?.node_id || '');
  const idx = NODE_INDEX.get(nodeId);
  if (!idx) return res.status(400).json({ error: 'Unknown node.' });

  const existing = data.assignments.find((a) => a.node_id === nodeId && a.member_ids.includes(req.user.id));
  if (existing) return res.status(200).json(publicAssignment(existing, req));

  // If a claim is already open on this node, join it instead of forking a new one.
  const open = data.assignments.find((a) => a.node_id === nodeId && effectiveStatus(a) === 'recruiting');
  if (open) {
    open.member_ids.push(req.user.id);
    save();
    return res.status(200).json(publicAssignment(open, req));
  }

  const id = crypto.randomUUID();
  const slug = repoSlug({ trackId: idx.track.id, nodeKey: idx.node.key, id });
  let repo = null;
  if (gitAvailable()) {
    try { ensureRepo(slug, { title: `${idx.track.title} — ${idx.node.title}`, login: loginOf(req.user) }); repo = slug; }
    catch (e) { console.error('repo init failed:', e instanceof Error ? e.message : e); }
  }
  const assignment = {
    id,
    track_id: idx.track.id,
    node_id: nodeId,
    node_title: idx.node.title,
    owner_id: req.user.id,
    member_ids: [req.user.id],
    status: 'recruiting',
    recruiting_ends_at: Date.now() + RECRUIT_MS,
    repo,
    scoring_base: repo ? repoHead(repo) : null,
    created_at: new Date().toISOString(),
  };
  data.assignments.push(assignment);
  save();
  res.status(201).json(publicAssignment(assignment, req));
});

// Join a friend's still-recruiting claim on the same node.
app.post('/api/assignments/:id/join', requireAuth, (req, res) => {
  const a = data.assignments.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found.' });
  if (effectiveStatus(a) !== 'recruiting') return res.status(409).json({ error: 'Recruiting for this step has closed.' });
  if (!a.member_ids.includes(req.user.id)) { a.member_ids.push(req.user.id); save(); }
  res.json(publicAssignment(a, req));
});

// Leave / drop a claim (owner leaving removes it entirely).
app.delete('/api/assignments/:id', requireAuth, (req, res) => {
  const i = data.assignments.findIndex((x) => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found.' });
  const a = data.assignments[i];
  if (a.status === 'done' || repoLocks.has(a.repo) || data.pushes.some(p => p.repo === a.repo)) return res.status(409).json({ error: 'Tasks with recorded pushes or submissions cannot be deleted.' });
  if (a.owner_id === req.user.id) data.assignments.splice(i, 1);
  else a.member_ids = a.member_ids.filter((m) => m !== req.user.id);
  save();
  res.status(204).end();
});

// Pin existing repositories at their current main before accepting new scored work.
// Historical unauthenticated pushes are never assigned to a student retroactively.
let migratedBases = false;
for (const a of data.assignments) {
  if (a.repo && !a.scoring_base) { a.scoring_base = repoHead(a.repo); migratedBases = true; }
}
if (migratedBases) save();

const reviewers = () => (process.env.REVIEWER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
const canReview = (u) => reviewers().includes(u.id);
const publicContribution = (c) => ({ ...c, author: nameOf(c.user_id), status: c.status === 'pending' && c.day !== schoolDay() ? 'expired' : c.status });
app.get('/api/contributions', requireAuth, (req, res) => {
  const year = schoolDay().slice(0, 4);
  const feed = [...data.contributions].reverse().map(c => c.version === scoreVersion ? publicContribution(c) : { ...c, author: nameOf(c.user_id), hours: 0, status: 'legacy' });
  const scores = data.users.map(u => {
    const records = data.contributions.filter(c => c.version === scoreVersion && c.user_id === u.id && c.year === year);
    return { user_id: u.id, name: u.name, score: records.reduce((sum, c) => sum + c.hours, 0), submissions: records.length };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const demo_feed = data.demo_contributions;
  const demo_scores = [...new Set(demo_feed.map(c => c.user_id))].map(id => {
    const entries = demo_feed.filter(c => c.user_id === id);
    return { user_id: id, name: entries[0].author, score: entries.reduce((s, c) => s + c.hours, 0), submissions: entries.length };
  }).sort((a, b) => b.score - a.score);
  res.json({ feed, scores, demo_feed, demo_scores, year, can_review: canReview(req.user), ci_configured: Boolean(process.env.CI_REPORT_TOKEN), version: scoreVersion });
});

// Only a trusted runner can report CI; students cannot set T in a finish request.
app.post('/api/ci-results', (req, res) => {
  const token = process.env.CI_REPORT_TOKEN;
  const supplied = req.headers.authorization || '';
  const expected = `Bearer ${token}`;
  if (!token || supplied.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return res.status(403).json({ error: 'Trusted CI credentials required.' });
  const { repo, head, passed } = req.body || {};
  if (typeof passed !== 'boolean' || !/^[a-f0-9]{40,64}$/.test(head || '') || !data.assignments.some(a => a.repo === repo) || repoHead(repo) !== head) return res.status(400).json({ error: 'Report a boolean result for the exact current main commit.' });
  const result = { repo, head, passed, created_at: new Date().toISOString() };
  data.ci_results.push(result);
  try { save(); } catch { data.ci_results.pop(); return res.status(500).json({ error: 'Could not save CI evidence.' }); }
  res.status(201).json(result);
});

// Optional rating is set by an explicitly configured reviewer BEFORE finishing.
app.post('/api/assignments/:id/review', requireAuth, (req, res) => {
  if (!canReview(req.user)) return res.status(403).json({ error: 'Reviewer access required.' });
  const a = data.assignments.find(a => a.id === req.params.id);
  const { head, rating } = req.body || {};
  if (!a || a.status === 'done' || ![0, 1, 2].includes(rating) || !head || repoHead(a.repo) !== head) return res.status(400).json({ error: 'Rate the current main commit of an unfinished task.' });
  if (data.pushes.some(p => p.repo === a.repo && p.user_id === req.user.id)) return res.status(403).json({ error: 'A contributor cannot rate their own task.' });
  const review = { assignment_id: a.id, head, rating, reviewer_id: req.user.id, created_at: new Date().toISOString() };
  data.reviews.push(review);
  try { save(); } catch { data.reviews.pop(); return res.status(500).json({ error: 'Could not save review.' }); }
  res.status(201).json(review);
});

app.get('/api/assignments/:id/submission', requireAuth, (req, res) => {
  const a = data.assignments.find(a => a.id === req.params.id);
  if (!a || (!a.member_ids.includes(req.user.id) && !canReview(req.user))) return res.status(403).json({ error: 'Task membership required.' });
  const head = a.repo ? repoHead(a.repo) : null;
  const push = data.pushes.findLast(p => p.repo === a.repo && p.head === head);
  const ci = data.ci_results.findLast(c => c.repo === a.repo && c.head === head);
  const review = data.reviews.findLast(r => r.assignment_id === a.id && r.head === head);
  res.json({ base: a.scoring_base, head, pushed_by: push ? nameOf(push.user_id) : null, can_finish: head !== a.scoring_base && data.pushes.some(p => p.repo === a.repo && p.user_id === req.user.id) && !data.contributions.some(c => c.version === scoreVersion && c.assignment_id === a.id && c.user_id === req.user.id),
    ci: ci ? (ci.passed ? 'passed' : 'failed') : 'not reported', rating: review?.rating ?? 0, status: a.status });
});

app.post('/api/contributions', requireAuth, assignmentRateLimit, async (req, res) => {
  const assignment = data.assignments.find(a => a.id === req.body?.assignment_id);
  if (!assignment || !assignment.member_ids.includes(req.user.id)) return res.status(403).json({ error: 'Join this project step before finishing it.' });
  if (data.contributions.some(c => c.version === scoreVersion && c.assignment_id === assignment.id && c.user_id === req.user.id)) return res.status(409).json({ error: 'You have already finished and recorded your part of this task.' });
  const title = `Finished: ${assignment.node_title || assignment.node_id}`;
  if (!assignment.repo || !assignment.scoring_base) return res.status(409).json({ error: 'This repository has no scoring baseline. Contact the administrator.' });
  if (repoLocks.has(assignment.repo)) return res.status(409).json({ error: 'Repository busy. Retry after the push or submission finishes.' });
  const head = repoHead(assignment.repo);
  const receipt = data.pushes.findLast(p => p.repo === assignment.repo && p.head === head);
  if (!head || head === assignment.scoring_base || !data.pushes.some(p => p.repo === assignment.repo && p.user_id === req.user.id)) return res.status(409).json({ error: 'Push your changes to main using your workspace credentials before finishing the task.' });
  if (data.contributions.some(c => c.version === scoreVersion && c.repo === assignment.repo && c.head === head && c.user_id === req.user.id)) return res.status(409).json({ error: 'This commit has already been submitted.' });
  repoLocks.add(assignment.repo);
  try {
    const ranges = studentRanges(data.pushes, assignment.repo, assignment.scoring_base, head, req.user.id);
    if (!ranges.length) throw new Error('No authenticated pushes from your account were found for this task.');
    const parts = [];
    for (const range of ranges) parts.push(await analyze(join(REPOS_DIR, `${assignment.repo}.git`), range.base, range.head));
    const metrics = { added: parts.reduce((s, p) => s + p.added, 0), deleted: parts.reduce((s, p) => s + p.deleted, 0), C: parts.reduce((s, p) => s + p.C, 0),
      source_files: [...new Set(parts.flatMap(p => p.source_files))], test_files: [...new Set(parts.flatMap(p => p.test_files))], R: 0, T: 0 };
    metrics.L = Math.max(metrics.added, metrics.deleted); metrics.S = Math.min(15, metrics.source_files.length);
    const ci = data.ci_results.findLast(c => c.repo === assignment.repo && c.head === head);
    metrics.T = metrics.source_files.length && metrics.test_files.length && ci?.passed ? 1 : 0;
    const review = data.reviews.findLast(r => r.assignment_id === assignment.id && r.head === head);
    metrics.R = review?.rating ?? 0;
    const day = schoolDay();
    const entry = { id: crypto.randomUUID(), version: scoreVersion, user_id: req.user.id, assignment_id: assignment.id, node_id: assignment.node_id,
      repo: assignment.repo, base: assignment.scoring_base, head, push_id: receipt.id, ranges,
      track_title: NODE_INDEX.get(assignment.node_id)?.track.title || assignment.track_id, node_title: assignment.node_title,
      title, body: `System-scored ${ranges.length} authenticated push range(s): ${metrics.source_files.length} source file(s), ${metrics.test_files.length} test file(s), ${metrics.L} effective lines.`, metrics, ci: ci || null, review: review || null, day, year: day.slice(0, 4), created_at: new Date().toISOString() };
    const plan = creditPlan(data.contributions, entry);
    Object.assign(entry, { hours: plan.hours, calculated_hours: plan.calculated, credited_metrics: plan.metrics, status: plan.status, merged_ids: plan.merged_ids });
    const previous = structuredClone(data.contributions);
    const oldStatus = assignment.status;
    for (const c of data.contributions) if (plan.merged_ids.includes(c.id)) { c.status = 'merged'; c.merged_into = entry.id; }
    data.contributions.push(entry);
    assignment.status = 'done';
    try { save(); } catch { data.contributions = previous; assignment.status = oldStatus; throw new Error('Could not save the result. Your task is still open; please retry.'); }
    res.status(201).json(publicContribution(entry));
  } catch (err) { res.status(422).json({ error: err.message || 'Scoring failed; no hours were awarded.' }); }
  finally { repoLocks.delete(assignment.repo); }
});

// ── Forum ─────────────────────────────────────────────────────────────────────
app.get('/api/forum', requireAuth, (_req, res) => {
  const rows = [...data.forum]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .map((p) => ({ ...p, author: nameOf(p.user_id) }));
  res.json(rows);
});

app.post('/api/forum', requireAuth, (req, res) => {
  const body = String(req.body?.body || '').trim().slice(0, 2000);
  if (!body) return res.status(400).json({ error: 'Say something first.' });
  const post = {
    id: crypto.randomUUID(),
    user_id: req.user.id,
    body,
    track_id: req.body?.track_id ? String(req.body.track_id).slice(0, 60) : null,
    created_at: new Date().toISOString(),
  };
  data.forum.push(post);
  save();
  res.status(201).json({ ...post, author: nameOf(post.user_id) });
});

app.delete('/api/forum/:id', requireAuth, (req, res) => {
  const i = data.forum.findIndex((p) => p.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Not found.' });
  if (data.forum[i].user_id !== req.user.id) return res.status(403).json({ error: 'Not your post.' });
  data.forum.splice(i, 1);
  save();
  res.status(204).end();
});

// ── Git smart-HTTP (per-assignment repos: clone / fetch / push) ───────────────
// Workspace credentials and membership are required for Git access.
app.use('/git', gitRateLimit, authorizeGit, gitHttpBackend);

// ── Static front-end (production) + SPA fallback ──────────────────────────────
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) return res.sendFile(join(DIST, 'index.html'));
    next();
  });
}

const server = app.listen(PORT, () => {
  console.log(`PATD workspace API → http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Port ${PORT} is already in use — another API instance is running. Stop it, or set PORT=<other>.`);
  } else {
    console.error('✗ API server error:', err);
  }
  process.exit(1);
});
