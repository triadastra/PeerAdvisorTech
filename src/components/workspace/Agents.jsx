import { agents, agentStatusColor } from '../../data/workspace';
import { SpecTag, SectionHead } from './shared';
import { specMap, pad } from './util';

const STATUS_LABEL = { live: 'Live', idle: 'Idle', standby: 'Standby' };

export default function AgentsView() {
  const live = agents.filter((a) => a.status === 'live').length;

  return (
    <div className="space-y-10">
      <div className="flex border-y border-ink-800">
        <div className="flex-1 px-4 py-4 border-r border-ink-800"><div className="font-display text-3xl md:text-4xl text-acid-500 tnum">{pad(live)}</div><div className="kicker text-ink-500 mt-1.5">Live</div></div>
        <div className="flex-1 px-4 py-4 border-r border-ink-800"><div className="font-display text-3xl md:text-4xl text-ink-50 tnum">{pad(agents.length)}</div><div className="kicker text-ink-500 mt-1.5">Total agents</div></div>
        <div className="flex-1 px-4 py-4"><div className="font-display text-3xl md:text-4xl text-ink-50">∞</div><div className="kicker text-ink-500 mt-1.5">Human-ops target: 0</div></div>
      </div>

      <section>
        <SectionHead index="01" title="Autonomous operations" meta="self-healing · zero-human-ops" />
        <div className="border-t border-ink-800">
          {agents.map((a) => (
            <div key={a.id} className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_120px_120px] items-center gap-x-4 gap-y-1 border-b border-ink-800 py-4">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: agentStatusColor[a.status], flex: 'none' }} />
              <div className="min-w-0">
                <div className="text-sm text-ink-100 truncate">{a.name}</div>
                <div className="kicker text-ink-600 normal-case tracking-normal">{a.scope}</div>
              </div>
              <span className="hidden md:block"><SpecTag n={a.spec} /></span>
              <div className="text-right">
                <div className="kicker" style={{ color: a.status === 'live' ? '#c8f135' : '#605e58' }}>{STATUS_LABEL[a.status]}</div>
                <div className="font-mono text-[11px] text-ink-500 tnum mt-0.5">{a.metric}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="kicker text-ink-600 normal-case tracking-normal leading-relaxed max-w-2xl">
        Agents run on the shared platform with per-team database isolation. The intelligence layer reports in
        aggregate only — minimum-N floor, no per-student inference — and feeds {specMap[3]?.title}. Status here is
        illustrative; wire it to live telemetry from The Spine when ready.
      </p>
    </div>
  );
}
