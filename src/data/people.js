// ─────────────────────────────────────────────────────────────────────────
//  PEOPLE — the single source of truth for the team.
//  Display order, class years, status, and spec leadership all live here.
//  Spec pages DERIVE their team from this file (teamForSpec), so "Celsia
//  leads everything" stays true automatically. See CONTENT.md.
// ─────────────────────────────────────────────────────────────────────────

export const people = [
  {
    id: 'celsia-fan', name: 'Celsia Fan', year: '26', avatar: 'CF',
    status: 'active',
    title: 'Head, PA Tech · SHSID',
    leads: 'all',
    insights:
      'Founder and Head of PA Tech and the architect of AI Central — she leads every spec and owns the platform’s architecture, the StandardCAS-native core, and the roadmap.',
    headline:
      'Student technologist and AI/ML researcher — Legacy Founder and Head of the PA Tech Department at SHSID, and principal architect of AI Central.',
    facts: [
      ['Full name', 'Osmond Fan'],
      ['Also known as', 'Celsia · Celsia Starflare'],
      ['Organization', 'StandardCAS™ / PA Tech, SHSID'],
      ['Active', 'Founder since 2019'],
      ['Education', 'SHSID (Class of 2026); HKU, AI & Data Science (from 2026)'],
      ['Fields', 'AI, machine learning, systems & infrastructure, data science'],
      ['Known for', 'PA Tech & AI Central; Super Relay™; Synonance®; United AIGC Art Alliance'],
    ],
    bio: [
      'Celsia Fan (Osmond Fan) is a student technologist, AI and machine-learning researcher, and the Legacy Founder and active Head of the PA Tech Department at Shanghai High School International Division (SHSID).',
      'She founded StandardCAS™ in 2019 and developed it into AI Central, a student-run AI-as-a-Service platform that serves the SHSID club ecosystem at near-zero cost to the school, and is the principal architect of its systems — including the Super Relay™ gateway and the Synonance® study platform. She is also a published researcher and the founder of the United AIGC Art Alliance, a community of more than 1,600 members.',
    ],
    sections: [
      {
        title: 'Background',
        body: [
          'Fan founded StandardCAS™ in 2019 as a coalition for sharing technical project resources and has led it continuously since. Early work spanned independent AI research and online community-building: in 2023 she authored CELSIA, a computer-vision-enhanced lightweight system for interface automation (ConfMLA 2023), and in 2024 CelsiaNet, a multimodal vision-language framework that achieved measurable gains over leading models at the St. Yau Research Competition. In parallel she founded the United AIGC Art Alliance, which grew into a community of over 1,600 members.',
        ],
      },
      {
        title: 'PA Tech & AI Central',
        body: [
          'As Head of PA Tech — SHSID’s student-run technical department — Fan leads the design, engineering, and operation of AI Central, the department’s flagship AI-as-a-Service platform for the campus club ecosystem: Fyona® (AI layout studio), Synonance® (a RAG study chatbot on Qwen-3.6 with a custom Super RAG + MCP pipeline at ~84% token reduction), The Spine (identity, telemetry, and routing across eight AI providers with privacy-first, aggregate-only reporting), Launchpad™ (isolated build-and-deploy for student code), and the student-facing directory, governance, competition-prep, and career specs.',
          'The platform runs on a single server with self-healing agents, per-team database isolation, automated CI/CD, and a data-return mechanism for exiting teams. She also leads its governance — a three-party Memorandum of Understanding between PA Tech, Indexademics, and the PA Review Team — and the central club-coordination (社联会) role. She previously served as Lead Technology Developer for the SHSID Peer Advisor Department (2024–2025).',
        ],
      },
      {
        title: 'Research',
        body: [
          'Fan is the team leader and corresponding author of “Multidimensional Time Series Forecasting using State Space Models,” accepted to WCTRS 2026 in Toulouse, completed through the MIT | NISCI AI and Logistics program. Her earlier first-authored research — CelsiaNet (multimodal vision-language) and CELSIA (interface automation) — reported improvements over state-of-the-art baselines and earned the St. Yau Research Competition Bronze Medal. She has also held research-leadership roles at the University of Nanjing (lithium-sulfide battery development) and Alibaba Cloud (AI gaming-system frameworks), earning individual distinctions at both.',
        ],
      },
      {
        title: 'Community & outreach',
        body: [
          'Through the United AIGC Art Alliance, Fan has led a global creative-technical community of 1,600+ members, ranked #17 on the CIVITAI Background Legend Leaderboard with over 10M community views. She has directed resources back into the community — funding and mentoring content creators (one grown from 1,000 to 30,000 followers) and organizing crisis-response and donation initiatives.',
        ],
      },
      {
        title: 'Teaching & mentorship',
        body: [
          'Fan returned to the MIT | NISCI program as a teaching assistant after attending as a student, and taught programming and led a research team in Kathmandu, Nepal, through the Third Eye Foundation. Within SHSID she has mentored for the STEAM / AIML department and served as a long-term writer and interviewer for the Peer Advisor Department. She has also volunteered as an ESL teacher for rural China and Hebei students and in environmental programs.',
        ],
      },
    ],
    cv: [
      { role: 'Legacy Founder', org: 'StandardCAS™', period: '2019 — present' },
      { role: 'Head', org: 'PA Tech Department, SHSID', period: 'current' },
      { role: 'Principal Architect', org: 'AI Central platform', period: 'current' },
      { role: 'Club Coordination (社联会)', org: 'Campus club ecosystem', period: 'current' },
      { role: 'Lead Technology Developer', org: 'SHSID Peer Advisor Department', period: '2024 — 2025' },
      { role: 'Founder', org: 'United AIGC Art Alliance', period: '2023 — present' },
      { role: 'Team Leader & Corresponding Author', org: 'WCTRS 2026', period: '2025' },
      { role: 'Teaching Assistant', org: 'MIT | NISCI program', period: '2025' },
      { role: 'AIML Mentor Assistant', org: 'SHSID STEAM Department', period: '2024 — 2025' },
      { role: 'Coach Assistant', org: 'SHSID Stallions Laser Shooting (Rifle Section) Team', period: 'current' },
    ],
    recognition: [
      'MIT | NISCI 2025 Outstanding Performance Award',
      'SHSID 2025 Scholar Award in Computer Science',
      'St. Yau 2024 — China 1st Prize & Global Bronze',
      'NOAI 2024 — China 2nd Prize (Merit)',
      'UKCC 2025 — Level D Perfect Score',
      'Shanghai Provincial Laser Rifle — Individual #2 (2025)',
    ],
    focus: ['Artificial intelligence', 'Machine learning', 'Systems & infrastructure', 'Data science'],
  },
  {
    id: 'gordon-huang', name: 'Gordon Huang', year: '28', avatar: 'GH',
    status: 'active',
    title: 'Lead — Club Gateway · Co-lead — Club Alliances',
    leads: [{ n: 6, role: 'Lead' }, { n: 0, role: 'Co-lead' }],
    insights:
      'Owns the club layer — founding, affiliation, and governance — plus the teaching department on how to start a club.',
  },
  {
    id: 'pete-chen', name: 'Pete Chen', year: '27', avatar: 'PC',
    status: 'active',
    title: 'Lead — Synonance',
    leads: [{ n: 2, role: 'Lead' }],
    insights: 'Leads Synonance, the retrieval-grounded study assistant.',
  },
  {
    id: 'brian-deng', name: 'Brian Deng', year: '27', avatar: 'BD',
    status: 'active',
    title: 'Lead — Database',
    leads: [{ n: 7, role: 'Lead' }],
    insights: 'Leads the shared data layer and the competition question bank.',
  },
  {
    id: 'rick-yu', name: 'Rick Yu', year: '29', avatar: 'RY',
    status: 'active',
    title: 'Lead — Database',
    leads: [{ n: 7, role: 'Lead' }],
    insights: 'Leads the shared data layer and the competition question bank.',
  },
  {
    id: 'jessica-qin', name: 'Jessica Qin', year: '30', avatar: 'JQ',
    status: 'active',
    title: 'Co-lead — Launchpad',
    leads: [{ n: 4, role: 'Co-lead' }],
    insights: 'Co-leads Launchpad, the build-and-deploy platform that lets clubs ship their own apps.',
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
