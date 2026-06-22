// ─────────────────────────────────────────────────────────────────────────
//  SITE CONTENT — edit this file to update text & links across the whole site.
//  Projects live in ./projects.js; people live in ./people.js. See CONTENT.md.
// ─────────────────────────────────────────────────────────────────────────

import { projects } from './projects';
import { people } from './people';

export const site = {
  name: 'Peer Advisor Tech Department',
  shortName: 'PATD',
  founded: 2022,

  // Hero
  kicker: 'AI Central · Student Engineering Studio',
  headline: ['We build the software', 'student life runs on.'],
  lede:
    'Peer Advisor Tech Department is a student-run engineering studio. AI Central is what we’ve built: eleven connected projects — from an AI design studio to the infrastructure beneath them — shipping production software the whole campus uses, and training the people who build it.',

  // Top navigation. Items with `route` navigate; items with `target` scroll to a
  // section on the home page.
  nav: [
    { label: 'Work', target: 'work' },
    { label: 'Team', route: '/team' },
    { label: 'About', target: 'about' },
    { label: 'Join', route: '/join' },
  ],

  // Capabilities (#about) — the five disciplines across the studio.
  capabilities: {
    heading: 'What we build',
    blurb:
      'Full-stack product engineering across the studio — from a single AI editor to the platform and infrastructure beneath it. Eleven projects, one network.',
    items: [
      { title: 'Platform', text: 'Creative and developer platforms — an AI layout studio, and a system for clubs to build and ship their own apps.' },
      { title: 'AI / ML', text: 'Retrieval-grounded assistants and agents, tuned for real curriculum and real student workflows.' },
      { title: 'Infrastructure', text: 'The routing, identity, data, and telemetry backbone every project runs on.' },
      { title: 'Community', text: 'Alliances, a talent directory, and club governance that connect students and clubs across campus.' },
      { title: 'Education', text: 'Career planning, competition prep, and outreach courses that help students grow.' },
    ],
  },

  // Closing / contact (#contact)
  contact: {
    heading: ['Have a project,', 'or want to build with us?'],
    blurb:
      'We take on campus partnerships and onboard new members every semester. No résumé required — bring the curiosity.',
    primary: { label: 'Start a conversation', href: 'mailto:patech@standardcas.org?subject=Working%20with%20AI%20Central' },
    secondary: { label: 'Become a member', to: '/join' },
    links: [
      { label: 'Email', value: 'patech@standardcas.org', href: 'mailto:patech@standardcas.org' },
      { label: 'GitHub', value: 'github.com/peer-advisor-tech', href: 'https://github.com/peer-advisor-tech' },
      { label: 'SharedSpace', value: 'ss.standardcas.org', href: 'https://ss.standardcas.org' },
    ],
  },

  footerNote: 'A student-run engineering studio — the team behind AI Central.',
  footerCredit: 'Powered by StandardCAS™',
};

// ─── Derived, honest stats (computed from real data — never hardcode counts) ──
const categories = new Set(projects.map((p) => p.category));
const yearsActive = Math.max(1, new Date().getFullYear() - site.founded);

export const siteStats = [
  { value: projects.length, label: 'Projects' },
  { value: people.length, label: 'Builders' },
  { value: categories.size, label: 'Disciplines' },
  { value: yearsActive, label: 'Years operating' },
];
