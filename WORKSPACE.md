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
seams — the UI doesn't change. Static content (the eight projects, the team, the
agents, the roadmap) still lives in `src/data/*` and is edited there.

## Git-based contribution hours

Install the deterministic analyzer once, then run the site normally:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r server/requirements.txt
npm run dev
```

Git clone/fetch/push now require the student's workspace email and password and
membership of that task. Use the clone URL shown in My builds. Git prompts for
the password; do not put passwords in remotes or commit them. Only authenticated
updates to `main` create push receipts. A new task pins its initial main commit
as the scoring baseline. Existing repos are pinned at their current main on the
first upgraded server start: old unauthenticated work cannot receive retroactive
credit. Force pushes and main deletion are rejected.

Push code, then open **Contributions → Finish a task** (also linked from My
builds). The backend computes metrics, saves the contribution and marks the
shared task finished in one JSON-store write. Further pushes are closed; other
teammates can still finish their own recorded work. Each student's consecutive
authenticated push ranges are analyzed as a net diff, and other students' ranges
are excluded from their credit. Git author/email metadata and client-supplied
scores, ratings, test flags, links and SHAs are never scoring authority.

The Python script reads blobs without checking out or executing repository code.
It uses Git `diff -M -w --ignore-blank-lines` and Lizard 1.17.31. L is the maximum
of additions and deletions, C is summed complexity of new/modified functions
(unchanged function bodies, including moves, are matched against the base), and
S is changed non-test source files capped at 15. A fixed source-extension allowlist
covers common web, Python, JVM, C-family, Go, Rust, Ruby, PHP, SQL and shell files.
Notebooks contribute code cells only. Unsupported text/assets, lock/data files,
known generated/vendor/build paths, generated markers and declaration/minified
files are excluded. Filter definitions are in `server/score_diff.py`. Lizard may
not extract functions from every allowed source language (for example CSS); those
files can contribute L/S but no C. Scoring rejects oversized inputs (over 500
changed source files, 2 MB per source blob, or 60 seconds) rather than awarding
partial results. Adjust these server-owned rules deliberately, not per student.

`h = min(4, .4 ln(1+L/500) + .3 ln(1+C/10) + .15 ln(1+S) + .3T + .4R)`

T is 1 only when that student's source and test files changed and the final main
SHA has a trusted passing CI result. R defaults to 0. Values below .25 h remain
pending and are recomputed together with later submissions by the same student
that Hong Kong calendar day, using summed additions/deletions/complexity, distinct
repo/file pairs (S capped at 15), any verified T, and maximum R. Earlier pending
records become merged only when the combined score reaches .25. Remaining pending
records expire at day end. Each qualifying group caps at 4 h; annual credits cap
at 40 h in the Hong Kong calendar year. Full precision is stored; the UI rounds to
two decimals. These are deterministic credits, not measured elapsed work hours
or a guarantee of quality. Old fixed-point entries remain visible as unscored legacy
records and are excluded from the hours leaderboard.

### Trusted CI and optional review

There is no configured CI runner by default, so T stays 0. The site never runs
student-submitted test commands on the host. A separately managed, sandboxed CI
runner may report its result to `POST /api/ci-results` with an Authorization
Bearer token matching the server's `CI_REPORT_TOKEN`. JSON body:

```json
{"repo":"the-assignment-repo-slug","head":"full-current-main-sha","passed":true}
```

Use a runner-owned secret and pipeline definition; do not expose this token to
student code or let that code issue its own attestation. The backend accepts only
the exact current main SHA. The most recent result for that SHA applies when
finishing; later reports do not rewrite already-issued credits.

Optional `REVIEWER_IDS` is a comma-separated allowlist of workspace UUIDs. An
allowlisted reviewer can join the task, inspect its code, select it in Contributions,
and use Rate 0/1/2 before it is finished. The endpoint is
`POST /api/assignments/:id/review` with `{ "head": "full-sha", "rating": 1 }` and
the reviewer's session cookie. Self-rating is rejected if the reviewer has pushed
to the repo; any subsequent commit invalidates an earlier rating. There is no
automatic rating inference and no AI API in this workflow.

Audit records (baseline/head, push ranges, uploader IDs, metrics, CI/reviewer
snapshot, formula version, merge IDs and credited hours) persist in
`server/.data/db.json`; push receipts are recorded before a successful push HTTP
response. If receipt persistence fails, finishing fails closed pending administrator
repair. Runtime data and `.venv` are ignored by Git.

Validation:

```sh
.venv/bin/python -m unittest discover -s tests -p 'test_*.py'
node tests/contributions.mjs
npm run lint
npm run build
```

The integration test uses disposable accounts and repositories in a temporary
server, performs real authenticated HTTP pushes, checks credit attribution and
CI trust, and restarts that server to verify persistence. It does not seed demo
credits into the live workspace.

### System-generated logs and demo activity

Finish requests need only `assignment_id`. Titles and summaries are generated
from the task and verified Git metrics; student-supplied text is ignored. The UI
has no description, work-link, or manual score inputs.

To seed the local demo feed, stop the API and run
`node scripts/seed-contribution-demos.mjs`, then restart it. This replaces only
`demo_contributions`, with one sample for each existing student plus four
fictional students. Demo rows and demo totals are explicitly labeled and can be
hidden with the feed checkbox. They never enter scoring, yearly caps, pending
credit, task completion, or the real student leaderboard.


## Projects and Launchpad

Hosted sign-in uses Launchpad OAuth when LAUNCHPAD_AUTH_REQUIRED=true. APP_ORIGIN must match the registered app origin. LAUNCHPAD_ADMIN_SUB and LAUNCHPAD_ADMIN_VID pin the app-local administrator.

Only admins can create projects and publish their ordered task series, through **Explore projects → New project**. A title and at least one task are required. GitHub is optional; the admin can connect through Launchpad and choose a repository and branch. Each code task starts from the same source snapshot in its own shared repository. Project creation does not join tasks or start recruitment.

Members start or join published tasks. The first member starts that task’s 24-hour recruitment window. After the deadline, existing teammates keep working but new members cannot join. Joined projects appear in **My builds**, with all tasks shown in order. Plain tasks can be marked complete by teammates; this does not award contribution hours. Code tasks retain the Git credential, clone/pull/push, and exact-commit review flow. Only the admin’s actual Launchpad login can approve a GitHub PR. There is no separate Team tasks section.

Project/task metadata and Git repositories persist in Launchpad/data/patech-teamwork. Existing single tasks migrate to one-task projects without changing their IDs or clone URLs. The old standalone task publication endpoint is disabled. GitHub credentials remain in Launchpad; PA Tech holds only the app-scoped OAuth token in a secure HTTP-only cookie.

Admins can archive or delete tasks from Explore projects or My builds. Use Show archived tasks → Restore task to bring an archived task back without restarting its recruitment window. Archived work is read-only. Deletion requires confirmation and removes task access; existing GitHub branches and PRs are not changed.

To extend an existing project, admins select Add task on its project card, enter a title and instructions, and publish. The new task inherits the project repository and branch and gets its own recruitment window on first join; existing tasks are unchanged.
