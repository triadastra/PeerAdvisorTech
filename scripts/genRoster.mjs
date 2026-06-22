// ─────────────────────────────────────────────────────────────────────────
//  PATD / AI Central — Master Roster generator (INTERNAL, confidential).
//  Holds the FULL internal data (ownership, pricing, infra, security status)
//  that is deliberately kept OUT of the public site. Run:  node scripts/genRoster.mjs
//  Output: /Users/osmond/PATS/PATD_Master_Roster.docx  (outside the web app)
//  This file contains sensitive data — keep it out of any public repo.
// ─────────────────────────────────────────────────────────────────────────
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { writeFileSync } from 'node:fs';

const OUT = '/Users/osmond/PATS/PATD_Master_Roster.docx';
const today = new Date().toISOString().slice(0, 10);

const overview =
  'AI Central is not a spec — it is the umbrella that emerges when all specs run together. ' +
  'The cross-club network and affiliations live there, not in any one number. The StandardCAS-native ' +
  'inner core is S1–S5 and S8; the outer alliance layer is the recruited clubs under MOU.';

const infra = [
  'One GCP N2A server (~$29/mo) runs every spec.',
  'Self-healing agents target zero-human-ops.',
  'Per-team database isolation.',
  'Automated CI/CD: GitHub → service auto-update.',
  'Data-return mechanism for teams that exit.',
];

const specs = [
  {
    n: 0, name: 'Club Alliances', leads: 'Celsia (lead), Gordon (co-lead)',
    layer: 'Outer alliance layer · part of Gordon’s “069” cluster', status: 'Active',
    summary: 'The outer alliance layer. Recruited clubs join under MOU trade agreements — mutual-benefit, low-dependency cooperation rather than commercial contracts. The club-to-club coordination layer (the club-level “LinkedIn”).',
    tech: 'MOU trade agreements',
    note: 'Distinct from Spec 5’s person-level directory — this is the club axis.',
  },
  {
    n: 1, name: 'Fyona®', leads: 'Celsia',
    layer: 'StandardCAS-native core · Affiliation: PA Journalism × StandardCAS™', status: 'Production, ~v1.0.201',
    summary: 'Flagship and current load leader (the majority of platform traffic). An HTML-based AI magazine/layout studio competing with Canva: live preview, AI layout agent, CMYK-PDF / HTML5 / slide export. Saves ~84 hrs/person/semester on layout.',
    tech: 'HTML5, AI layout agent, CMYK/PDF · HTML5 · slide export, StandardCAS-native core',
    note: '',
  },
  {
    n: 2, name: 'Synonance (Syno)', leads: 'Pete (lead), Celsia (co-lead)',
    layer: 'Core', status: 'Production · tiered Fast/Standard/Pro/Max',
    summary: 'RAG study chatbot (formerly Arcana). Built on Qwen-3.6 with a custom Super RAG + MCP pipeline (~84% token reduction), grounded in SHSID curriculum and IB mock exams.',
    tech: 'Qwen-3.6, custom Super RAG, MCP, GCP',
    note: 'Development home is IDX (Pete) under a NON-TRANSFERABLE right of use; ownership is Celsia; runs entirely on Celsia’s GCP.',
  },
  {
    n: 3, name: 'API Gateway / The Spine', leads: 'Celsia',
    layer: 'Core · infrastructure backbone', status: 'In development — MUST be hardened before Launchpad opens',
    summary: 'The infrastructure backbone. Super Relay™ routes across 8 providers (OpenAI, Anthropic, Qwen, DeepSeek, Kimi, Moonshot, Zhipu GLM, xAI, Perplexity) plus Brave Search and Resend. Holds VID identity, the credits ledger, tier map, and telemetry. Its Intelligence layer does Claude-powered PII stripping, anomaly detection, and anonymized board reporting — the teacher panel shows only aggregate club-level charts with a minimum-N floor, no per-student inference.',
    tech: 'API gateway, multi-LLM routing (8 providers), Brave Search, Resend',
    note: 'Credits ledger applies a 1.5× markup. Hardening is a blocker for Spec 4 (Launchpad).',
  },
  {
    n: 4, name: 'Launchpad™ (Cyclone)', leads: 'Celsia (lead), Jessica (co-lead)',
    layer: 'Core', status: 'Pre-launch · v0.64',
    summary: 'A Netlify + Base44-style build/deploy system with Git, PTY, and Docker, letting clubs ship their own apps. Needs full resource isolation because it runs untrusted student code.',
    tech: 'Docker, Git, PTY, CI/CD',
    note: 'The per-app hosting fee here is the identified FIXED-REVENUE component.',
  },
  {
    n: 5, name: 'SharedSpace', leads: 'Unassigned',
    layer: 'Core', status: 'In development',
    summary: 'Student talent directory — a LinkedIn-style searchable index that makes skilled students discoverable (the person axis), reframed from a connector/mesh model to a directory for scale.',
    tech: 'Search, directory',
    note: '',
  },
  {
    n: 6, name: 'Club Gateway', leads: 'Gordon (lead), Celsia (co-lead)',
    layer: 'Part of “069”', status: 'In development',
    summary: 'Club founding & affiliation governance — the enablement-plus-governance layer for starting and running clubs, including Gordon’s teaching department on how to found a club. Its website runs on Launchpad.',
    tech: 'Governance, runs on Launchpad',
    note: 'This is the deliverable school administration requested.',
  },
  {
    n: 7, name: 'Database', leads: 'Brian + Rick',
    layer: 'Shared data layer', status: 'In development',
    summary: 'The shared data layer: user data plus a competition question bank for prep (IOAI, CSP, NOIP, IOI, AMC, AIME, and similar).',
    tech: 'User data, competition question bank',
    note: '',
  },
  {
    n: 8, name: 'CareerPlanner', leads: 'Celsia',
    layer: 'StandardCAS-native core', status: 'In development',
    summary: 'Student-facing career exploration tool.',
    tech: 'StandardCAS-native',
    note: '',
  },
  {
    n: 9, name: 'DataSci Outreach Course', leads: 'Gordon + Rainn + Brian',
    layer: 'Third of Gordon’s “069” cluster', status: 'Planned — gated on Launchpad (S4) approval',
    summary: 'A data-science teaching/outreach course. Deploys on Launchpad, so it follows once that platform opens.',
    tech: 'Data science, curriculum',
    note: 'Gated on Spec 4 (Launchpad) approval.',
  },
  {
    n: 10, name: 'Competition Lists', leads: 'Celsia',
    layer: 'Competition-facing surface', status: 'In development',
    summary: 'The competition-facing surface: curated lists and prep for the contests Spec 7’s bank feeds. S7 is the data store; S10 is what students actually see.',
    tech: 'Curation, prep',
    note: 'Adjacent to Spec 7 — confirm whether to keep them split.',
  },
];

const people = [
  ['Celsia', 'Owner. Leads S0, S1, S3, S4, S8, S10; co-leads S2, S6. Owns Synonance; GCP host.'],
  ['Gordon', 'Leads S6, S9; co-leads S0. Owns the “069” cluster (S0/S6/S9) and the founding-a-club teaching dept.'],
  ['Pete', 'Leads S2 (Synonance); development home is his IDX, under a non-transferable right of use.'],
  ['Jessica', 'Co-leads S4 (Launchpad).'],
  ['Brian', 'Leads S7 (Database) and S9 (DataSci Outreach).'],
  ['Rick', 'Leads S7 (Database).'],
  ['Rainn', 'Leads S9 (DataSci Outreach).'],
];

const handoff = [
  'September handoff: this is the locked master roster a successor should work from.',
  'S3 (The Spine) must be hardened before S4 (Launchpad) opens.',
  'S4 (Launchpad) needs full resource isolation (untrusted code) and carries the fixed-revenue per-app fee.',
  'S9 (DataSci Outreach) is gated on S4 approval.',
  'S7 vs S10: confirm whether to keep the data store and the competition surface split.',
  'Ownership/legal: Synonance dev home is IDX (Pete) under a non-transferable right of use; ownership is Celsia.',
];

// ── docx helpers ──────────────────────────────────────────────────────────
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 6 } },
  children: [new TextRun({ text: t, bold: true })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 60 },
  children: [new TextRun({ text: t, bold: true })] });
const P = (t, opts = {}) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: t, ...opts })] });
const label = (l, v) => new Paragraph({ spacing: { after: 40 },
  children: [new TextRun({ text: `${l}:  `, bold: true }), new TextRun(v)] });
const bullet = (t) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 30 }, children: [new TextRun(t)] });
const internal = (t) => new Paragraph({ spacing: { after: 60 },
  children: [new TextRun({ text: 'INTERNAL — ', bold: true, color: 'B91C1C' }), new TextRun({ text: t, italics: true, color: 'B91C1C' })] });

const children = [
  new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: 'AI CENTRAL', bold: true, size: 60 })] }),
  new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Master Roster — Internal Handoff', size: 30, color: '555555' })] }),
  new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: `Confidential · prepared by Celsia · ${today}`, size: 18, color: '999999' })] }),

  H1('Overview'),
  P(overview),

  H1('Shared infrastructure'),
  ...infra.map(bullet),

  H1('Specs'),
];

for (const s of specs) {
  children.push(H2(`Spec ${s.n} — ${s.name}`));
  children.push(label('Leads', s.leads));
  children.push(label('Layer', s.layer));
  children.push(label('Status', s.status));
  children.push(label('Tech', s.tech));
  children.push(P(s.summary));
  if (s.note) children.push(internal(s.note));
}

children.push(H1('People'));
for (const [name, role] of people) children.push(label(name, role));

children.push(H1('Handoff notes & open questions'));
for (const h of handoff) children.push(bullet(h));

const doc = new Document({
  creator: 'PATD',
  title: 'AI Central — Master Roster',
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 22 } },
      heading1: { run: { font: 'Calibri', size: 30, bold: true, color: '111111' } },
      heading2: { run: { font: 'Calibri', size: 24, bold: true, color: '111111' } },
    },
  },
  sections: [{ properties: {}, children }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync(OUT, buffer);
console.log(`✓ wrote ${OUT} (${(buffer.length / 1024).toFixed(1)} KB, ${specs.length} specs)`);
