import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import http from 'node:http';
import { once } from 'node:events';
import { mkdtemp, cp, symlink, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const origin = 'https://patech.standardcas.org';
const identity = { sub: 'oauth-test-member', vid: 'TEST-MEMBER', email: 'member@example.test', name: 'Test Member' };
const claims = { typ: 'at', sub: identity.sub, aud: 'app_' + crypto.createHash('sha256').update(origin).digest('hex').slice(0, 24), exp: Math.floor(Date.now() / 1000) + 600 };
let acceptedToken;
const issuer = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url !== '/oauth/userinfo' || req.headers.authorization !== `Bearer ${acceptedToken}`) {
    res.writeHead(401); res.end('{"error":"invalid_token"}'); return;
  }
  res.end(JSON.stringify(identity));
});
issuer.listen(0, '127.0.0.1');
await once(issuer, 'listening');
const issuerUrl = `http://127.0.0.1:${issuer.address().port}`;
acceptedToken = 'header.' + Buffer.from(JSON.stringify({ ...claims, iss: issuerUrl })).toString('base64url') + '.test-signature';
const dir = await mkdtemp(join(tmpdir(), 'patech-oauth-'));
let child;
try {
  await cp(resolve('server'), join(dir, 'server'), { recursive: true, filter: path => !path.includes('/.data') });
  await symlink(resolve('node_modules'), join(dir, 'node_modules'));
  await writeFile(join(dir, 'package.json'), '{"type":"module"}');
  const env = { ...process.env, NODE_ENV: 'production', API_PORT: '0', APP_ORIGIN: origin, HTTPS: 'true', LAUNCHPAD_ISSUER: issuerUrl, AUTH_SECRET: 'isolated-oauth-test-secret' };
  delete env.LAUNCHPAD_AUTH_REQUIRED;
  delete env.LAUNCHPAD_ADMIN_SUB;
  delete env.LAUNCHPAD_ADMIN_VID;
  child = spawn(process.execPath, [join(dir, 'server/index.js')], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  const base = await new Promise((resolveBase, reject) => {
    const timeout = setTimeout(() => reject(new Error('API startup timed out: ' + output)), 15000);
    child.stderr.on('data', data => { output += data; });
    child.once('error', reject);
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`API exited ${code}: ${output}`)); });
    child.stdout.on('data', data => {
      output += data;
      const match = output.match(/http:\/\/localhost:(\d+)/);
      if (match) { clearTimeout(timeout); resolveBase(`http://127.0.0.1:${match[1]}`); }
    });
  });
  async function call(path, body, cookie) {
    return fetch(base + '/api' + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Origin: origin, ...(cookie ? { Cookie: cookie } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  }
  assert.deepEqual(await (await call('/auth/config')).json(), { oauth: true });
  assert.equal((await call('/auth/login', {})).status, 403);
  assert.equal((await call('/auth/register', {})).status, 403);
  assert.equal((await call('/auth/launchpad', { accessToken: 'invalid' })).status, 401);
  const login = await call('/auth/launchpad', { accessToken: acceptedToken });
  assert.equal(login.status, 200);
  const user = (await login.json()).user;
  assert.equal(user.role, 'Member');
  assert.equal(user.vid, identity.vid);
  const cookie = login.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.deepEqual((await (await call('/auth/me', undefined, cookie.split(';')[0])).json()).user, user);
  assert.equal((await call('/auth/logout', {}, cookie.split(';')[0])).status, 200);
  assert.deepEqual(await (await call('/auth/me')).json(), { user: null });
  console.log('Production OAuth default, password blocking, token rejection, session refresh and logout passed');
} finally {
  if (child && child.exitCode === null) { const exited = once(child, 'exit'); child.kill(); await exited; }
  issuer.closeAllConnections();
  await new Promise(resolveClose => issuer.close(resolveClose));
  await rm(dir, { recursive: true, force: true });
}
