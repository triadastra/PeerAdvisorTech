# Studio navigation release checks

The studio now uses stable `?view=` links, a persistent tool directory, a searchable tool picker, and separate project, planning, calendar, discussion, and contribution workflows. Members do not see admin publishing controls. Project tasks and the older Git-scored studio assignments have distinct entry points.

## Verified on 2026-10-13

- Production build and ESLint pass under Node 22.
- `npm run test:studio`: route mapping, task ownership, archived-task exclusion, recruitment boundary, and API failures reaching the UI.
- `npm run test:oauth`: issuer/audience/expiry/identity/admin binding, secure sessions, blocked password auth, per-client limits. Real backend checks also cover member rejection from publishing planner tasks and event/discussion persistence.
- `node tests/contributions.mjs` with `server/requirements.txt` in `.venv`: authenticated Git push, scoring, persistent credits, spoof rejection, CI, duplicate submission, cap, aggregation, and shared attribution.
- Isolated browser fixture: member and admin views; task joining; code submission enters review; planner create/complete; Calendar save and reload; search; refresh and Back; confirmation cancellation and Escape; unavailable section remains an explicit error while other tools remain usable.
- Responsive inspection at 390px: navigation and calendar; dark and light themes; no horizontal page overflow in tested views.
- User completed real Launchpad login; production studio recognized their admin identity and loaded the project directory.

## Before a public debut

- Complete a real student task against a designated disposable repository: obtain a Git credential, clone, push, submit, approve the diff as admin, and verify the resulting GitHub PR. Local fixture UI checks do not prove these external operations.
- Resolve legacy assignment Git access for new Launchpad users: the legacy Git server still authenticates with workspace email/password, while Launchpad project repositories use task credentials. Launchpad sign-in alone does not provision a legacy Git password.
- Confirm which assignments should award contribution hours. Launchpad tasks and legacy scored assignments remain different workflows; completing a non-code project task does not automatically award hours. Existing project descriptions may promise credit that the scoring system does not implement.
- Review project briefs, repository bindings, roles, and dates with the administrator. This change preserves that content.

## Repeatable UI preview

Run `npm run build`, then `STUDIO_SCENARIO=/tmp/studio-scenario.json node tests/studio-preview.mjs`. Open `http://127.0.0.1:4175/workspace`. The server binds only to loopback and uses synthetic accounts and in-memory data, never a real Launchpad session. Change the scenario JSON and reload: `{ "admin": true }`, `{ "empty": true }`, `{ "fail": "/events" }`, or `{ "joinError": true }`. Do not deploy the fixture server.

Production deployed and browser-verified: authenticated admin session survives deployment; overview, project directory, and existing project content load with the new shell. Environment, signing secret, and user database hashes were unchanged by the deployment.

The host supplies a development environment during dependency installation. The build script now explicitly sets `NODE_ENV=production` so a deploy cannot ship the React development runtime. Verify the rebuilt assets, not just source hashes.

## Project and task card redesign

- Project cards show a concise header, correctly pluralized task totals, direct links, and visible add-task controls for admins. Single-task projects open immediately; task titles are never automatically numbered.
- Task briefs, membership/recruitment status, collaboration shortcuts, and the primary next action have distinct areas. Admin archive/restore/delete controls remain separate from student actions.
- Completion, archive and restore use confirmations. Non-members cannot complete non-code tasks merely because they are admins; archived/finished tasks do not offer work actions. Existing two-step joining and code review flows remain available.
- Shared project/task URLs reopen the selected card. Discussion drafts and calendar titles preserve task context, including on refresh; neither shortcut posts or schedules automatically.
- Card-specific checks: permission matrix and recruitment boundary tests; browser-tested student joining/completion and absence of admin controls; administrator add-task, archive and restore; copy-link round trip; discussion/calendar prefill; 390px mobile layout without horizontal overflow. Mutations used only the synthetic fixture.
- The PA Tech upload-testing brief currently describes uploads/hours, but its task has no repository. The card explicitly states that it has no code upload and completion does not automatically award hours. The brief itself remains unchanged.
