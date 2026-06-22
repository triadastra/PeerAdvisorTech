import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/authContext';
import { vidFor, listTasks, listEvents, listProfiles } from '../../lib/db';
import { projects } from '../../data/projects';
import { daysUntil, HANDOFF_DATE, starterTasks } from '../../data/workspace';
import { createTask } from '../../lib/db';
import { SpecDot } from './shared';
import { pad, initials, findPerson } from './util';
import Overview from './Overview';
import CalendarView from './Calendar';
import TimelineView from './Timeline';
import AgentsView from './Agents';
import TeamView from './Team';
import TasksView from './Tasks';

const TABS = ['Overview', 'Calendar', 'Timeline', 'Agents', 'Team', 'Tasks'];
const specsSorted = [...projects].sort((a, b) => a.spec - b.spec);

function mkClock() {
  const d = new Date();
  return {
    timeStr: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    dateStr: d.toISOString().slice(0, 10).replace(/-/g, '·'),
  };
}

export default function Workspace() {
  const { user, profile, signOut } = useAuth();
  const [tab, setTab] = useState('Overview');
  const [specFilter, setSpecFilter] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState(mkClock);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const reload = useCallback(async () => {
    const [t, e, p] = await Promise.all([listTasks(), listEvents(), listProfiles()]);
    setTasks(t);
    setEvents(e);
    setProfiles(p);
    setLoading(false);
  }, []);

  // Initial load — auto-seed starter tasks on first visit (no tasks yet).
  useEffect(() => {
    let active = true;
    (async () => {
      const [t, e, p] = await Promise.all([listTasks(), listEvents(), listProfiles()]);
      if (!active) return;
      if (t.length === 0 && user) {
        try {
          await Promise.all(starterTasks.map((s) => createTask({ user_id: user.id, ...s })));
          const [t2] = await Promise.all([listTasks()]);
          if (!active) return;
          setTasks(t2);
        } catch { /* no-op */ }
      } else {
        setTasks(t);
      }
      setEvents(e);
      setProfiles(p);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live clock — updates every minute.
  useEffect(() => {
    const t = setInterval(() => setClock(mkClock()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Toast helper — replaces any in-flight toast.
  const notify = useCallback((msg, type = 'ok') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const name = profile?.name || user?.name || user?.email?.split('@')[0] || 'Member';
  const person = findPerson(name);
  const role = person?.title || profile?.role || user?.role || 'Member';
  const vid = profile?.vid || vidFor(user);
  const { timeStr, dateStr } = clock;

  const openBySpec = (n) => tasks.filter((t) => t.spec === n && t.status !== 'done').length;
  const go = (t, spec = null) => { setTab(t); setSpecFilter(spec); };

  const ctx = {
    user, name, person, role,
    tasks, events, profiles,
    reload, loading, notify,
    go, specFilter, setSpecFilter,
  };

  const Section = { Overview, Calendar: CalendarView, Timeline: TimelineView, Agents: AgentsView, Team: TeamView, Tasks: TasksView }[tab];

  return (
    <div className="min-h-screen">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-ink-950/90 backdrop-blur-md border-b border-ink-800">
        <div className="mx-auto max-w-[1320px] px-4 md:px-6 h-[60px] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="inline-block w-2 h-2 bg-acid-500" />
            <span className="font-mono text-sm font-semibold text-ink-50">PATD<span className="text-ink-500 font-normal">/workspace</span></span>
          </Link>

          <div className="flex items-center gap-3 md:gap-5">
            <span className="hidden md:flex items-center gap-2 kicker text-ink-400">
              <span className="w-1.5 h-1.5 rounded-full bg-acid-500 status-dot" /> Operational
            </span>
            <span className="hidden sm:flex items-center gap-1.5 kicker text-ink-500 tnum">
              <span className="text-ink-300">{timeStr}</span>
              <span className="text-ink-700">·</span>
              <span>{dateStr}</span>
            </span>
            <div className="flex items-center gap-2.5 border-l border-ink-800 pl-3 md:pl-5">
              <span className="font-mono text-[10px] w-8 h-8 border border-acid-500/30 flex items-center justify-center text-acid-500 shrink-0">{initials(name)}</span>
              <div className="hidden sm:block leading-tight">
                <div className="text-[13px] text-ink-100">{name}</div>
                <div className="kicker text-ink-700">{vid}</div>
              </div>
              <button
                onClick={signOut}
                className="ml-2 kicker text-ink-500 hover:text-ink-200 transition-colors border border-ink-800 hover:border-ink-600 px-2.5 py-1"
                aria-label="Sign out"
              >
                Exit
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab strip ── */}
        <div className="mx-auto max-w-[1320px] px-4 md:px-6">
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => go(t)}
                className={`kicker shrink-0 py-3 -mb-px border-b-2 transition-colors ${
                  tab === t ? 'text-ink-50 border-acid-500' : 'text-ink-500 border-transparent hover:text-ink-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body: spec rail + active section ── */}
      <div className="mx-auto max-w-[1320px] px-4 md:px-6 grid lg:grid-cols-[200px_1fr] gap-6 lg:gap-10 py-8 md:py-10">
        {/* ── Spec rail ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-[140px]">
            <div className="kicker text-ink-500 mb-3">Spec index</div>
            <div className="space-y-0.5">
              {specsSorted.map((p) => {
                const count = openBySpec(p.spec);
                return (
                  <button
                    key={p.id}
                    onClick={() => go('Tasks', p.spec)}
                    className="group w-full flex items-center gap-2.5 py-1.5 text-left"
                  >
                    <SpecDot n={p.spec} />
                    <span className="font-mono text-[11px] text-ink-600 w-7 tnum">S{p.spec}</span>
                    <span className="text-[13px] text-ink-300 group-hover:text-ink-50 transition-colors flex-1 truncate">{p.title}</span>
                    {count > 0 && <span className="font-mono text-[10px] text-acid-500 tnum">{count}</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 pt-5 border-t border-ink-800">
              <div className="kicker text-ink-500 mb-3">Handoff</div>
              <div className="font-display text-3xl text-ink-50 tnum">{pad(daysUntil(HANDOFF_DATE))}</div>
              <div className="kicker text-ink-500 mt-1">days · {HANDOFF_DATE}</div>
            </div>
          </div>
        </aside>

        {/* ── Active section ── */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-w-0"
        >
          <div className="mb-7">
            {tab === 'Overview' ? (
              <>
                <div className="kicker text-ink-500 mb-1.5">{role} · {dateStr}</div>
                <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-ink-50">Dashboard</h1>
              </>
            ) : (
              <>
                <div className="kicker text-ink-500 mb-1.5">{role}</div>
                <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-ink-50">{tab}</h1>
              </>
            )}
          </div>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 border border-ink-800 bg-ink-900/30" />
              ))}
            </div>
          ) : (
            Section && <Section ctx={ctx} />
          )}
        </motion.div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <motion.div
          key={toast.msg}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-ink-900 border border-ink-800 px-4 py-3 max-w-xs"
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: toast.type === 'err' ? '#fb7185' : '#c8f135' }}
          />
          <span className="text-sm text-ink-100 leading-snug">{toast.msg}</span>
        </motion.div>
      )}
    </div>
  );
}
