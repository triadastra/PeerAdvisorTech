// ─────────────────────────────────────────────────────────────────────────
//  PATD WORKSPACE API — our own backend.
//  Auth (register / login / me / logout) + tasks + events, over a JSON store.
//  Read is team-wide (so calendar + insights reflect everyone); writes are
//  owner-only. In production it also serves the built front-end from /dist,
//  so the whole thing runs as one origin with no CORS.
// ─────────────────────────────────────────────────────────────────────────

import express from 'express';
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { data, save } from './store.js';
import { hashPassword, verifyPassword, signToken, verifyToken, vidFor } from './auth.js';
import { buildTracks } from './seed.js';
import { ensureRepo, repoSlug, cloneUrl, gitHttpBackend, gitAvailable } from './git.js';

// Static group/task tracks + a nodeId → { track, node } lookup.
const TRACKS = buildTracks();
const NODE_INDEX = new Map();
for (const t of TRACKS) for (const n of t.nodes) NODE_INDEX.set(n.id, { track: t, node: n });

const RECRUIT_MS = 24 * 60 * 60 * 1000; // 24h recruiting window
const loginOf = (u) => (u?.email ? u.email.split('@')[0] : (u?.name || 'member').toLowerCase().replace(/[^a-z0-9]+/g, '')) || 'member';
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

const applicationAttempts = new Map();
function applicationRateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (applicationAttempts.get(key) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return res.status(429).json({ error: 'Too many submissions. Please wait a minute and try again.' });
  recent.push(now);
  applicationAttempts.set(key, recent);
  next();
}

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
  const to = process.env.RESEND_TO_EMAIL || 'patech@standardcas.org';
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
app.post('/api/assignments', requireAuth, (req, res) => {
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
  if (a.owner_id === req.user.id) data.assignments.splice(i, 1);
  else a.member_ids = a.member_ids.filter((m) => m !== req.user.id);
  save();
  res.status(204).end();
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
// Open in this self-hosted setup; the clone URL carries the member's login.
app.use('/git', gitHttpBackend);

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
