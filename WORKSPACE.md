# The Workspace — accounts + operations console

The site now has a private, members-only **workspace**: a register/login portal
at `/access` and an operations console at `/workspace`. It runs on **our own
backend** (no third-party service) — Express + a JSON datastore + cookie-session
auth built on Node's standard `crypto`.

## Run it

```bash
npm install
npm run dev          # starts BOTH the web app (:3200) and the API (:3001)
```

`npm run dev` runs Vite and the API together (via `concurrently`); Vite proxies
`/api` → the backend so cookies are same-origin. Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Web + API together (development) |
| `npm run dev:web` | Just the front-end |
| `npm run server` | Just the API |
| `npm run build` | Build the front-end to `dist/` |
| `npm start` | Serve the built site **and** the API from one process (`:3001`, production) |

No `.env` is required. A signing secret is generated once to
`server/.data/secret` on first start. In production, set `AUTH_SECRET` (and
`PORT`) — see `.env.example`.

## How it fits together

```
src/lib/api.js        fetch wrapper → /api/*
src/lib/auth.jsx      <AuthProvider> (session state)
src/lib/authContext.js  AuthContext + useAuth()
src/lib/db.js         listTasks / createTask / … (calls api.js)
src/components/Access.jsx              the register / login portal (/access)
src/components/workspace/Workspace.jsx the console shell (top bar, spec rail, tabs)
src/components/workspace/Overview|Calendar|Timeline|Agents|Team|Tasks.jsx
src/components/workspace/util.js + shared.jsx   helpers + ruled UI primitives
src/data/workspace.js                  agents, milestones, handoff date, starters

server/index.js   the API (auth + tasks + events; serves dist/ in production)
server/auth.js    scrypt password hashing + HMAC session tokens (our own)
server/store.js   atomic JSON datastore → server/.data/db.json (gitignored)
```

## Data model

- **users** — `{ id, email, name, role, vid, passwordHash }`. The `vid` is a
  stable "verified identity" derived from the user id — our nod to The Spine.
- **tasks** — `{ id, user_id, title, spec, priority, status, due }`.
- **events** — `{ id, user_id, title, spec, starts_at, with_whom }`.

Access rule (enforced in `server/index.js`): a signed-in member can **read the
whole team's** tasks/events (so the calendar and "team insights" are real), but
can only **create/edit/delete their own**.

## Swapping the backend later

`server/store.js` is the only place that touches storage, and `src/lib/api.js`
is the only place the front-end talks to it. To move onto Postgres, or to front
this with the real **Spine / VID** identity service, reimplement those two
seams — the UI doesn't change. Static content (the eleven specs, the team, the
agents, the roadmap) still lives in `src/data/*` and is edited there.
