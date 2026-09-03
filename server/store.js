// ─────────────────────────────────────────────────────────────────────────
//  STORE — our own tiny JSON datastore. No external database, no service.
//  Everything lives in server/.data/db.json (gitignored). Writes are atomic
//  (temp file + rename) so a crash mid-write can't corrupt the file. Plenty
//  for a studio-sized team; swap this module for Postgres / The Spine later
//  without touching the routes.
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(here, '.data');
const DB_PATH = join(DATA_DIR, 'db.json');

const EMPTY = { users: [], tasks: [], events: [], assignments: [], forum: [] };

function read() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_PATH)) return structuredClone(EMPTY);
  try {
    const parsed = JSON.parse(readFileSync(DB_PATH, 'utf8'));
    return { ...structuredClone(EMPTY), ...parsed };
  } catch {
    return structuredClone(EMPTY);
  }
}

export const data = read();

export function save() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, DB_PATH);
}
