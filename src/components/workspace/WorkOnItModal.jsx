import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fmtCountdown } from './util';

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch { /* no clipboard */ }
  };
  return (
    <div>
      {label && <div className="kicker text-ink-500 mb-1.5">{label}</div>}
      <div className="flex items-stretch border border-ink-700 bg-ink-950">
        <code className="flex-1 px-3 py-2.5 font-mono text-[12px] text-acid-500 overflow-x-auto no-scrollbar whitespace-nowrap">{value}</code>
        <button onClick={copy} className="kicker px-3 border-l border-ink-700 text-ink-400 hover:text-ink-50 hover:bg-ink-900 transition-colors shrink-0">
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function WorkOnItModal({ modal, assignments, onConfirm, onClose, onInvite }) {
  const { track, node, phase, busy, assignment } = modal;

  // Existing open claim on this node — only relevant while confirming (the done
  // screen keys off the created assignment, not the picked node).
  const open = node ? assignments.find((x) => x.node_id === node.id && x.status === 'recruiting') : null;
  const joining = !!open && phase === 'confirm';

  // Live countdown tick for the done screen.
  const [, tick] = useState(0);
  useEffect(() => {
    if (phase !== 'done') return;
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const a = assignment;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/80 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg bg-ink-900 border border-ink-700 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-800 px-6 py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: track.color }} />
            <span className="kicker text-ink-400 truncate">{track.title} · S{track.spec}</span>
          </div>
          <button onClick={onClose} className="kicker text-ink-500 hover:text-ink-100 shrink-0">Close ✕</button>
        </div>

        {phase === 'confirm' ? (
          <div className="px-6 py-6">
            <div className="kicker text-acid-500 mb-2">{joining ? 'Join this step' : 'Work on this step'}</div>
            <h2 className="font-display text-2xl text-ink-50 leading-tight">{node.title}</h2>
            <p className="mt-2 text-ink-300 text-sm leading-relaxed">{node.detail}</p>

            {/* Recruiting notice */}
            <div className="mt-5 border border-ink-800 bg-ink-950 p-4">
              {joining ? (
                <>
                  <div className="kicker text-ink-400 mb-1">Recruiting closes in {fmtCountdown(open.recruiting_ends_at)}</div>
                  <p className="text-sm text-ink-300">
                    <span className="text-ink-100">{open.members.join(', ')}</span> {open.members.length > 1 ? 'are' : 'is'} already on this step. Join now to work together on the same repo.
                  </p>
                </>
              ) : (
                <>
                  <div className="kicker text-ink-400 mb-1">Recruiting window · 24 hours</div>
                  <p className="text-sm text-ink-300">
                    Once you confirm, teammates can join this exact step for <span className="text-ink-100">24 hours</span>. Working with a friend? Better sign up now — after the window closes, the step locks to whoever’s in.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={onConfirm}
                disabled={busy}
                className="kicker text-ink-950 bg-acid-500 px-5 py-3 hover:bg-acid-400 transition-colors disabled:opacity-60 disabled:cursor-wait"
              >
                {busy ? 'Working…' : joining ? 'Join & confirm →' : 'Confirm — I’ll work on it →'}
              </button>
              <button onClick={onClose} className="kicker text-ink-500 hover:text-ink-200">Not now</button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-6">
            <div className="kicker text-acid-500 mb-2">You’re on it ✓</div>
            <h2 className="font-display text-2xl text-ink-50 leading-tight">{a?.node_title}</h2>
            <p className="mt-2 text-ink-300 text-sm">
              {a?.members?.length > 1 ? <>Team: <span className="text-ink-100">{a.members.join(', ')}</span>. </> : null}
              Recruiting closes in <span className="text-acid-500 tnum">{fmtCountdown(a?.recruiting_ends_at)}</span> — invite a friend before it locks.
            </p>

            {a?.clone_url ? (
              <div className="mt-5 space-y-4">
                <CopyRow label="Your git remote (username = your login)" value={a.clone_url} />
                <div>
                  <div className="kicker text-ink-500 mb-1.5">Clone & start working</div>
                  <div className="border border-ink-800 bg-ink-950 px-3 py-2.5 font-mono text-[12px] text-ink-300 leading-relaxed overflow-x-auto no-scrollbar">
                    <div>git clone {a.clone_url}</div>
                    <div className="text-ink-600"># …make changes, commit…</div>
                    <div>git push origin main</div>
                  </div>
                  <p className="mt-2 kicker text-ink-600 normal-case tracking-normal leading-relaxed">
                    Push to upload, fetch to pull the team’s work, and open a merge when your step is ready. It’s a real repo on our platform — no extra account.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-5 border border-ink-800 bg-ink-950 p-4 text-sm text-ink-400">
                Your step is saved. A git remote will appear here once repo hosting is enabled on this server.
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button onClick={onClose} className="kicker text-ink-950 bg-acid-500 px-5 py-3 hover:bg-acid-400 transition-colors">Continue →</button>
              <button onClick={onInvite} className="kicker text-ink-500 hover:text-ink-200">Invite a friend in the forum</button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
