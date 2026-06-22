// ─────────────────────────────────────────────────────────────────────────
//  AUTH PRIMITIVES — our own, built on Node's standard crypto. No libraries.
//  · Passwords: scrypt with a per-user random salt (salt:hash hex).
//  · Sessions: a compact HMAC-SHA256-signed token (data.signature), verified
//    in constant time, carried in an httpOnly cookie.
//  The signing secret comes from $AUTH_SECRET, or is generated once and saved
//  to server/.data/secret (gitignored) so sessions survive restarts.
// ─────────────────────────────────────────────────────────────────────────

import crypto from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SECRET_PATH = join(here, '.data', 'secret');

function loadSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (existsSync(SECRET_PATH)) return readFileSync(SECRET_PATH, 'utf8').trim();
  const secret = crypto.randomBytes(48).toString('hex');
  if (!existsSync(dirname(SECRET_PATH))) mkdirSync(dirname(SECRET_PATH), { recursive: true });
  writeFileSync(SECRET_PATH, secret);
  return secret;
}

const SECRET = loadSecret();

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored = '') {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(password, salt, 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

const b64url = (input) => Buffer.from(input).toString('base64url');

export function signToken(payload, maxAgeSec = 60 * 60 * 24 * 30) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSec };
  const data = b64url(JSON.stringify(body));
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
    return body;
  } catch {
    return null;
  }
}

// Short, stable "verified identity" derived from the user id — our nod to The
// Spine's VID. Deterministic, no storage needed.
export function vidFor(id = '') {
  const hex = crypto.createHash('sha256').update(id).digest('hex').toUpperCase();
  return `0x${hex.slice(0, 6)}…${hex.slice(6, 8)}`;
}
