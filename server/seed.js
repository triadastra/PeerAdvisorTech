// ─────────────────────────────────────────────────────────────────────────
//  SEED — the groups/tasks members can apply to, and the timeline nodes
//  (steps) inside each. Mirrors the AI Central project tracks so the
//  workspace timeline reflects the real work. Nodes are the claimable steps:
//  a member picks one, hits "Work on it", and a 24h recruiting window opens.
//  Kept server-side and self-contained (no import from the front-end bundle).
// ─────────────────────────────────────────────────────────────────────────

// group = a project track. node = a claimable step on that track's timeline.
// `order` drives left→right position on the timeline.
export const trackSeed = [
  ...[
    { id: 'school-clubs', spec: 11, title: 'Club radar', category: 'School starter', blurb: 'Help classmates find their people. A directory for clubs, meetups, and trying something new.', color: '#bca7ff',
      steps: [['sketch', 'Sketch a club card', '30–45 min · Design · Ask a friend what they want to know about a club. Sketch a card with meeting time, location, and a contact.'], ['build', 'Build the club directory', '1–2 hours · Code · Render three sample clubs with a search box and interest filters. Make it work on a phone.'], ['test', 'Try it with classmates', '30 min · Test · Ask two classmates to find a club. Write down where they get stuck and improve one thing.']] },
    { id: 'school-lost-found', spec: 12, title: 'Lost & found', category: 'School starter', blurb: 'Reunite a water bottle with its human. Build a simple board for found items around school.', color: '#ffb97b',
      steps: [['sketch', 'Map the find-it flow', '30 min · Design · Sketch how someone searches for a lost item and contacts the school office to claim it.'], ['build', 'Make a searchable board', '1–2 hours · Code · Use sample items to build a board with item type and location filters. Keep personal contact details off public cards.'], ['test', 'Run a hallway test', '30 min · Test · Ask a friend to find a sample item on their phone. Check empty searches and make the next step clear.']] },
    { id: 'school-study', spec: 13, title: 'Study buddy', category: 'School starter', blurb: 'Less “what’s on the test?” More learning together. Make a shared revision resource shelf.', color: '#7ddbc6',
      steps: [['sketch', 'Plan a resource shelf', '30 min · Design · Choose one subject and sketch a resource card with topic, type, and a useful description.'], ['build', 'Build topic filters', '1–2 hours · Code · Add five sample resources and filter by topic. Include a friendly empty state and clear link labels.'], ['test', 'Learn from a classmate', '30 min · Test · Ask someone to find a resource for one topic. Check links and keyboard navigation, then fix one confusing part.']] },
  ].map(({ steps, ...track }) => ({ ...track, status: 'Ready to build', nodes: steps.map(([key, title, detail]) => ({ key, title, detail })) })),
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
    id: 'synonance', spec: 3, title: 'Academy', category: 'AI / ML', status: 'Production',
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
  // ── PLACEHOLDER ─────────────────────────────────────────────────────────
  // Study and Session mirror the stubs in src/data/projects.js. The single step
  // on each is scaffolding, not real work — replace it with the actual
  // claimable steps before pointing members at these tracks, because claiming a
  // node opens a 24h recruiting window and provisions a git repo for it.
  {
    id: 'study', spec: 9, title: 'Study', category: 'Education', status: 'Planned',
    blurb: 'TODO — one line on what Study does.',
    nodes: [
      { key: 'todo', title: 'TODO — first step', detail: 'Replace with the first claimable step on this track.' },
    ],
  },
  {
    id: 'session', spec: 10, title: 'Session', category: 'Platform', status: 'Planned',
    blurb: 'A home for academic labs and startups, with recruiting and scheduling tools.',
    nodes: [
      { key: 'todo', title: 'TODO — first step', detail: 'Replace with the first claimable step on this track.' },
    ],
  },
];

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
