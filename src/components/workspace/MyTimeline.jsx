import { useState, useEffect } from 'react';
import { fmtCountdown } from './util';

const STATUS = {
  recruiting: { label: 'recruiting', color: '#ffc145' },
  active: { label: 'active', color: '#c8f135' },
  done: { label: 'done', color: '#605e58' },
};

function StatusPill({ status, endsAt }) {
  const s = STATUS[status] || STATUS.active;
  return (
    <span className="inline-flex items-center gap-1.5 kicker tnum" style={{ color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {status === 'recruiting' ? `recruiting · ${fmtCountdown(endsAt)}` : s.label}
    </span>
  );
}

export default function MyTimeline({ ctx }) {
  const { user, tracks, assignments, myAssignments, openWorkOn, go } = ctx;
  const [selected, setSelected] = useState(null); // node id

  // Tick so recruiting countdowns stay live.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mine = (nodeId) => assignments.find((a) => a.node_id === nodeId && a.member_ids?.includes(user.id));
  const openOn = (nodeId) => assignments.find((a) => a.node_id === nodeId && a.status === 'recruiting');

  // Tracks the member has joined = any track with ≥1 node they're a member of.
  const joinedTrackIds = new Set(myAssignments.map((a) => a.track_id));
  const myTracks = tracks.filter((t) => joinedTrackIds.has(t.id));

  if (myTracks.length === 0) {
    return (
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-ink-50">Your timeline</h1>
        <p className="mt-3 text-ink-300 max-w-lg">Nothing here yet. Head to <span className="text-ink-100">Groups &amp; Tasks</span>, pick a step to work on, and it’ll show up on your timeline.</p>
        <button onClick={() => go('Groups & Tasks')} className="mt-6 kicker text-ink-950 bg-acid-500 px-5 py-3 hover:bg-acid-400 transition-colors">
          Browse groups &amp; tasks →
        </button>
      </div>
    );
  }

  const selNode = selected && tracks.flatMap((t) => t.nodes.map((n) => ({ t, n }))).find(({ n }) => n.id === selected);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-ink-50">Your timeline</h1>
        <p className="mt-2 kicker text-ink-500">{myAssignments.length} step{myAssignments.length === 1 ? '' : 's'} · {myTracks.length} group{myTracks.length === 1 ? '' : 's'} · select a node to act on it</p>
      </div>

      {/* Per-track timelines */}
      <div className="space-y-9">
        {myTracks.map((t) => (
          <section key={t.id}>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
              <span className="font-display text-lg text-ink-100">{t.title}</span>
              <span className="kicker text-ink-600">S{t.spec} · {t.status}</span>
            </div>

            {/* Node rail */}
            <div className="relative flex items-start justify-between gap-2 pl-1">
              <div className="absolute left-3 right-3 top-[7px] h-px bg-ink-800" />
              {t.nodes.map((n) => {
                const a = mine(n.id);
                const open = openOn(n.id);
                const isSel = selected === n.id;
                const dotColor = a ? (a.status === 'recruiting' ? '#ffc145' : a.status === 'done' ? '#605e58' : '#c8f135')
                  : open ? '#ffc145' : '#2b2a27';
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelected(isSel ? null : n.id)}
                    className="relative z-10 flex-1 min-w-0 flex flex-col items-center gap-2 group"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-125"
                      style={{ background: dotColor, borderColor: isSel ? '#f6f5f3' : '#0a0908' }}
                    />
                    <span className={`kicker text-center leading-tight px-1 ${a ? 'text-ink-200' : 'text-ink-600'} ${isSel ? '!text-ink-50' : ''}`}>
                      {n.title}
                    </span>
                    {a && <span className="w-1 h-1 rounded-full" style={{ background: dotColor }} />}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Selected node detail */}
      {selNode && (() => {
        const { t, n } = selNode;
        const a = mine(n.id);
        const open = openOn(n.id);
        return (
          <section className="border border-ink-700 bg-ink-900/60 p-6">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: t.color }} />
              <span className="kicker text-ink-400">{t.title}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-display text-xl text-ink-50">{n.title}</h3>
                <p className="mt-1 text-sm text-ink-300">{n.detail}</p>
              </div>
              {a && <StatusPill status={a.status} endsAt={a.recruiting_ends_at} />}
            </div>

            {a ? (
              <div className="mt-5 space-y-3">
                {a.members?.length > 0 && (
                  <div className="kicker text-ink-500">Team · <span className="text-ink-200">{a.members.join(', ')}</span></div>
                )}
                {a.clone_url && (
                  <div className="flex items-stretch border border-ink-700 bg-ink-950">
                    <code className="flex-1 px-3 py-2.5 font-mono text-[12px] text-acid-500 overflow-x-auto no-scrollbar whitespace-nowrap">{a.clone_url}</code>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(a.clone_url); ctx.notify('Git remote copied'); }}
                      className="kicker px-3 border-l border-ink-700 text-ink-400 hover:text-ink-50 hover:bg-ink-900 transition-colors shrink-0"
                    >Copy</button>
                  </div>
                )}
                {a.status === 'recruiting' && (
                  <p className="kicker text-ink-500 normal-case tracking-normal">Recruiting closes in <span className="text-acid-500">{fmtCountdown(a.recruiting_ends_at)}</span> — a friend can still join this exact step.</p>
                )}
              </div>
            ) : (
              <div className="mt-5">
                {open && <p className="kicker text-ink-500 mb-3">{open.members.join(', ')} {open.members.length > 1 ? 'are' : 'is'} on this — recruiting closes in <span className="text-acid-500">{fmtCountdown(open.recruiting_ends_at)}</span>.</p>}
                <button onClick={() => openWorkOn(t, n)} className="kicker text-ink-950 bg-acid-500 px-5 py-2.5 hover:bg-acid-400 transition-colors">
                  {open ? 'Join this step →' : 'Work on it →'}
                </button>
              </div>
            )}
          </section>
        );
      })()}

      {/* Latest work */}
      {myAssignments.some((a) => a.repo) && (
        <section>
          <div className="kicker text-ink-400 mb-3">[ latest work ]</div>
          <div className="border-t border-ink-800">
            {myAssignments.filter((a) => a.repo).slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 border-b border-ink-800 py-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
                <span className="text-[13px] text-ink-200 truncate flex-1">{a.track_title} · {a.node_title}</span>
                <StatusPill status={a.status} endsAt={a.recruiting_ends_at} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
