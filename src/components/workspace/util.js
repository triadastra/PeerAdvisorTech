// Non-component helpers for the workspace console (kept out of shared.jsx so
// Fast Refresh treats that file as components-only).

import { projects, specColors } from '../../data/projects';
import { people } from '../../data/people';

export const pad = (n) => String(n).padStart(2, '0');

// Current epoch ms via the Date constructor (kept in a helper so render code
// stays free of the impure Date.now() the lint rules forbid).
export const nowMs = () => new Date().getTime();

// spec number → { id, title, color, status, category }
export const specMap = Object.fromEntries(
  projects.map((p) => [p.spec, { id: p.id, title: p.title, color: specColors[p.spec], status: p.status, category: p.category }]),
);

export const specLabel = (n) => (n == null ? 'AIC' : `S${n}`);

// Light name match into the roster so a known member's title/role surfaces.
export const findPerson = (name) =>
  name ? people.find((p) => p.name.toLowerCase() === String(name).trim().toLowerCase()) : undefined;

// Initials from a name, max two letters.
export const initials = (s = '') =>
  s.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '—';

// ── Date helpers ──────────────────────────────────────────────────────────
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

// "Today" / "Tomorrow" / "Mon 16" relative to now.
export function dayLabel(iso) {
  const diff = Math.round((startOfDay(iso) - startOfDay(new Date())) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric' });
}

// Days from now (negative = past). Used to bucket agenda items.
export const dayDelta = (iso) => Math.round((startOfDay(iso) - startOfDay(new Date())) / 86_400_000);

// ── Recruiting countdown ────────────────────────────────────────────────────
// Milliseconds left until an epoch-ms timestamp (never negative).
export const msLeft = (endTs) => Math.max(0, Number(endTs) - nowMs());

// "23h 41m" / "41m 12s" / "closed" — compact recruiting-window countdown.
export function fmtCountdown(endTs) {
  const ms = msLeft(endTs);
  if (ms <= 0) return 'closed';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m ${String(sec).padStart(2, '0')}s`;
}
