import { projects, specColors } from '../../data/projects';
import { agents, agentStatusColor, milestones, daysUntil, HANDOFF_DATE, priorityColor } from '../../data/workspace';
import { SpecDot, SpecTag, SectionHead } from './shared';
import { pad, initials, fmtTime, dayLabel, dayDelta, nowMs } from './util';

const specsSorted = [...projects].sort((a, b) => a.spec - b.spec);

// ── Identity card ────────────────────────────────────────────────────────
function IdentityCard({ user, name, tasks, go }) {
  const role = user?.role || 'Member';
  const vid = user?.vid || '0x000000…00';
  const days = daysUntil(HANDOFF_DATE);
  const joined = user?.joined ? user.joined.replace('-', '·') : null;

  const myOpen = tasks.filter((t) => t.user_id === user?.id && t.status !== 'done');
  const activeSpecSet = new Set(myOpen.filter((t) => t.spec != null).map((t) => t.spec));

  return (
    <div className="border border-ink-800 relative overflow-hidden">
      {/* faint blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-ink-800) 1px, transparent 1px), linear-gradient(90deg, var(--color-ink-800) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          opacity: 0.13,
        }}
      />

      {/* identity + countdown */}
      <div className="relative flex flex-col sm:flex-row items-start justify-between gap-6 p-5 sm:p-7">
        <div className="flex items-start gap-5">
          <div
            className="font-mono text-lg w-16 h-16 border border-acid-500/30 bg-ink-950/80 flex items-center justify-center text-acid-500 shrink-0 tracking-widest"
            aria-hidden="true"
          >
            {initials(name)}
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-50 tracking-[-0.015em] leading-tight">
              {name}
            </h2>
            <div className="font-mono text-[11px] text-ink-600 mt-1">{vid}</div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3">
              <span className="kicker text-acid-500/80">{role}</span>
              <span className="text-ink-700 text-xs">·</span>
              <span className="kicker text-ink-500">AI Central</span>
              {joined && (
                <>
                  <span className="text-ink-700 text-xs">·</span>
                  <span className="kicker text-ink-600">Since {joined}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* countdown */}
        <div className="sm:text-right shrink-0">
          <div className="kicker text-ink-600 mb-1">Handoff lock</div>
          <div className="font-display text-6xl md:text-7xl font-bold text-ink-50 tnum leading-none tracking-tighter">
            {pad(days)}
          </div>
          <div className="kicker text-ink-600 mt-2">days · {HANDOFF_DATE}</div>
        </div>
      </div>

      {/* spec signature */}
      <div className="relative border-t border-ink-800 px-5 sm:px-7 py-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="kicker text-ink-600">Spec signature</span>
          {activeSpecSet.size > 0 ? (
            <span className="kicker text-acid-500">{activeSpecSet.size} active</span>
          ) : (
            <span className="kicker text-ink-700">no active specs yet</span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2.5">
          {specsSorted.map((p) => {
            const count = myOpen.filter((t) => t.spec === p.spec).length;
            const active = count > 0;
            return (
              <button
                key={p.id}
                onClick={() => active && go('Tasks', p.spec)}
                title={`${p.title}${active ? ` — ${count} open` : ''}`}
                className={`flex items-center gap-1.5 group ${active ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  style={{
                    width: active ? 8 : 5,
                    height: active ? 8 : 5,
                    borderRadius: '50%',
                    background: active ? specColors[p.spec] : undefined,
                    border: active ? 'none' : '1px solid #2b2a27',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                />
                <span
                  className={`font-mono text-[11px] transition-colors ${
                    active ? 'text-ink-300 group-hover:text-ink-50' : 'text-ink-700'
                  }`}
                >
                  {p.spec === 0 ? 'AIC' : `S${p.spec}`}
                </span>
                {active && (
                  <span className="font-mono text-[10px] text-acid-500/70 tnum">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Stat ledger ──────────────────────────────────────────────────────────
function Ledger({ items }) {
  return (
    <div className="flex flex-wrap border-y border-ink-800">
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`flex-1 min-w-[100px] px-4 py-4 ${i < items.length - 1 ? 'border-r border-ink-800' : ''}`}
        >
          <div
            className="font-display text-3xl md:text-4xl text-ink-50 tnum"
            style={it.accent ? { color: '#c8f135' } : undefined}
          >
            {it.value}
          </div>
          <div className="kicker text-ink-500 mt-1.5">{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main section ─────────────────────────────────────────────────────────
export default function Overview({ ctx }) {
  const { user, name, tasks, events, go } = ctx;
  const open = tasks.filter((t) => t.status !== 'done');
  const upcoming = events.filter((e) => dayDelta(e.starts_at) >= 0).slice(0, 4);
  // Count MY tasks (not events) due within the next 7 days.
  const dueThisWeek = tasks.filter(
    (t) => t.user_id === user?.id && t.due && t.status !== 'done' && dayDelta(t.due) >= 0 && dayDelta(t.due) <= 7,
  ).length;
  const liveAgents = agents.filter((a) => a.status === 'live').length;
  const topTasks = [...open]
    .sort((a, b) => ['High', 'Med', 'Low'].indexOf(a.priority) - ['High', 'Med', 'Low'].indexOf(b.priority))
    .slice(0, 5);

  return (
    <div className="space-y-10">
      <IdentityCard user={user} name={name} tasks={tasks} go={go} />

      <Ledger
        items={[
          { value: pad(open.length), label: 'Open tasks' },
          { value: pad(projects.length), label: 'Active specs' },
          { value: pad(dueThisWeek), label: 'Due this wk' },
          { value: pad(liveAgents), label: 'Agents live', accent: true },
        ]}
      />

      {/* [01] Agenda */}
      <section>
        <SectionHead index="01" title="Agenda · Upcoming" meta={`${pad(events.length)} events`} />
        <div className="border-t border-ink-800">
          {upcoming.length === 0 && (
            <p className="py-4 text-ink-500 text-sm">
              No upcoming events —{' '}
              <button onClick={() => go('Calendar')} className="text-acid-500 link-underline">
                open Calendar
              </button>{' '}
              to add one.
            </p>
          )}
          {upcoming.map((e) => (
            <div key={e.id} className="flex items-center gap-3 border-b border-ink-800 py-3">
              <span className="font-mono text-[11px] text-ink-500 w-16 shrink-0">{dayLabel(e.starts_at)}</span>
              <span className="font-mono text-[11px] text-ink-400 w-12 shrink-0 tnum">{fmtTime(e.starts_at)}</span>
              <span className="flex-1 text-[13px] text-ink-200 truncate">
                {e.title}
                {e.with_whom && <span className="text-ink-600"> · w/ {e.with_whom}</span>}
              </span>
              <SpecTag n={e.spec} />
            </div>
          ))}
        </div>
        <button onClick={() => go('Calendar')} className="mt-3 kicker text-ink-500 hover:text-acid-500 transition-colors">
          View calendar →
        </button>
      </section>

      {/* [02] Timeline mini */}
      <section>
        <SectionHead index="02" title="Timeline · → Sep handoff" />
        <TimelineMini />
        <button onClick={() => go('Timeline')} className="mt-4 kicker text-ink-500 hover:text-acid-500 transition-colors">
          View roadmap →
        </button>
      </section>

      {/* [03] Agents */}
      <section>
        <SectionHead index="03" title="Agents · Autonomous ops" meta={`${pad(liveAgents)} / ${pad(agents.length)} live`} />
        <div className="border-t border-ink-800">
          {agents.map((a) => (
            <div key={a.id} className="flex items-center gap-3 border-b border-ink-800 py-3">
              <span
                style={{ width: 6, height: 6, borderRadius: '50%', background: agentStatusColor[a.status], flex: 'none' }}
              />
              <span className="flex-1 text-[13px] text-ink-200 truncate">
                {a.name} <span className="text-ink-600">· {a.scope}</span>
              </span>
              <span className="kicker" style={{ color: a.status === 'live' ? '#c8f135' : '#605e58' }}>
                {a.status}
              </span>
              <span className="font-mono text-[11px] text-ink-500 w-24 text-right shrink-0 tnum">{a.metric}</span>
            </div>
          ))}
        </div>
      </section>

      {/* [04] Tasks */}
      <section>
        <SectionHead index="04" title="Tasks & plans" meta={`${pad(open.length)} open`} />
        <div className="border-t border-ink-800">
          {topTasks.length === 0 && (
            <p className="py-4 text-ink-500 text-sm">
              No tasks yet —{' '}
              <button onClick={() => go('Tasks')} className="text-acid-500 link-underline">
                open Tasks
              </button>{' '}
              to add or load starters.
            </p>
          )}
          {topTasks.map((t) => (
            <button
              key={t.id}
              onClick={() => go('Tasks')}
              className="group w-full flex items-center gap-3 border-b border-ink-800 py-3 text-left"
            >
              <span className="w-3.5 h-3.5 border border-ink-600 shrink-0 group-hover:border-acid-500 transition-colors" />
              <span className="flex-1 text-[13px] text-ink-200 truncate">{t.title}</span>
              {t.spec != null && <SpecTag n={t.spec} />}
              <span className="kicker shrink-0" style={{ color: priorityColor[t.priority] }}>
                {t.priority}
              </span>
            </button>
          ))}
        </div>
        <button onClick={() => go('Tasks')} className="mt-3 kicker text-ink-500 hover:text-acid-500 transition-colors">
          View all tasks →
        </button>
      </section>
    </div>
  );
}

function TimelineMini() {
  const first = new Date(milestones[0].date).getTime();
  const last = new Date(milestones[milestones.length - 1].date).getTime();
  const span = Math.max(1, last - first);
  const nowPct = Math.min(100, Math.max(0, ((nowMs() - first) / span) * 100));

  return (
    <div className="pt-2">
      <div className="relative h-px bg-ink-700 mx-1">
        {milestones.map((m) => {
          const pct = ((new Date(m.date).getTime() - first) / span) * 100;
          const active = m.state === 'active';
          return (
            <span
              key={m.id}
              title={m.label}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                top: -3.5,
                width: 7,
                height: 7,
                borderRadius: '50%',
                transform: 'translateX(-50%)',
                background: active ? '#c8f135' : '#0a0908',
                border: active ? 'none' : '1px solid #605e58',
              }}
            />
          );
        })}
        <span
          style={{
            position: 'absolute',
            left: `${nowPct}%`,
            top: -8,
            bottom: -8,
            width: 1,
            background: '#c8f135',
            opacity: 0.5,
            transform: 'translateX(-50%)',
          }}
        />
      </div>
      <div className="flex justify-between mt-3">
        {milestones.map((m, i) => (
          <div
            key={m.id}
            className={`max-w-[24%] ${i === 0 ? '' : i === milestones.length - 1 ? 'text-right' : 'text-center'}`}
          >
            <div className="kicker" style={{ color: m.state === 'active' ? '#c8f135' : undefined }}>
              {m.month}{m.state === 'active' ? ' · now' : ''}
            </div>
            <div
              className="text-[11px] text-ink-500 mt-1 flex items-center gap-1.5"
              style={{
                justifyContent: i === milestones.length - 1 ? 'flex-end' : i === 0 ? 'flex-start' : 'center',
              }}
            >
              {m.spec != null && <SpecDot n={m.spec} size={5} />}
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
