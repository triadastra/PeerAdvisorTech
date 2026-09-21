// ─────────────────────────────────────────────────────────────────────────
//  GIT FLOW — the review pipeline, end to end: how claiming a step becomes
//  credited hours. Renders the actual commands members run, plus their live
//  remote when they have one. Shown at the top of Contributions.
// ─────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

const STEPS = [
  { n: '01', title: 'Start a step', text: 'Claim a step in Explore projects. A 24-hour teammate window opens.', cmd: null },
  { n: '02', title: 'Clone', text: 'Copy your personal remote from My builds or the confirmation screen.', cmd: 'git clone <your-task-url>' },
  { n: '03', title: 'Push to main', text: 'Every push is receipted to your workspace login — no self-reporting.', cmd: 'git push origin main' },
  { n: '04', title: 'Finish the task', text: 'Finish below. The system scores your diff: lines, complexity, files, tests, review.', cmd: null },
  { n: '05', title: 'Hours credited', text: 'Credit posts to the leaderboard. Max 4 h per group, 40 h per year.', cmd: null },
];

function CopyCmd({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { /* no clipboard */ }
  };
  return (
    <button
      onClick={copy}
      title="Copy command"
      className="block w-full text-left border border-ink-700 bg-ink-950 px-3 py-2 font-mono text-[11px] text-acid-500 hover:border-acid-500 transition-colors whitespace-nowrap overflow-x-auto no-scrollbar"
    >
      {copied ? '✓ copied' : value}
    </button>
  );
}

export default function GitFlow({ ctx }) {
  // The member's most recent live remote, if they have one — the real command,
  // ready to paste into a terminal.
  const mine = [...(ctx.myAssignments || [])].reverse().find((a) => a.clone_url);

  return (
    <section className="contribution-panel mb-6" aria-label="How the git flow works">
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <h2 className="font-display text-xl text-ink-50">The git flow</h2>
        <span className="kicker text-ink-500">clone → push → finish → credited</span>
      </div>

      <ol className="relative grid grid-cols-1 md:grid-cols-5 gap-x-6 gap-y-7">
        {/* connecting hairline (desktop) */}
        <span aria-hidden="true" className="hidden md:block absolute left-0 right-0 top-[7px] h-px bg-ink-800" />
        {STEPS.map((s) => (
          <li key={s.n} className="relative">
            <div className="flex items-center gap-3 md:block">
              <span className="relative z-10 flex items-center justify-center w-[15px] h-[15px] rounded-full border-2 border-ink-950 bg-acid-500 shrink-0 md:mb-4" aria-hidden="true" />
              <div className="min-w-0">
                <div className="kicker text-acid-500 tnum">{s.n}</div>
                <h3 className="text-ink-50 text-sm font-medium mt-1">{s.title}</h3>
              </div>
            </div>
            <p className="text-xs text-ink-400 leading-relaxed mt-2 md:pr-2">{s.text}</p>
            {s.cmd && <div className="mt-3"><CopyCmd value={s.cmd} /></div>}
          </li>
        ))}
      </ol>

      {mine && (
        <div className="mt-6 pt-5 border-t border-ink-800">
          <div className="kicker text-ink-500 mb-2">Your live remote — {mine.track_title} · {mine.node_title}</div>
          <CopyCmd value={`git clone ${mine.clone_url}`} />
          <p className="mt-2 text-[11px] text-ink-500">Username is filled in for you. When Git asks for a password, use your workspace password.</p>
        </div>
      )}
    </section>
  );
}
