// ─────────────────────────────────────────────────────────────────────────
//  WORKSPACE — static seeds for the operations console.
//  Specs, people, and the team derive from the existing data files; this file
//  adds the things specific to the logged-in workspace: the autonomous agents,
//  the roadmap to the September handoff, and optional starter content a member
//  can load into their own (Supabase) workspace on first run.
// ─────────────────────────────────────────────────────────────────────────

// The locked-roster successor handoff. Drives the "days to handoff" counter.
export const HANDOFF_DATE = '2026-09-01';

// Autonomous / system agents that run across AI Central. Read-only status —
// the platform's self-healing, zero-human-ops surface, mapped to the spec
// that owns each one.
export const agents = [
  { id: 'super-relay', name: 'Super Relay™', spec: 4, scope: 'Launchpad routing · 8 providers', status: 'live', metric: '99.9%' },
  { id: 'synonance-rag', name: 'Synonance RAG', spec: 3, scope: 'Retrieval pipeline', status: 'live', metric: '84%↓ tokens' },
  { id: 'self-healing', name: 'Self-healing ops', spec: 4, scope: 'Infra watchdog', status: 'idle', metric: 'last 02:14' },
  { id: 'intelligence', name: 'Intelligence layer', spec: 4, scope: 'Aggregate reporting', status: 'live', metric: 'min-N floor' },
  { id: 'launchpad-runner', name: 'Launchpad runner', spec: 4, scope: 'Build & deploy executor', status: 'standby', metric: 'pre-launch' },
];

export const agentStatusColor = { live: '#c8f135', idle: '#605e58', standby: '#82807a' };

// The roadmap to the handoff. `state` is active (now) / planned / done.
export const milestones = [
  { id: 'm-jun', month: 'Jun', date: '2026-06-16', spec: 4, label: 'Launchpad spine hardening', state: 'active' },
  { id: 'm-jul', month: 'Jul', date: '2026-07-15', spec: 4, label: 'Super Relay™ GA', state: 'planned' },
  { id: 'm-aug', month: 'Aug', date: '2026-08-15', spec: 4, label: 'Launchpad™ GA', state: 'planned' },
  { id: 'm-sep', month: 'Sep', date: HANDOFF_DATE, spec: null, label: 'Roster handoff lock', state: 'planned' },
];

export const priorities = ['High', 'Med', 'Low'];
export const priorityColor = { High: '#fb7185', Med: '#ffc145', Low: '#605e58' };

// Optional starter content — a member can load this into their own workspace
// on first run (it INSERTS their own rows; nothing is auto-seeded).
export const starterTasks = [
  { title: 'Harden Launchpad routing and identity', spec: 4, priority: 'High' },
  { title: 'Resource isolation for untrusted student code', spec: 4, priority: 'High' },
  { title: 'Refresh Synonance curriculum index', spec: 3, priority: 'Med' },
  { title: 'Lock the master roster for the successor', spec: null, priority: 'Med' },
  { title: 'Reconcile spec count in bio (8 vs 11)', spec: null, priority: 'Low' },
];

// Relative offsets — resolved to real timestamps at insert time.
export const starterEvents = [
  { dayOffset: 0, time: '09:30', title: 'Launchpad spine hardening review', spec: 4, with_whom: null },
  { dayOffset: 0, time: '14:00', title: 'Launchpad isolation sync', spec: 4, with_whom: 'Jessica' },
  { dayOffset: 1, time: '10:00', title: 'Synonance RAG eval', spec: 3, with_whom: 'Pete' },
  { dayOffset: 3, time: '16:00', title: 'Roster handoff checkpoint', spec: null, with_whom: null },
];

// ── Date helpers ─────────────────────────────────────────────────────────────
export function daysUntil(dateStr) {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.round((target - now) / 86_400_000));
}

export function buildStarterEventRows(userId) {
  return starterEvents.map((e) => {
    const d = new Date();
    d.setDate(d.getDate() + e.dayOffset);
    const [h, m] = e.time.split(':').map(Number);
    d.setHours(h, m, 0, 0);
    return { user_id: userId, title: e.title, spec: e.spec, with_whom: e.with_whom, starts_at: d.toISOString() };
  });
}
