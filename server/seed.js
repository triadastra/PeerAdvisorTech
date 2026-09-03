// ─────────────────────────────────────────────────────────────────────────
//  SEED — the groups/tasks members can apply to, and the timeline nodes
//  (steps) inside each. Mirrors the eight AI Central projects so the
//  workspace timeline reflects the real work. Nodes are the claimable steps:
//  a member picks one, hits "Work on it", and a 24h recruiting window opens.
//  Kept server-side and self-contained (no import from the front-end bundle).
// ─────────────────────────────────────────────────────────────────────────

// group = a project track. node = a claimable step on that track's timeline.
// `order` drives left→right position on the timeline.
export const trackSeed = [
  {
    id: 'fyona', spec: 2, title: 'Fyona®', category: 'Platform', status: 'Production',
    blurb: 'AI magazine & layout studio — design, preview, export.',
    nodes: [
      { key: 'live-studio', title: 'Live layout studio', detail: 'Browser-native editor with real-time preview.' },
      { key: 'ai-layout', title: 'AI layout agent', detail: 'Agent that drafts and refines layouts.' },
      { key: 'export', title: 'Professional export', detail: 'CMYK-PDF, HTML5, and slide export.' },
    ],
  },
  {
    id: 'synonance', spec: 3, title: 'Synonance', category: 'AI / ML', status: 'Production',
    blurb: 'RAG study chatbot grounded in real curriculum.',
    nodes: [
      { key: 'super-rag', title: 'Super RAG pipeline', detail: 'Retrieval + MCP pipeline, ~84% fewer tokens.' },
      { key: 'grounding', title: 'Curriculum grounding', detail: 'Index curriculum and IB mock exams.' },
      { key: 'tiers', title: 'Tiered responses', detail: 'Fast / Standard / Pro / Max answer tiers.' },
    ],
  },
  {
    id: 'launchpad', spec: 4, title: 'Launchpad™', category: 'Platform', status: 'Pre-launch',
    blurb: 'Build, deploy, host, route, and store — one platform.',
    nodes: [
      { key: 'build-deploy', title: 'Build & deploy', detail: 'Git + PTY + Docker deploy pipeline.' },
      { key: 'isolation', title: 'Resource isolation', detail: 'Sandbox untrusted student code.' },
      { key: 'spine', title: 'The Spine', detail: 'Routing, identity, telemetry, privacy.' },
      { key: 'database', title: 'Shared database', detail: 'Platform data + competition question bank.' },
    ],
  },
  {
    id: 'sharedspace', spec: 5, title: 'SharedSpace', category: 'Community', status: 'In development',
    blurb: 'Discover people, found clubs, and run them well.',
    nodes: [
      { key: 'directory', title: 'Talent directory', detail: 'Searchable index of students by skill.' },
      { key: 'club-gateway', title: 'Club Gateway', detail: 'Tools to found, affiliate, and run clubs.' },
    ],
  },
  {
    id: 'careerplanner', spec: 6, title: 'CareerPlanner', category: 'Education', status: 'In development',
    blurb: 'Plan a path from coursework to career.',
    nodes: [
      { key: 'exploration', title: 'Career exploration', detail: 'Map coursework to concrete career paths.' },
    ],
  },
  {
    id: 'competition-lists', spec: 8, title: 'Competition Lists', category: 'Education', status: 'In development',
    blurb: 'Curated competition lists and prep.',
    nodes: [
      { key: 'curated', title: 'Curated lists', detail: 'Hand-curated lists pointing to the right contests.' },
      { key: 'prep', title: 'Prep surface', detail: 'Student-facing prep backed by the question bank.' },
    ],
  },
];

// Per-spec colors — mirrors src/data/projects.js so the timeline stays in sync.
export const specColors = {
  1: '#ff5a5f', 2: '#ff8c42', 3: '#ffc145', 4: '#4ade80',
  5: '#2dd4bf', 6: '#38bdf8', 7: '#a855f7', 8: '#fb7185',
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
    color: specColors[t.spec] || '#605e58',
    nodes: t.nodes.map((n, i) => ({
      id: `${t.id}:${n.key}`,
      key: n.key,
      title: n.title,
      detail: n.detail,
      order: i,
    })),
  }));
}
