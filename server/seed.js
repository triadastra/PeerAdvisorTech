// ─────────────────────────────────────────────────────────────────────────
//  SEED — the groups/tasks members can apply to, and the timeline nodes
//  (steps) inside each. Mirrors the AI Central project tracks so the
//  workspace timeline reflects the real work. Nodes are the claimable steps:
//  a member picks one, hits "Work on it", and a 24h recruiting window opens.
//  Kept server-side and self-contained (no import from the front-end bundle).
// ─────────────────────────────────────────────────────────────────────────

// group = a project track. node = a claimable step on that track's timeline.
// `order` drives left→right position on the timeline.
// Projects are published by admins; no demonstration tracks are shipped.
export const trackSeed = [];

// Per-spec colors — mirrors src/data/projects.js so the timeline stays in sync.
export const specColors = {
  1: '#ff5a5f', 2: '#ff8c42', 3: '#ffc145', 4: '#4ade80',
  5: '#2dd4bf', 6: '#38bdf8', 7: '#a855f7', 8: '#fb7185',
  9: '#e879f9', 10: '#c8f135',
};

// Flattened, client-ready track list with node ids + colors.
export function buildTracks() {
  return trackSeed.map((t) => ({
    id: t.id,
    spec: t.spec,
    title: t.title,
    category: t.category,
    status: t.status,
    blurb: t.blurb,
    color: t.color || specColors[t.spec] || '#605e58',
    nodes: t.nodes.map((n, i) => ({
      id: `${t.id}:${n.key}`,
      key: n.key,
      title: n.title,
      detail: n.detail,
      order: i,
    })),
  }));
}
