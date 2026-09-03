// ─────────────────────────────────────────────────────────────────────────
//  PROJECTS — the public-facing roster (AI Central, Projects 01–08).
//  Sanitized: internal details (pricing, ownership, infra cost, security
//  status) live only in the handoff doc, never here.
//  Team/leadership is NOT stored here — it derives from ./people.js
//  (teamForSpec) so there is a single source of truth. See CONTENT.md.
// ─────────────────────────────────────────────────────────────────────────

export const projects = [
  {
    id: 'club-alliances',
    spec: 1,
    title: 'Club Alliances',
    caption: 'Club-to-club alliances under mutual-benefit MOUs.',
    category: 'Community',
    status: 'Active',
    bio: 'The outer alliance layer of AI Central. Recruited clubs join under mutual-benefit MOU trade agreements — low-dependency cooperation rather than commercial contracts. It is the club-to-club coordination layer that connects organizations across campus.',
    techStack: ['MOU framework', 'Club coordination'],
    workDescriptions: [
      { title: 'Alliance model', description: 'Designed a mutual-benefit MOU structure that lets clubs cooperate without commercial lock-in.' },
      { title: 'Coordination layer', description: 'A club-level network — the connective tissue between organizations, distinct from the person-level directory.' },
    ],
  },
  {
    id: 'fyona',
    spec: 2,
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
    spec: 3,
    title: 'Synonance',
    caption: 'A RAG study chatbot grounded in real curriculum.',
    category: 'AI / ML',
    tier: 'Core',
    affiliation: 'StandardCAS™',
    status: 'Production',
    teamOrder: ['Celsia Fan', 'Pete Chen', 'Gordon Huang'],
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
    caption: 'Build, deploy, host, route, and store — one platform.',
    category: 'Platform',
    tier: 'Core',
    affiliation: 'StandardCAS™',
    status: 'Pre-launch',
    teamOrder: ['Celsia Fan', 'Rick Yu', 'Pete Chen', 'Gordon Huang', 'Jessica Qin'],
    bio: 'The unified application platform for AI Central: build-and-deploy tooling, The Spine’s routing and identity infrastructure, and the shared database layer. Clubs can ship isolated applications while the platform handles model routing, telemetry, privacy, user data, and competition content behind the scenes.',
    techStack: ['Docker', 'Git', 'PTY', 'CI/CD', 'API gateway', 'Multi-LLM routing', 'Shared data'],
    highlights: [
      'Git, PTY, and Docker-based deploys',
      'Full resource isolation for untrusted code',
      'Routes across 8 model providers plus search and email',
      'Shared user data and competition question bank',
    ],
    workDescriptions: [
      { title: 'Build & deploy', description: 'A Netlify-style pipeline with Git, an interactive PTY, and Docker so clubs can ship apps end to end.' },
      { title: 'Resource isolation', description: 'Every app runs fully isolated, since the platform executes untrusted student code.' },
      { title: 'The Spine', description: 'Integrated routing, identity, telemetry, PII stripping, and privacy-first aggregate reporting across model providers and services.' },
      { title: 'Database', description: 'A shared data layer for platform user data and the competition question bank spanning IOAI, CSP, NOIP, IOI, AMC, AIME, and related contests.' },
    ],
  },
  {
    id: 'sharedspace',
    spec: 5,
    title: 'SharedSpace',
    caption: 'Discover people, found clubs, and run them well.',
    category: 'Community',
    tier: 'Core',
    affiliation: 'StandardCAS™',
    status: 'In development',
    bio: 'The people-and-clubs layer of AI Central. SharedSpace combines a searchable student talent directory with Club Gateway’s tools and guidance for founding, affiliating, and operating campus clubs.',
    techStack: ['Search', 'Directory', 'Club governance', 'Launchpad'],
    workDescriptions: [
      { title: 'Talent directory', description: 'A searchable index that surfaces students by skill, making talent discoverable across campus.' },
      { title: 'Built for scale', description: 'Designed as a directory rather than a manual connector so it stays useful as it grows.' },
      { title: 'Club Gateway', description: 'Guidance and governance tools for starting a club, running it well, and moving through affiliation.' },
      { title: 'Built on Launchpad', description: 'The club gateway ships on the studio’s own application platform.' },
    ],
  },
  {
    id: 'careerplanner',
    spec: 6,
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
  {
    id: 'datasci-outreach',
    spec: 7,
    title: 'DataSci Outreach',
    caption: 'A hands-on data-science outreach course.',
    category: 'Education',
    status: 'Planned',
    bio: 'A data-science teaching and outreach course that brings practical skills to more students. It deploys on Launchpad, so it follows once that platform opens.',
    techStack: ['Data science', 'Curriculum'],
    workDescriptions: [
      { title: 'Outreach curriculum', description: 'A hands-on course built to teach data science and widen access to it.' },
    ],
  },
  {
    id: 'competition-lists',
    spec: 8,
    title: 'Competition Lists',
    caption: 'Curated competition lists and prep.',
    category: 'Education',
    status: 'In development',
    teamOrder: ['Brian Deng', 'Rick Yu'],
    bio: 'The competition-facing surface of the studio: curated lists and preparation for the contests the question bank feeds. What students actually browse and use to get ready.',
    techStack: ['Curation', 'Prep'],
    workDescriptions: [
      { title: 'Curated lists', description: 'Hand-curated competition lists that point students to the right contests.' },
      { title: 'Prep surface', description: 'The student-facing front end for preparation, backed by the shared question bank.' },
    ],
  },
];

// Per-spec colors — used by the chromatic SpecRing on team pages.
// Ordered as a spectrum, so all 11 lit together read as a rainbow.
export const specColors = {
  1: '#ff5a5f',
  2: '#ff8c42',
  3: '#ffc145',
  4: '#4ade80',
  5: '#2dd4bf',
  6: '#38bdf8',
  7: '#a855f7',
  8: '#fb7185',
};
