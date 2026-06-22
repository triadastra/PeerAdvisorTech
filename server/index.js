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

const here = dirname(fileURLToPath(import.meta.url));
const DIST = join(here, '..', 'dist');
const PORT = process.env.PORT || process.env.API_PORT || (process.env.NODE_ENV === 'production' ? 3200 : 3001);
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
