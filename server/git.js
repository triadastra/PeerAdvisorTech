// ─────────────────────────────────────────────────────────────────────────
//  GIT — a per-assignment bare repo, served over Git's smart-HTTP protocol.
//  When a member commits to a node they get a clone URL keyed to their login;
//  `git clone` / `fetch` / `push` all work against the running server via
//  `git http-backend` (no extra service). Repos live under server/.data/repos
//  (gitignored). Access is open in this self-hosted setup — the URL carries
//  the member's login as the username, matching "username = default login".
// ─────────────────────────────────────────────────────────────────────────

import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const REPOS_DIR = join(here, '.data', 'repos');

let gitOk = null;
export function gitAvailable() {
  if (gitOk !== null) return gitOk;
  try {
    execFileSync('git', ['--version'], { stdio: 'ignore' });
    gitOk = true;
  } catch {
    gitOk = false;
  }
  return gitOk;
}

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// A stable, unique repo slug for an assignment.
export function repoSlug({ trackId, nodeKey, id }) {
  return `${slugify(trackId)}-${slugify(nodeKey)}-${String(id).slice(0, 8)}`;
}

// Create the bare repo (idempotent) with an initial README commit so the first
// clone isn't empty. Returns the repo's on-disk path.
export function ensureRepo(slug, { title = 'PA Tech task', login = 'member' } = {}) {
  if (!gitAvailable()) throw new Error('git is not installed on the server');
  const repo = join(REPOS_DIR, `${slug}.git`);
  if (existsSync(repo)) return repo;
  mkdirSync(REPOS_DIR, { recursive: true });
  execFileSync('git', ['init', '--bare', '-b', 'main', repo]);
  execFileSync('git', ['-C', repo, 'config', 'http.receivepack', 'true']);
  execFileSync('git', ['-C', repo, 'config', 'http.uploadpack', 'true']);

  // Seed an initial commit via a throwaway worktree, then push into the bare.
  const seed = join(REPOS_DIR, `.seed-${slug}`);
  try {
    rmSync(seed, { recursive: true, force: true });
    mkdirSync(seed, { recursive: true });
    const readme = `# ${title}\n\nWorkspace repo for your PA Tech task step.\nPush your work here; the team can fetch, review, and merge.\n\n- Owner login: ${login}\n- Created via the PA Tech workspace\n`;
    writeFileSync(join(seed, 'README.md'), readme);
    const run = (args) => execFileSync('git', ['-C', seed, ...args], {
      env: { ...process.env, GIT_AUTHOR_NAME: 'PA Tech', GIT_AUTHOR_EMAIL: 'workspace@peeradvisor.tech', GIT_COMMITTER_NAME: 'PA Tech', GIT_COMMITTER_EMAIL: 'workspace@peeradvisor.tech' },
    });
    run(['init', '-b', 'main']);
    run(['add', 'README.md']);
    run(['commit', '-m', 'Initial commit — task workspace']);
    run(['push', repo, 'main']);
  } catch {
    /* an empty repo still clones fine — seeding is best-effort */
  } finally {
    rmSync(seed, { recursive: true, force: true });
  }
  return repo;
}

// Build the clone URL a member sees: login as the username, /git/<slug>.git.
export function cloneUrl(req, slug, login) {
  const proto = (req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3001';
  const user = encodeURIComponent(login || 'member');
  return `${proto}://${user}@${host}/git/${slug}.git`;
}

// Express handler: bridge HTTP ↔ `git http-backend` (smart HTTP, CGI-style).
// Mount at '/git' — req.url here is already relative to that prefix.
export function gitHttpBackend(req, res) {
  if (!gitAvailable()) {
    res.status(501).json({ error: 'Git hosting is not available on this server.' });
    return;
  }
  const qIdx = req.url.indexOf('?');
  const pathInfo = qIdx === -1 ? req.url : req.url.slice(0, qIdx);
  const queryString = qIdx === -1 ? '' : req.url.slice(qIdx + 1);

  const child = spawn('git', ['http-backend'], {
    env: {
      ...process.env,
      GIT_PROJECT_ROOT: REPOS_DIR,
      GIT_HTTP_EXPORT_ALL: '1',
      PATH_INFO: pathInfo,
      QUERY_STRING: queryString,
      REQUEST_METHOD: req.method,
      CONTENT_TYPE: req.headers['content-type'] || '',
      CONTENT_LENGTH: req.headers['content-length'] || '',
      REMOTE_USER: (req.headers['x-remote-user'] || 'member').toString().slice(0, 64),
      REMOTE_ADDR: req.socket?.remoteAddress || '',
    },
  });

  req.pipe(child.stdin);

  const chunks = [];
  child.stdout.on('data', (c) => chunks.push(c));
  child.on('error', () => { if (!res.headersSent) res.status(500).end('git backend error'); });
  child.on('close', () => {
    const buf = Buffer.concat(chunks);
    const sep = buf.indexOf('\r\n\r\n');
    if (sep === -1) { res.status(200).end(buf); return; }
    const headerText = buf.slice(0, sep).toString('utf8');
    const body = buf.slice(sep + 4);
    let status = 200;
    for (const line of headerText.split('\r\n')) {
      const i = line.indexOf(':');
      if (i === -1) continue;
      const key = line.slice(0, i).trim();
      const val = line.slice(i + 1).trim();
      if (/^status$/i.test(key)) status = parseInt(val, 10) || 200;
      else res.setHeader(key, val);
    }
    res.status(status).end(body);
  });
}
