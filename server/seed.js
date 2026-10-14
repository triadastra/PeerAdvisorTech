// ─────────────────────────────────────────────────────────────────────────
//  SEED — the groups/tasks members can apply to, and the timeline nodes
//  (steps) inside each. Mirrors the AI Central project tracks so the
//  workspace timeline reflects the real work. Nodes are the claimable steps:
//  a member picks one, hits "Work on it", and a 24h recruiting window opens.
//  Kept server-side and self-contained (no import from the front-end bundle).
// ─────────────────────────────────────────────────────────────────────────

// group = a project track. node = a claimable step on that track's timeline.
// `order` drives left→right position on the timeline.
// Tracks mirror the seven AI Central specs on the public site; edit here when
// the roadmap changes. Steps are deliberately small — one sitting to one week.
export const trackSeed = [
  {
    id: 'fyona', spec: 2, title: 'Fyona®', category: 'Platform', status: 'Production',
    blurb: 'The AI magazine & layout studio. Live preview, an AI layout agent, and print-ready export.',
    nodes: [
      { key: 'editor-polish', title: 'Editor UX polish', detail: 'Smooth out the live-preview layout editor: selection states, drag handles, and keyboard shortcuts.' },
      { key: 'layout-agent', title: 'Layout agent prompts', detail: 'Tune the AI layout agent’s prompts and constraints so drafts need less manual fixing.' },
      { key: 'export-pipeline', title: 'Export pipeline', detail: 'Harden CMYK-PDF / HTML5 export: fonts, bleed, and page-break edge cases.' },
      { key: 'load-testing', title: 'Load & perf pass', detail: 'Profile the studio under real traffic and cut the biggest rendering bottlenecks.' },
    ],
  },
  {
    id: 'academy', spec: 3, title: 'Academy', category: 'AI / ML', status: 'Production',
    blurb: 'The RAG study chatbot grounded in real curriculum and IB mock exams.',
    nodes: [
      { key: 'index-refresh', title: 'Curriculum index refresh', detail: 'Re-index this semester’s curriculum and mock exams into the retrieval store.' },
      { key: 'rag-eval', title: 'RAG quality eval', detail: 'Build a small eval set of real student questions and measure answer grounding.' },
      { key: 'tier-tuning', title: 'Response tier tuning', detail: 'Balance Fast / Standard / Pro / Max tiers for speed, depth, and token cost.' },
      { key: 'chat-ux', title: 'Chat UX improvements', detail: 'Citations, follow-up suggestions, and a cleaner reading experience in the chat UI.' },
    ],
  },
  {
    id: 'launchpad', spec: 4, title: 'Launchpad™', category: 'Platform', status: 'Pre-launch',
    blurb: 'The unified build-deploy-host platform — Git, PTY, Docker, and The Spine beneath it.',
    nodes: [
      { key: 'deploy-pipeline', title: 'Deploy pipeline hardening', detail: 'Stress-test the Git → build → Docker deploy path and surface better failure messages.' },
      { key: 'isolation-audit', title: 'Isolation audit', detail: 'Review container resource limits and network rules for untrusted student code.' },
      { key: 'spine-telemetry', title: 'Spine telemetry', detail: 'Wire routing + usage telemetry with PII stripping across model providers.' },
      { key: 'docs-onboarding', title: 'Onboarding docs', detail: 'Write the “ship your first app” guide clubs will follow at launch.' },
    ],
  },
  {
    id: 'sharedspace', spec: 5, title: 'SharedSpace', category: 'Community', status: 'In development',
    blurb: 'The people-and-clubs layer: a searchable talent directory plus Club Gateway.',
    nodes: [
      { key: 'directory-search', title: 'Directory search', detail: 'Skill-based search across the student directory: indexing, filters, and ranking.' },
      { key: 'club-gateway', title: 'Club Gateway flow', detail: 'The founding → affiliating → operating flow for clubs, with governance templates.' },
      { key: 'profiles-mvp', title: 'Profile pages MVP', detail: 'Student profile pages that make talent discoverable across campus.' },
    ],
  },
  {
    id: 'careerplanner', spec: 6, title: 'CareerPlanner', category: 'Education', status: 'In development',
    blurb: 'Connect what students study now to where they want to go next.',
    nodes: [
      { key: 'path-data', title: 'Pathway data model', detail: 'Model coursework → skills → career paths as queryable data.' },
      { key: 'planner-ui', title: 'Planner UI prototype', detail: 'The student-facing exploration interface: browse paths, save a plan.' },
      { key: 'content-pass', title: 'Content pass', detail: 'Write and review the guidance content for the first set of paths.' },
    ],
  },
  {
    id: 'study', spec: 9, title: 'Study', category: 'Education', status: 'Planned',
    blurb: 'A planned study companion — currently being scoped.',
    nodes: [
      { key: 'scoping', title: 'Product scoping', detail: 'Interview students, define what Study is (and is not), and write the one-page spec.' },
      { key: 'prototype', title: 'Prototype v0', detail: 'A throwaway prototype to test the core loop with real students.' },
    ],
  },
  {
    id: 'session', spec: 10, title: 'Session', category: 'Platform', status: 'Planned',
    blurb: 'A home for academic labs and startups, with recruiting and scheduling tools.',
    nodes: [
      { key: 'requirements', title: 'Requirements & research', detail: 'Talk to lab and startup leads; collect the recruiting and scheduling pain points.' },
      { key: 'recruiting-mvp', title: 'Recruiting MVP', detail: 'Post an opening, collect applications, review candidates — the smallest useful version.' },
      { key: 'scheduling', title: 'Scheduling tools', detail: 'Shared availability and meeting scheduling built on the MVP.' },
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
