import './env.js';
import crypto from 'node:crypto';
export const oauthEnabled = () => process.env.LAUNCHPAD_AUTH_REQUIRED === 'true';
export const oauthOrigin = () => process.env.APP_ORIGIN || 'https://patech.standardcas.org';
export function isAdminIdentity(identity) {
  return Boolean(process.env.LAUNCHPAD_ADMIN_SUB && process.env.LAUNCHPAD_ADMIN_VID
    && identity.sub === process.env.LAUNCHPAD_ADMIN_SUB && identity.vid === process.env.LAUNCHPAD_ADMIN_VID);
}
export async function validateIdentity(token, fetcher = fetch) {
  if (typeof token !== 'string' || token.length > 16384) throw new Error('Invalid OAuth token.');
  const issuer = process.env.LAUNCHPAD_ISSUER || 'https://launchpad.standardcas.org';
  const client = 'app_' + crypto.createHash('sha256').update(oauthOrigin()).digest('hex').slice(0, 24);
  const response = await fetcher(`${issuer}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000), redirect: 'error',
  });
  if (!response.ok) throw new Error('Launchpad sign-in expired or was rejected. Please sign in again.');
  const identity = await response.json();
  // The provider verified the signature. Bind these verified token claims to this app.
  const claims = JSON.parse(Buffer.from(token.split('.')[1] || '', 'base64url').toString());
  if (claims.typ !== 'at' || (claims.iss && claims.iss !== issuer) || claims.aud !== client || claims.sub !== identity.sub
      || !identity.sub || !identity.vid || !Number.isFinite(claims.exp) || claims.exp <= Date.now() / 1000) {
    throw new Error('OAuth token was not issued for this workspace.');
  }
  return { identity, maxAge: Math.min(3600, Math.floor(claims.exp - Date.now() / 1000)) };
}
export function provisionIdentity(data, identity) {
  let user = data.users.find(u => u.launchpad_sub === identity.sub);
  if (!user) {
    user = { id: crypto.randomUUID(), created_at: new Date().toISOString(), launchpad_sub: identity.sub };
    data.users.push(user);
  }
  Object.assign(user, { email: identity.email || '', name: identity.name || identity.username || identity.vid,
    vid: identity.vid, role: isAdminIdentity(identity) ? 'Admin' : 'Member' });
  return user;
}
