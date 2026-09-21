import Projects from './Projects';
import { useState, useEffect } from 'react';
import { fmtCountdown } from './util';

function LegacyGroups({ ctx }) {
  const { user, tracks, assignments, openWorkOn } = ctx;
  const [filter, setFilter] = useState('All projects');
  const [query, setQuery] = useState('');
  const visible = tracks.filter((t) => (filter !== 'School starters' || t.category === 'School starter') && `${t.title} ${t.blurb} ${t.nodes.map(n => n.title + ' ' + n.detail).join(' ')}`.toLowerCase().includes(query.toLowerCase()));

  // Keep recruiting countdowns live.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!tracks.length) return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-50">Explore projects</h1>
      <p className="text-ink-400">No projects published here yet.</p>
    </div>
  );

  const mine = (nodeId) => assignments.find((a) => a.node_id === nodeId && a.member_ids?.includes(user.id));
  const openOn = (nodeId) => assignments.find((a) => a.node_id === nodeId && a.status === 'recruiting');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-ink-50">Find your next build.</h1>
        <p className="mt-2 text-ink-300 max-w-xl">Start with a sketch, some code, or a quick test. Pick a small step that sounds fun; classmates can join you during the first 24 hours.</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        {['School starters', 'All projects'].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm border ${filter === f ? 'border-acid-500 text-acid-500' : 'border-ink-700 text-ink-300'}`}>{f}</button>)}
        <input aria-label="Search projects and steps" placeholder="Search projects, design, code…" value={query} onChange={e => setQuery(e.target.value)} className="bg-ink-900 border border-ink-700 rounded-lg px-4 py-2 text-sm flex-1 min-w-0" />
      </div>
      {!visible.length && <p>No matching projects. Try another search or choose All projects.</p>}
      <div className="space-y-4">
        {visible.map((t) => (
          <section key={t.id} className="border border-ink-800">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-ink-800">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-lg text-ink-50">{t.title}</span>
                  <span className="kicker text-ink-600">S{t.spec} · {t.status}</span>
                </div>
                <p className="text-sm text-ink-400">{t.blurb}</p>
              </div>
            </div>

            <div className="divide-y divide-ink-800/70">
              {t.nodes.map((n) => {
                const a = mine(n.id);
                const open = openOn(n.id);
                return (
                  <div key={n.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] text-ink-100">{n.title}</div>
                      <div className="text-[12px] text-ink-500">{n.detail}</div>
                    </div>

                    {open && !a && (
                      <span className="hidden sm:inline kicker tnum text-[#ffc145]">
                        {open.members.length} in · {fmtCountdown(open.recruiting_ends_at)} left
                      </span>
                    )}

                    {a ? (
                      <span className="kicker tnum shrink-0" style={{ color: a.status === 'recruiting' ? '#ffc145' : '#c8f135' }}>
                        {a.status === 'recruiting' ? `on it · ${fmtCountdown(a.recruiting_ends_at)}` : '✓ on it'}
                      </span>
                    ) : (
                      <button
                        onClick={() => openWorkOn(t, n)}
                        className="kicker shrink-0 px-4 py-2 border border-ink-700 text-ink-200 hover:border-acid-500 hover:text-acid-500 transition-colors"
                      >
                        {open ? 'Join →' : 'Start this step →'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default function Groups({ ctx }) {
  // Launchpad-published projects only exist under Launchpad SSO; the local
  // seeded tracks (below) are the always-on catalog.
  return <div className="space-y-10">{ctx.oauth && <Projects ctx={ctx} />}{ctx.tracks.length > 0 && <LegacyGroups ctx={ctx} />}</div>;
}
