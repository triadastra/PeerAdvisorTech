import { Link } from 'react-router-dom';
import { people, teamForSpec } from '../../data/people';
import { projects } from '../../data/projects';
import { SpecDot, SectionHead } from './shared';
import { pad } from './util';

const specsSorted = [...projects].sort((a, b) => a.spec - b.spec);

export default function TeamView({ ctx }) {
  const { tasks } = ctx;
  const active = people.filter((p) => p.status === 'active').length;
  const away = people.filter((p) => p.status === 'away').length;

  const openBySpec = (n) => tasks.filter((t) => t.spec === n && t.status !== 'done').length;
  const maxOpen = Math.max(1, ...specsSorted.map((p) => openBySpec(p.spec)));

  return (
    <div className="space-y-10">
      <div className="flex border-y border-ink-800">
        <div className="flex-1 px-4 py-4 border-r border-ink-800"><div className="font-display text-3xl md:text-4xl text-ink-50 tnum">{pad(people.length)}</div><div className="kicker text-ink-500 mt-1.5">Builders</div></div>
        <div className="flex-1 px-4 py-4 border-r border-ink-800"><div className="font-display text-3xl md:text-4xl text-ink-50 tnum">{pad(active)}</div><div className="kicker text-ink-500 mt-1.5">Active</div></div>
        <div className="flex-1 px-4 py-4 border-r border-ink-800"><div className="font-display text-3xl md:text-4xl text-ink-50 tnum">{pad(projects.length)}</div><div className="kicker text-ink-500 mt-1.5">Specs</div></div>
        <div className="flex-1 px-4 py-4"><div className="font-display text-3xl md:text-4xl text-ink-50 tnum">{pad(away)}</div><div className="kicker text-ink-500 mt-1.5">Away</div></div>
      </div>

      {/* Workload by spec — open team tasks, the real coordination signal */}
      <section>
        <SectionHead index="01" title="Workload · open tasks by spec" />
        <div className="border-t border-ink-800">
          {specsSorted.map((p) => {
            const count = openBySpec(p.spec);
            const leads = teamForSpec(p.spec);
            return (
              <div key={p.id} className="flex items-center gap-3 border-b border-ink-800 py-3">
                <SpecDot n={p.spec} />
                <span className="font-mono text-[11px] text-ink-600 w-8 tnum shrink-0">S{p.spec}</span>
                <span className="text-[13px] text-ink-200 w-28 md:w-36 truncate shrink-0">{p.title}</span>
                <span className="flex-1 h-px bg-ink-800 relative">
                  <span className="absolute left-0 top-0 h-px" style={{ width: `${(count / maxOpen) * 100}%`, background: count ? p.spec != null ? '#c8f135' : '#605e58' : 'transparent' }} />
                </span>
                <span className="font-mono text-[11px] text-ink-400 tnum w-6 text-right shrink-0">{count}</span>
                <span className="hidden md:flex gap-1 w-24 justify-end shrink-0">
                  {leads.slice(0, 3).map((l) => (
                    <span key={l.name} className="font-mono text-[9px] w-5 h-5 border border-ink-800 flex items-center justify-center text-ink-500">{l.avatar}</span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roster */}
      <section>
          <SectionHead index="02" title={`Team · ${pad(people.length)}`} />
          <div className="border-t border-ink-800">
            {people.map((p) => {
              const specs = p.leads === 'all' ? projects.map((x) => x.spec) : Array.isArray(p.leads) ? p.leads.map((l) => l.n) : [];
              return (
                <Link key={p.id} to={`/team/${p.id}`} className="group flex items-center gap-3 border-b border-ink-800 py-3.5">
                  <span className="font-mono text-[10px] w-8 h-8 border flex items-center justify-center shrink-0 border-ink-700 text-ink-300">{p.avatar}</span>
                  <span className="text-sm text-ink-100 group-hover:text-acid-500 transition-colors shrink-0">{p.name}</span>
                  <span className="kicker text-ink-600 shrink-0">’{p.year}</span>
                  <span className="hidden md:block kicker text-ink-500 truncate flex-1">{p.title}</span>
                  {p.status === 'away' && <span className="kicker text-ink-400 border border-ink-700 px-2 py-0.5 shrink-0">Away</span>}
                  <span className="flex gap-1 ml-auto md:ml-0 shrink-0">
                    {specs.slice(0, 11).map((n) => <SpecDot key={n} n={n} size={5} />)}
                  </span>
                </Link>
              );
            })}
          </div>
      </section>
    </div>
  );
}
