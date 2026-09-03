// ─────────────────────────────────────────────────────────────────────────
//  PEOPLE — the single source of truth for the team.
//  Display order, class years, status, and spec leadership all live here.
//  Spec pages derive their teams from this file (teamForSpec), keeping project
//  membership and profile assignments in one source of truth. See CONTENT.md.
// ─────────────────────────────────────────────────────────────────────────

export const people = [
  {
    id: 'celsia-fan', name: 'Celsia Fan', year: '26', avatar: 'CF',
    status: 'active',
    trafficRoles: ['core', 'dev', 'affiliations'],
    title: 'Head, PA Tech · SHSID',
    leads: [
      { n: 1, role: 'Lead' },
      { n: 2, role: 'Lead' },
      { n: 3, role: 'Team' },
      { n: 4, role: 'Team' },
      { n: 5, role: 'Team' },
      { n: 6, role: 'Lead' },
      { n: 7, role: 'Team' },
    ],
    insights:
      'Founder and Technical Lead of PA Tech, building the SaaS and AIaaS layer used by SHSID’s Peer Advisor program.',
    headline:
      'Founder & Technical Lead, Peer Advisor Technology Department · AI product and technical leadership.',
    facts: [
      ['Full name', 'Celsia Fan · 樊汭琳'],
      ['Contact', 'celsiastarflare@outlook.com'],
      ['Organization', 'Shanghai High School International Division'],
      ['Current role', 'Founder & Technical Lead, PA Tech'],
      ['Class', 'SHSID · ’26'],
      ['Fields', 'Artificial intelligence, programming, research, and technical leadership'],
    ],
    bio: [
      'Celsia Fan founded and leads the Peer Advisor Technology Department, the technology arm of SHSID’s student-run outreach and support system. PA Tech builds the SaaS and AIaaS layer the program runs on.',
      'Her work focuses on AI products, technical systems, team building, and cross-functional delivery across school programs and external organizations.',
    ],
    cv: [
      { role: 'Founder & Technical Lead', org: 'Peer Advisor Technology Department, SHSID', period: 'May 2026 — present', detail: 'Founded the department and leads technology, HR, administration, and planning. Built its team structure, intake process, and roadmap; shipped seven internal tools used by 30+ students and staff.' },
      { role: 'Student Lead — Technical Specialist & Publications', org: 'SHSID Peer Advisor Program', period: 'Sep 2024 — May 2026', detail: 'Built AI transcription and flowchart tooling for interviews, video animation and subtitling tools, and publication layout systems.' },
      { role: 'Student Assistant', org: 'Shanghai High School International Division', period: 'Nov 2024 — Jun 2025', detail: 'Supported computer-science research guidance, PA lectures and workshops, tutoring, and project startup guidance.' },
      { role: 'Founder · Advisory role from May 2026', org: 'United AIGC Art Alliance', period: 'Mar 2023 — present', detail: 'Founded and grew an international AI-art community to 2,400 members and 10M+ aggregate views; published and maintained open image-model families and community licensing policy.' },
      { role: 'AI Product Lead', org: 'Indexademics', period: 'Apr 2024 — present', detail: 'Built Arcana and architected Synonance, covering product design, document indexing, RAG retrieval, agentic workflows, deployment, reliability, and infrastructure.' },
      { role: 'Quantitative Trading & Forecasting Intern', org: 'The Bank of East Asia', period: 'May 2026', detail: 'Led the project group and was named best intern. Built and compared systematic trading and forecasting approaches using Backtrader, ARIMA, XGBoost, LightGBM, GRU, and LSTM.' },
      { role: 'Technical Team Lead', org: 'Lung Ming Green Energy Technology Engineering Co. Ltd.', period: 'Feb 2026 — May 2026', detail: 'Led a website and information-architecture rebuild and scoped agentic AI platforms for internal operations.' },
      { role: 'Lead Technical Specialist', org: 'SHSID Sustainable Economics Club', period: 'Oct 2024 — May 2026' },
      { role: 'Laser Shooting (Rifle) Assistant Coach', org: 'SHSID Stallions', period: 'Feb 2023 — Apr 2025' },
      { role: 'Outreach Intern', org: 'Third Eye Foundation Nepal', period: 'Jul 2024 — Aug 2024' },
      { role: 'Student Intern', org: 'Alibaba Cloud', period: 'Jan 2024', detail: 'Designed Fiona, an architecture for real-time AI-generated 3D games and environments, with adaptive generation and two-stage content safety.' },
      { role: 'Lead Technical Specialist', org: 'SHSID ESL Outreach Group', period: 'Sep 2022 — Jun 2023' },
      { role: 'Journalist', org: 'SHSID News Team', period: 'Oct 2020 — Jun 2022' },
    ],
    focus: ['Artificial intelligence', 'Programming', 'Research', 'Product leadership', 'Community outreach'],
  },
  {
    id: 'gordon-huang', name: 'Gordon Huang', year: '28', avatar: 'GH',
    status: 'active',
    trafficRoles: ['core', 'dev', 'affiliations'],
    title: 'Lead — SharedSpace · Co-lead — Club Alliances',
    leads: [{ n: 5, role: 'Lead' }, { n: 4, role: 'Team' }, { n: 3, role: 'Team' }, { n: 1, role: 'Co-lead' }],
    insights:
      'An all-round developer and organizer working across web, media, design, infrastructure, logistics, and campus activities.',
    headline: 'All-round development and management — connecting technical delivery with campus activities and operations.',
    facts: [
      ['Full name', 'Gordon Huang · 黄子谦'],
      ['Class', 'SHSID · ’28'],
      ['Fields', 'Web development, media, design, IT, networking, and operations'],
    ],
    bio: [
      'Gordon Huang (Ziqian Huang) is an all-round developer and organizer who combines coding and web work with photography, video, graphics, IT, networking, and logistics.',
      'Within PA Tech, he leads SharedSpace’s club layer — founding, affiliation, and governance — and helps run activities and the teaching work around starting a club.',
    ],
    focus: ['Web development', 'Management', 'Photography & video', 'Design', 'IT & networking', 'Event operations'],
  },
  {
    id: 'pete-chen', name: 'Pete Chen', year: '27', avatar: 'PC',
    status: 'active',
    trafficRoles: ['core', 'dev', 'affiliations'],
    title: 'Lead — Synonance',
    leads: [{ n: 3, role: 'Lead' }, { n: 4, role: 'Team' }],
    insights: 'Leads Synonance, the retrieval-grounded study assistant.',
  },
  {
    id: 'brian-deng', name: 'Brian Deng', year: '27', avatar: 'BD',
    status: 'active',
    title: 'DataSci Outreach',
    leads: [{ n: 7, role: 'Team' }, { n: 8, role: 'Lead' }],
    insights: 'Builds the data-science outreach course and competition-learning resources.',
  },
  {
    id: 'rick-yu', name: 'Rick Yu', year: '29', avatar: 'RY',
    status: 'active',
    title: 'Data Lead — Launchpad',
    leads: [{ n: 4, role: 'Team' }, { n: 8, role: 'Lead' }],
    insights: 'Leads Launchpad’s shared data layer and competition question bank.',
  },
  {
    id: 'jessica-qin', name: 'Jessica Qin', year: '30', avatar: 'JQ',
    status: 'active',
    title: 'Co-lead — Launchpad',
    leads: [{ n: 4, role: 'Co-lead' }],
    insights: 'Co-leads Launchpad, the build-and-deploy platform that lets clubs ship their own apps.',
  },
  {
    id: 'christopher-jin', name: 'Christopher Jin', year: '29', avatar: 'CJ',
    status: 'active',
    title: 'Web & Operations',
    leads: [],
    insights: 'Works across web development, organizing, and logistics, with a strength in coordinating across students and teachers.',
    headline: 'Web developer and organizer focused on the social and operational side of shipping campus projects.',
    facts: [
      ['Full name', 'Christopher Jin · 金睿清'],
      ['Class', 'SHSID · ’29'],
      ['Fields', 'Coding, web development, organizing, and logistics'],
    ],
    bio: [
      'Christopher Jin is a web developer and organizer who contributes both technical work and the coordination needed to move projects through a school community.',
      'He is particularly interested in the social side of delivery: communicating with different students and teachers, handling logistics, and helping teams turn ideas into workable activities.',
    ],
    focus: ['Web development', 'Student coordination', 'Teacher liaison', 'Logistics'],
  },
  {
    id: 'will-chen', name: 'Will Chen', year: '28', avatar: 'WC',
    status: 'active',
    title: 'Systems, MLOps & Deep Learning',
    leads: [],
    insights: 'Builds and ships across systems, MLOps, backend, agentic software, deep-learning research, web, and Apple-platform applications.',
    headline: 'Systems and MLOps engineer working across deep learning, agentic software, deployment, security, and UX.',
    facts: [
      ['Full name', 'William Chen · 陈衢浩'],
      ['Class', 'SHSID · ’28'],
      ['GitHub', 'github.com/willuhd'],
      ['Fields', 'Systems, MLOps, backend, deep learning, agentic software, cybersecurity, and UX'],
    ],
    bio: [
      'Will Chen is a systems and machine-learning builder who likes hacking on difficult technical problems and turning the results into shipped software. His work spans MLOps, backend systems, agentic applications, web and Apple-platform frontends, cybersecurity, and deep-learning research and deployment.',
      'He also works in design, video, photography, and After Effects, bringing together infrastructure-level engineering and product-facing execution.',
    ],
    cv: [
      { role: 'Round 2 Gold · National Top 50', org: 'USA AI Olympiad', period: '2026', detail: 'Advanced to the second round held at MIT.' },
      { role: 'Top-accuracy solution', org: 'SHSID Hackathon', period: '2025', detail: 'Built scholarship-selection automation that was promoted for production use and evaluated real school scholarships.' },
      { role: 'Camera-ready presentation', org: 'ISWC / UbiComp Teenager Show', period: '2026', detail: 'VeraSight combines classical and deep-learning models to detect behavioral anomalies from facial micro-movements captured by iPhone TrueDepth, optimized for edge inference.' },
      { role: 'Round 2 qualifier', org: 'International AI Innovators Olympiad', period: '2026', detail: 'Qualified for the AI Innovators Challenge second round at MIT.' },
      { role: 'Presentation & technical production', org: 'SHSID Class of 2026 Graduation Ceremony', period: '2026', detail: 'Produced the talented-students segment with After Effects and supported its backend and technical delivery.' },
    ],
    recognition: [
      'USA AI Olympiad 2026 — Round 2 Gold, national top 50',
      'SHSID Hackathon 2025 — top-accuracy solution selected for production use',
      'ISWC / UbiComp 2026 Teenager Show — camera-ready presentation',
      'International AI Innovators Olympiad 2026 — Round 2 qualifier',
    ],
    focus: ['MLOps', 'Systems', 'Backend', 'Agentic software', 'Deep learning', 'Cybersecurity', 'Web & Apple platforms', 'UX & motion design'],
  },
  {
    id: 'jacen-wang', name: 'Jacen Wang', year: '26', avatar: 'JW',
    status: 'historical', trafficRoles: ['historical', 'core'], title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'melody-hua', name: 'Melody Hua', year: '26', avatar: 'MH',
    status: 'historical', trafficRoles: ['historical', 'core'], title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'frank-mao', name: 'Frank Mao', year: '26', avatar: 'FM',
    status: 'historical', title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'billy-jiang', name: 'Billy Jiang', year: '26', avatar: 'BJ',
    status: 'historical', title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'nick-wang', name: 'Nick Wang', year: '26', avatar: 'NW',
    status: 'historical', title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'cody-hsieh', name: 'Cody Hsieh', year: '26', avatar: 'CH',
    status: 'historical', title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'derek-shen', name: 'Derek Shen', year: '26', avatar: 'DS',
    status: 'historical', title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'kyle-gu', name: 'Kyle Gu', year: '26', avatar: 'KG',
    status: 'historical', title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'joseph-li', name: 'Joseph Li', year: '26', avatar: 'JL',
    status: 'historical', title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'nirvana-lu', name: 'Nirvana Lu', year: '26', avatar: 'NL',
    status: 'historical', title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
  {
    id: 'tony-wu', name: 'Tony Wu', year: '26', avatar: 'TW',
    status: 'historical', title: 'Inherited from StandardCAS™ SHSID', leads: [],
    insights: 'Historical team directory member inherited from StandardCAS™ SHSID.',
  },
];

// The team for a given spec number — derived, so leadership has one source.
export function teamForSpec(n) {
  const out = [];
  for (const p of people) {
    if (p.leads === 'all') {
      out.push({ name: p.name, role: 'Lead', avatar: p.avatar });
    } else if (Array.isArray(p.leads)) {
      const m = p.leads.find((l) => l.n === n);
      if (m) out.push({ name: p.name, role: m.role, avatar: p.avatar });
    }
  }
  return out;
}
