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
  'inner core is S2–S6; the outer alliance layer is the recruited clubs under MOU.';

const infra = [
  'One GCP N2A server (~$29/mo) runs every spec.',
  'Self-healing agents target zero-human-ops.',
  'Per-team database isolation.',
  'Automated CI/CD: GitHub → service auto-update.',
  'Data-return mechanism for teams that exit.',
];

const specs = [
  {
    n: 1, name: 'Club Alliances', leads: 'Celsia (lead), Gordon (co-lead)',
    layer: 'Outer alliance layer · part of Gordon’s “069” cluster', status: 'Active',
    summary: 'The outer alliance layer. Recruited clubs join under MOU trade agreements — mutual-benefit, low-dependency cooperation rather than commercial contracts. The club-to-club coordination layer (the club-level “LinkedIn”).',
    tech: 'MOU trade agreements',
    note: 'Distinct from Spec 5’s person-level directory — this is the club axis.',
  },
  {
    n: 2, name: 'Fyona®', leads: 'Celsia',
    layer: 'StandardCAS-native core · Affiliation: PA Journalism × StandardCAS™', status: 'Production, ~v1.0.201',
    summary: 'Flagship and current load leader (the majority of platform traffic). An HTML-based AI magazine/layout studio competing with Canva: live preview, AI layout agent, CMYK-PDF / HTML5 / slide export. Saves ~84 hrs/person/semester on layout.',
    tech: 'HTML5, AI layout agent, CMYK/PDF · HTML5 · slide export, StandardCAS-native core',
    note: '',
  },
  {
    n: 3, name: 'Synonance (Syno)', leads: 'Celsia, Pete, Gordon',
    layer: 'Core', status: 'Production · tiered Fast/Standard/Pro/Max',
    summary: 'RAG study chatbot (formerly Arcana). Built on Qwen-3.6 with a custom Super RAG + MCP pipeline (~84% token reduction), grounded in SHSID curriculum and IB mock exams.',
    tech: 'Qwen-3.6, custom Super RAG, MCP, GCP',
    note: 'Development home is IDX (Pete) under a NON-TRANSFERABLE right of use; ownership is Celsia; runs entirely on Celsia’s GCP.',
  },
  {
    n: 4, name: 'Launchpad™ (Cyclone)', leads: 'Celsia, Rick, Pete, Gordon, Jessica',
    layer: 'Core', status: 'Pre-launch · v0.64',
    summary: 'The unified application platform: Netlify + Base44-style build/deploy with Git, PTY, and Docker; The Spine’s identity, telemetry, and routing across 8 model providers plus Brave Search and Resend; and the shared user-data and competition-question-bank layer.',
    tech: 'Docker, Git, PTY, CI/CD, API gateway, multi-LLM routing, shared data',
    note: 'Requires full isolation for untrusted student code. Credits use a 1.5× markup; the per-app hosting fee is the identified FIXED-REVENUE component. Privacy reporting remains aggregate-only with a minimum-N floor.',
  },
  {
    n: 5, name: 'SharedSpace', leads: 'Gordon (club layer), Celsia (co-lead)',
    layer: 'Core', status: 'In development',
    summary: 'The people-and-clubs layer: a searchable student talent directory plus Club Gateway’s founding, affiliation, governance, and teaching tools for starting and running clubs.',
    tech: 'Search, directory, club governance, runs on Launchpad',
    note: 'This is the deliverable school administration requested.',
  },
  {
    n: 6, name: 'CareerPlanner', leads: 'Celsia',
    layer: 'StandardCAS-native core', status: 'In development',
    summary: 'Student-facing career exploration tool.',
    tech: 'StandardCAS-native',
    note: '',
  },
  {
    n: 7, name: 'DataSci Outreach Course', leads: 'Gordon + Rainn + Brian',
    layer: 'Third of Gordon’s “069” cluster', status: 'Planned — gated on Launchpad (S4) approval',
    summary: 'A data-science teaching/outreach course. Deploys on Launchpad, so it follows once that platform opens.',
    tech: 'Data science, curriculum',
    note: 'Gated on Spec 4 (Launchpad) approval.',
  },
  {
    n: 8, name: 'Competition Lists', leads: 'Brian + Rick',
    layer: 'Competition-facing surface', status: 'In development',
    summary: 'The competition-facing surface: curated lists and prep backed by Launchpad’s integrated question bank. S4 stores the data; S8 is what students actually see.',
    tech: 'Curation, prep',
    note: 'The question bank is maintained inside Launchpad; this remains the student-facing surface.',
  },
];

const people = [
  ['Celsia', 'Owner. Leads S1, S2, and S6; team on S3, S4, S5, and S7. Owns Synonance; GCP host.'],
  ['Gordon', 'Synonance team (S3) and Launchpad team (S4); leads SharedSpace’s club layer (S5) and S7; co-leads S1. Owns the founding-a-club teaching dept.'],
  ['Pete', 'Launchpad team (S4); leads S3 (Synonance); development home is his IDX, under a non-transferable right of use.'],
  ['Jessica', 'Co-leads S4 (Launchpad).'],
  ['Brian', 'Works on S7 (DataSci Outreach) and leads S8 (Competition Lists).'],
  ['Rick', 'Launchpad team (S4) and lead on S8 (Competition Lists).'],
  ['Rainn', 'Leads S7 (DataSci Outreach).'],
];

const handoff = [
  'September handoff: this is the locked master roster a successor should work from.',
  'S4 (Launchpad) includes The Spine and database; routing must be hardened before the platform opens.',
  'S4 needs full resource isolation (untrusted code) and carries the fixed-revenue per-app fee.',
  'S7 (DataSci Outreach) is gated on S4 approval.',
  'S4 stores the competition question bank; S8 remains the student-facing competition surface.',
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
