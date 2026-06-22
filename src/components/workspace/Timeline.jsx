import { projects } from '../../data/projects';
import { milestones, daysUntil } from '../../data/workspace';
import { SpecDot, SpecTag, SectionHead } from './shared';
import { specMap, pad, dayDelta, nowMs } from './util';

const STATUS_ORDER = ['Production', 'Active', 'Pre-launch', 'In development', 'Planned'];
const statusColor = { Production: '#c8f135', Active: '#4ade80', 'Pre-launch': '#ffc145', 'In development': '#82807a', Planned: '#605e58' };

export default function TimelineView({ ctx }) {
  const { tasks, user } = ctx;
  const dated = tasks
    .filter((t) => t.user_id === user.id && t.due && t.status !== 'done')
    .sort((a, b) => a.due.localeCompare(b.due));

  const first = new Date(milestones[0].date).getTime();
  const last = new Date(milestones[milestones.length - 1].date).getTime();
  const span = Math.max(1, last - first);
  const pctOf = (t) => Math.min(100, Math.max(0, ((t - first) / span) * 100));
  const nowPct = pctOf(nowMs());

  const byStatus = STATUS_ORDER.map((s) => ({ status: s, items: projects.filter((p) => p.status === s) })).filter((g) => g.items.length);

  return (
    <div className="space-y-10">
      {/* Roadmap bar */}
      <section>
        <SectionHead index="01" title="Roadmap · → September handoff" meta={`${pad(daysUntil(milestones[milestones.length - 1].date))} days`} />
        <div className="pt-6 pb-2">
          <div className="relative h-px bg-ink-700 mx-1">
            {milestones.map((m) => {
              const active = m.state === 'active';
              return (
                <span key={m.id} style={{ position: 'absolute', left: `${pctOf(new Date(m.date).getTime())}%`, top: -4, width: 9, height: 9, borderRadius: '50%', transform: 'translateX(-50%)', background: active ? '#c8f135' : '#0a0908', border: active ? 'none' : '1px solid #605e58' }} />
              );
            })}
            {dated.map((t) => (
              <span key={t.id} title={t.title} style={{ position: 'absolute', left: `${pctOf(new Date(t.due).getTime())}%`, top: 6, width: 5, height: 5, transform: 'translateX(-50%) rotate(45deg)', background: t.spec != null ? specMap[t.spec]?.color : '#a8a59c' }} />
            ))}
            <span style={{ position: 'absolute', left: `${nowPct}%`, top: -12, bottom: -12, width: 1, background: '#c8f135', opacity: 0.5, transform: 'translateX(-50%)' }} />
          </div>
          <div className="flex justify-between mt-4">
            {milestones.map((m, i) => (
              <div key={m.id} className={i === 0 ? '' : i === milestones.length - 1 ? 'text-right' : 'text-center'}>
                <div className="kicker" style={{ color: m.state === 'active' ? '#c8f135' : undefined }}>{m.month}{m.state === 'active' ? ' · now' : ''}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 kicker text-ink-600 normal-case tracking-normal">◆ your dated tasks · ● milestones · │ today</div>
        </div>
      </section>

      {/* Milestones ledger */}
      <section>
        <SectionHead index="02" title="Milestones" />
        <div className="border-t border-ink-800">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-ink-800 py-3.5">
              <span className="font-mono text-[11px] text-ink-500 w-20 tnum shrink-0">{m.date}</span>
              <span className="flex-1 text-sm text-ink-100">{m.label}</span>
              <SpecTag n={m.spec} />
              <span className="kicker tnum w-20 text-right shrink-0" style={{ color: m.state === 'active' ? '#c8f135' : '#605e58' }}>
                {m.state === 'active' ? 'active' : `${daysUntil(m.date)}d`}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Spec status */}
      <section>
        <SectionHead index="03" title="Specs · by status" />
        <div className="space-y-6">
          {byStatus.map((g) => (
            <div key={g.status}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[g.status] || '#605e58' }} />
                <span className="kicker text-ink-400">{g.status} · {pad(g.items.length)}</span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 pl-3.5">
                {g.items.map((p) => (
                  <span key={p.id} className="inline-flex items-center gap-1.5 text-[13px] text-ink-300">
                    <SpecDot n={p.spec} /> {p.title}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Your deadlines */}
      {dated.length > 0 && (
        <section>
          <SectionHead index="04" title="Your deadlines" meta={`${pad(dated.length)} dated`} />
          <div className="border-t border-ink-800">
            {dated.map((t) => (
              <div key={t.id} className="flex items-center gap-3 border-b border-ink-800 py-3">
                <span className="font-mono text-[11px] text-ink-500 w-20 tnum shrink-0">{t.due}</span>
                <span className="flex-1 text-[13px] text-ink-200 truncate">{t.title}</span>
                <SpecTag n={t.spec} />
                <span className="kicker tnum w-16 text-right shrink-0" style={{ color: dayDelta(t.due) < 3 ? '#fb7185' : '#605e58' }}>{Math.max(0, dayDelta(t.due))}d</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
