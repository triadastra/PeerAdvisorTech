import { useState } from 'react';
import { projects } from '../../data/projects';
import { createEvent, deleteEvent } from '../../lib/db';
import { SpecDot, SpecTag } from './shared';
import { fmtTime, pad } from './util';

const specsSorted = [...projects].sort((a, b) => a.spec - b.spec);
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const selectCls = 'bg-ink-900 border border-ink-700 focus:border-acid-500 py-2 px-2 text-ink-200 outline-none text-sm';
const inputCls = 'bg-transparent border-b border-ink-700 focus:border-acid-500 py-2 text-ink-100 placeholder-ink-600 outline-none transition-colors text-sm';

const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const keyOfIso = (iso) => keyOf(new Date(iso));

export default function CalendarView({ ctx }) {
  const { user, events, reload, notify } = ctx;
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(keyOf(today));

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00');
  const [spec, setSpec] = useState('');
  const [withWhom, setWithWhom] = useState('');
  const [busy, setBusy] = useState(false);

  const byDay = {};
  for (const e of events) (byDay[keyOfIso(e.starts_at)] ||= []).push(e);

  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const firstCell = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - start.getDay());
  const cells = Array.from({ length: 42 }, (_, i) => new Date(firstCell.getFullYear(), firstCell.getMonth(), firstCell.getDate() + i));

  const selectedEvents = (byDay[selected] || []).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const monthLabel = cursor.toLocaleString([], { month: 'long', year: 'numeric' });
  const shift = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  const add = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setBusy(true);
    try {
      const starts_at = new Date(`${selected}T${time}`).toISOString();
      await createEvent({ user_id: user.id, title: t, spec: spec === '' ? null : Number(spec), starts_at, with_whom: withWhom.trim() || null });
      setTitle(''); setWithWhom('');
      await reload();
      notify(`Event added · ${t}`);
    } catch (err) {
      notify(err?.message || 'Failed to add event.', 'err');
    } finally { setBusy(false); }
  };

  const remove = async (ev) => {
    try {
      await deleteEvent(ev.id);
      await reload();
      notify(`Event removed · ${ev.title}`);
    } catch (err) {
      notify(err?.message || 'Could not delete event.', 'err');
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
      {/* Month grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-display text-xl text-ink-100">{monthLabel}</span>
          <div className="flex items-center gap-4">
            <button onClick={() => shift(-1)} className="kicker text-ink-500 hover:text-acid-500 transition-colors" aria-label="Previous month">‹</button>
            <button onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(keyOf(today)); }} className="kicker text-ink-500 hover:text-acid-500 transition-colors">Today</button>
            <button onClick={() => shift(1)} className="kicker text-ink-500 hover:text-acid-500 transition-colors" aria-label="Next month">›</button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-l border-t border-ink-800">
          {WD.map((d) => (
            <div key={d} className="border-r border-b border-ink-800 py-2 text-center kicker text-ink-600">{d}</div>
          ))}
          {cells.map((d) => {
            const k = keyOf(d);
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = k === keyOf(today);
            const isSel = k === selected;
            const dayEvents = byDay[k] || [];
            return (
              <button
                key={k}
                onClick={() => setSelected(k)}
                className={`relative border-r border-b border-ink-800 h-16 md:h-20 p-1.5 text-left transition-colors ${isSel ? 'bg-ink-900' : 'hover:bg-ink-900/50'} ${isToday ? 'ring-1 ring-inset ring-acid-500/30' : ''}`}
              >
                <span className={`font-mono text-[11px] tnum ${isToday ? 'text-acid-500 font-semibold' : inMonth ? 'text-ink-300' : 'text-ink-700'}`}>
                  {pad(d.getDate())}
                </span>
                <span className="absolute left-1.5 bottom-1.5 flex flex-wrap gap-1 max-w-[90%]">
                  {dayEvents.slice(0, 4).map((ev) => <SpecDot key={ev.id} n={ev.spec} size={5} />)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day agenda + add */}
      <aside>
        <div className="kicker text-ink-500 mb-3">
          {new Date(`${selected}T00:00`).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
        <div className="border-t border-ink-800 mb-6">
          {selectedEvents.length === 0 && <p className="py-4 text-ink-600 text-sm">Nothing scheduled.</p>}
          {selectedEvents.map((ev) => (
            <div key={ev.id} className="group flex items-center gap-2.5 border-b border-ink-800 py-3">
              <span className="font-mono text-[11px] text-ink-400 w-11 tnum shrink-0">{fmtTime(ev.starts_at)}</span>
              <span className="flex-1 text-[13px] text-ink-200 truncate">
                {ev.title}{ev.with_whom && <span className="text-ink-600"> · w/ {ev.with_whom}</span>}
              </span>
              <SpecTag n={ev.spec} />
              {ev.user_id === user.id && (
                <button onClick={() => remove(ev)} className="kicker text-ink-700 hover:text-[#fb7185] transition-colors opacity-0 group-hover:opacity-100" aria-label="Delete event">✕</button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={add} className="space-y-3">
          <div className="kicker text-ink-500">Add event</div>
          <input className={`${inputCls} w-full`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
          <div className="flex gap-3">
            <input type="time" className={selectCls} value={time} onChange={(e) => setTime(e.target.value)} />
            <select className={`${selectCls} flex-1`} value={spec} onChange={(e) => setSpec(e.target.value)}>
              <option value="">AIC</option>
              {specsSorted.map((p) => <option key={p.id} value={p.spec}>S{p.spec} — {p.title}</option>)}
            </select>
          </div>
          <input className={`${inputCls} w-full`} value={withWhom} onChange={(e) => setWithWhom(e.target.value)} placeholder="With… (optional)" />
          <button type="submit" disabled={!title.trim() || busy} className="w-full kicker text-ink-950 bg-acid-500 px-4 py-2.5 hover:bg-acid-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {busy ? 'Adding…' : 'Add to ' + selected.slice(5)}
          </button>
        </form>
      </aside>
    </div>
  );
}
