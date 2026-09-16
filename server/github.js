// Narrow bridge to Launchpad's PA Tech teamwork service; GitHub tokens never leave Launchpad.
import { request as httpsRequest } from 'node:https';
import { verifyToken } from './auth.js';
export function installGithubRoutes(app, { requireAuth }) {
  const base = () => (process.env.LAUNCHPAD_ISSUER || 'https://launchpad.standardcas.org') + '/dashboard-api/patech';
  app.use('/api/teamwork', requireAuth, async (req, res) => {
    if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed.' });
    const token = verifyToken(req.cookies.patd_session)?.accessToken;
    if (!token) return res.status(401).json({ error: 'Sign in with Launchpad to use teamwork.' });
    if (!/^\/(me|tasks|credentials|github\/(repos|branches|device\/(start|poll))|tasks\/[a-f0-9-]{36}\/(join|submit))$/.test(req.path)) return res.status(404).json({ error: 'Unknown teamwork action.' });
    try {
      const response = await fetch(base() + req.url, {
        method: req.method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(req.method === 'POST' ? { body: JSON.stringify(req.body || {}) } : {}), signal: AbortSignal.timeout(120000), redirect: 'error',
      });
      res.set('Cache-Control', 'no-store');
      res.status(response.status).json(await response.json());
    } catch { res.status(502).json({ error: 'Launchpad teamwork could not be reached. Try again shortly.' }); }
  });
  app.use('/team-git', (req, res) => {
    if (!/^\/[a-f0-9-]{36}\.git\/(info\/refs|git-upload-pack|git-receive-pack)$/.test(req.path)) return res.status(404).end();
    const headers = { 'X-Patech-Git': String(req.headers['x-patech-git'] || '') };
    for (const key of ['content-type', 'content-length', 'git-protocol']) if (req.headers[key]) headers[key] = req.headers[key];
    const upstream = httpsRequest(base() + '/git' + req.url, { method: req.method, headers, timeout: 120000 }, response => {
      res.status(response.statusCode);
      for (const key of ['content-type', 'cache-control', 'pragma', 'expires']) if (response.headers[key]) res.setHeader(key, response.headers[key]);
      response.pipe(res);
    });
    upstream.on('timeout', () => upstream.destroy());
    upstream.on('error', () => { if (!res.headersSent) res.status(502).end('Launchpad Git service unavailable.'); else res.destroy(); });
    req.on('aborted', () => upstream.destroy());
    req.pipe(upstream);
  });
}
