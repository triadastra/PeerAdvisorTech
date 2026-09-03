// ─────────────────────────────────────────────────────────────────────────
//  PROJECTS — the public-facing roster (AI Central).
//  Sanitized: internal details (pricing, ownership, infra cost, security
//  status) live only in the handoff doc, never here.
//  Team/leadership is NOT stored here — it derives from ./people.js
//  (teamForSpec) so there is a single source of truth. See CONTENT.md.
//
//  Spec numbers are stable IDs, not positions: they stay attached to a
//  project for life so people.js `leads` keep pointing at the right work.
//  Gaps in the sequence are expected when a spec is retired.
// ─────────────────────────────────────────────────────────────────────────

export const projects = [
  {
    id: 'fyona',
    spec: 1,
    title: 'Fyona®',
    caption: 'An AI magazine & layout studio — design, preview, export.',
    category: 'Platform',
    tier: 'Core',
    affiliation: 'PA Journalism × StandardCAS™',
    status: 'Production',
    bio: 'Our flagship and the platform’s load leader. Fyona is an HTML-based AI magazine and layout studio — a faster alternative to general design tools — with live preview, an AI layout agent, and professional export. It carries the majority of platform traffic.',
    techStack: ['HTML5', 'AI layout agent', 'CMYK / PDF export', 'StandardCAS'],
    highlights: [
      'Saves ~84 hrs/person each semester on layout',
      'Live preview with an AI layout agent',
      'Exports CMYK-PDF, HTML5, and slides',
    ],
    workDescriptions: [
      { title: 'Live layout studio', description: 'A browser-native editor with real-time preview, so authors see the finished page as they work.' },
      { title: 'AI layout agent', description: 'An agent that drafts and refines layouts, cutting manual design time dramatically.' },
      { title: 'Professional export', description: 'One-click export to print-ready CMYK-PDF, HTML5, and slide formats.' },
    ],
  },
  {
    id: 'synonance',
    spec: 2,
    title: 'Academy',
    caption: 'A RAG study chatbot grounded in real curriculum.',
    category: 'AI / ML',
    tier: 'Core',
    affiliation: 'StandardCAS™',
    status: 'Production',
    bio: 'A retrieval-grounded study assistant (“Syno”) built on a custom Super RAG + MCP pipeline. It is grounded in real school curriculum and IB mock exams, and answers across tiered speeds and depths so students get the right level of help.',
    techStack: ['Qwen-3.6', 'Super RAG', 'MCP', 'GCP'],
    highlights: [
      '~84% token reduction via a custom Super RAG pipeline',
      'Grounded in curriculum and IB mock exams',
      'Tiered Fast / Standard / Pro / Max responses',
    ],
    workDescriptions: [
      { title: 'Super RAG pipeline', description: 'A custom retrieval + MCP pipeline that grounds answers in source material while cutting token usage by ~84%.' },
      { title: 'Curriculum grounding', description: 'Indexed real curriculum and IB mock exams so guidance maps to what students are actually studying.' },
      { title: 'Tiered responses', description: 'Fast, Standard, Pro, and Max tiers balance speed, depth, and cost per question.' },
    ],
  },
  {
    id: 'launchpad',
    spec: 4,
    title: 'Launchpad™',
    caption: 'Ship your club’s app — build, deploy, host.',
    category: 'Platform',
    tier: 'Core',
    affiliation: 'StandardCAS™',
    status: 'Pre-launch',
    bio: 'A build-and-deploy system that lets clubs ship their own applications, with Git, an interactive terminal, and containerized environments. Because it runs student-authored code, it is built around full resource isolation.',
    techStack: ['Docker', 'Git', 'PTY', 'CI/CD'],
    highlights: [
      'Git, PTY, and Docker-based deploys',
      'Full resource isolation for untrusted code',
      'Lets clubs build and host their own apps',
    ],
    workDescriptions: [
      { title: 'Build & deploy', description: 'A Netlify-style pipeline with Git, an interactive PTY, and Docker so clubs can ship apps end to end.' },
      { title: 'Resource isolation', description: 'Every app runs fully isolated, since the platform executes untrusted student code.' },
    ],
  },
  {
    id: 'sharedspace',
    spec: 5,
    title: 'SharedSpace',
    caption: 'A searchable directory of student talent.',
    category: 'Community',
    tier: 'Core',
    affiliation: 'StandardCAS™',
    status: 'In development',
    bio: 'A talent directory that makes skilled students discoverable — the person axis of AI Central. A searchable index built to surface the right people for the right work, at scale.',
    techStack: ['Search', 'Directory'],
    workDescriptions: [
      { title: 'Talent directory', description: 'A searchable index that surfaces students by skill, making talent discoverable across campus.' },
      { title: 'Built for scale', description: 'Designed as a directory rather than a manual connector so it stays useful as it grows.' },
    ],
  },
  {
    id: 'careerplanner',
    spec: 8,
    title: 'CareerPlanner',
    caption: 'Plan a path from coursework to career.',
    category: 'Education',
    tier: 'Core',
    affiliation: 'StandardCAS™',
    status: 'In development',
    bio: 'A student-facing career exploration tool that helps students connect what they study now to where they want to go next.',
    techStack: ['StandardCAS'],
    workDescriptions: [
      { title: 'Career exploration', description: 'Guides students from coursework toward concrete career paths and next steps.' },
    ],
  },
  // ── PLACEHOLDER ─────────────────────────────────────────────────────────
  // Study and Session are stubs: title and spec number are real, the rest is
  // scaffolding to fill in. Category and status below are guesses — set them
  // before this goes public. See CONTENT.md.
  {
    id: 'study',
    spec: 9,
    title: 'Study',
    caption: 'TODO — one line on what Study does.',
    category: 'Education',
    status: 'Planned',
    bio: 'TODO — a short paragraph on what Study is, who it is for, and why it exists.',
    techStack: [],
    workDescriptions: [],
  },
  {
    id: 'session',
    spec: 10,
    title: 'Session',
    caption: 'TODO — one line on what Session does.',
    category: 'Education',
    status: 'Planned',
    bio: 'TODO — a short paragraph on what Session is, who it is for, and why it exists.',
    techStack: [],
    workDescriptions: [],
  },
];

// Per-spec colors — used by the chromatic SpecRing on team pages.
// Keyed by spec number (stable across retirements), ordered as a spectrum so
// the live specs read as a gradient when lit together. Retired spec numbers
// keep their color in case the spec returns.
export const specColors = {
  0: '#ff5a5f',
  1: '#ff8c42',
  2: '#ffc145',
  3: '#c8f135',
  4: '#4ade80',
  5: '#2dd4bf',
  6: '#38bdf8',
  7: '#6366f1',
  8: '#a855f7',
  9: '#e879f9',
  10: '#fb7185',
};

// Leads pointing at a retired spec are dropped, so the UI never renders a
// dangling reference when a project leaves the roster above.
const LIVE_SPECS = new Set(projects.map((p) => p.spec));
export const liveLeads = (person) =>
  Array.isArray(person.leads) ? person.leads.filter((l) => LIVE_SPECS.has(l.n)) : [];
