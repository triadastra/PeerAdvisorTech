import { useState } from 'react';
import { projects } from '../../data/projects';
import { priorities, priorityColor } from '../../data/workspace';
import { createTask, updateTask, deleteTask } from '../../lib/db';
import { SpecTag, SpecDot } from './shared';
import { specLabel, initials, pad } from './util';

const specsSorted = [...projects].sort((a, b) => a.spec - b.spec);
const inputCls = 'bg-transparent border-b border-ink-700 focus:border-acid-500 py-2 text-ink-100 placeholder-ink-600 outline-none transition-colors text-sm';
const selectCls = 'bg-ink-900 border border-ink-700 focus:border-acid-500 py-2 px-2 text-ink-200 outline-none text-sm';

export default function Tasks({ ctx }) {
  const { user, tasks, profiles, reload, specFilter, setSpecFilter, notify } = ctx;
  const [scope, setScope] = useState('Mine');
  const [title, setTitle] = useState('');
  const [spec, setSpec] = useState('');
  const [priority, setPriority] = useState('Med');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);

  const nameById = Object.fromEntries(profiles.map((p) => [p.id, p.name]));

  let list = scope === 'Mine' ? tasks.filter((t) => t.user_id === user.id) : tasks;
  if (specFilter != null) list = list.filter((t) => t.spec === specFilter);

  const myTasks = tasks.filter((t) => t.user_id === user.id);
  const myDone = myTasks.filter((t) => t.status === 'done').length;
  const myTotal = myTasks.length;
  const pct = myTotal > 0 ? Math.round((myDone / myTotal) * 100) : 0;

  const add = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    setBusy(true);
    try {
      await createTask({ user_id: user.id, title: t, spec: spec === '' ? null : Number(spec), priority, due: due || null });
      setTitle(''); setSpec(''); setPriority('Med'); setDue('');
      await reload();
      notify(`Task added · ${t}`);
    } catch (err) {
      notify(err?.message || 'Failed to add task.', 'err');
    } finally { setBusy(false); }
  };

  const toggle = async (t) => {
    const next = t.status === 'done' ? 'open' : 'done';
    try {
      await updateTask(t.id, { status: next });
      await reload();
      if (next === 'done') notify(`Done · ${t.title}`);
    } catch (err) {
      notify(err?.message || 'Could not update task.', 'err');
    }
  };

  const remove = async (t) => {
    try {
      await deleteTask(t.id);
      await reload();
      notify(`Deleted · ${t.title}`);
    } catch (err) {
      notify(err?.message || 'Could not delete task.', 'err');
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      {myTotal > 0 && (
        <div className="border-b border-ink-800 pb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="kicker text-ink-500">Your progress</span>
            <span className="kicker text-ink-400 tnum">{myDone} / {myTotal} done · {pct}%</span>
          </div>
          <div className="h-px bg-ink-800 relative">
            <span
              className="absolute left-0 top-0 h-px bg-acid-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Add form */}
      <form onSubmit={add} className="flex flex-wrap items-end gap-x-5 gap-y-3 border-y border-ink-800 py-5">
        <div className="flex-1 min-w-[200px]">
          <label className="kicker text-ink-500 block mb-1">New task or plan</label>
          <input
            className={`${inputCls} w-full`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to happen…"
          />
        </div>
        <div>
          <label className="kicker text-ink-500 block mb-1">Spec</label>
          <select className={selectCls} value={spec} onChange={(e) => setSpec(e.target.value)}>
            <option value="">AIC</option>
            {specsSorted.map((p) => (
              <option key={p.id} value={p.spec}>S{p.spec} — {p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="kicker text-ink-500 block mb-1">Priority</label>
          <select className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
            {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="kicker text-ink-500 block mb-1">Due</label>
          <input type="date" className={selectCls} value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <button
          type="submit"
          disabled={!title.trim() || busy}
          className="kicker text-ink-950 bg-acid-500 px-5 py-2.5 hover:bg-acid-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? 'Adding…' : 'Add →'}
        </button>
      </form>

      {/* Scope + spec filter */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {['Mine', 'Team'].map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`kicker transition-colors ${scope === s ? 'text-acid-500' : 'text-ink-500 hover:text-ink-200'}`}
          >
            {s}
          </button>
        ))}
        <span className="text-ink-700">·</span>
        <span className="kicker text-ink-500 tnum">{pad(list.length)} shown</span>
        {specFilter != null && (
          <button
            onClick={() => setSpecFilter(null)}
            className="ml-auto inline-flex items-center gap-2 kicker text-ink-300 border border-ink-700 hover:border-acid-500 px-2.5 py-1 transition-colors"
          >
            <SpecDot n={specFilter} /> {specLabel(specFilter)} <span className="text-ink-600">✕</span>
          </button>
        )}
      </div>

      {/* Task list */}
      <div className="border-t border-ink-800">
        {list.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-ink-500 text-sm">No tasks here yet — add one above.</p>
          </div>
        )}
        {list.map((t) => {
          const mine = t.user_id === user.id;
          const done = t.status === 'done';
          return (
            <div key={t.id} className="group flex items-center gap-3 border-b border-ink-800 py-3.5">
              <button
                onClick={() => mine && toggle(t)}
                disabled={!mine}
                aria-label={done ? 'Mark open' : 'Mark done'}
                className={`w-4 h-4 shrink-0 flex items-center justify-center transition-colors ${
                  done ? 'bg-acid-500' : 'border border-ink-600'
                } ${mine ? 'hover:border-acid-500 cursor-pointer' : 'cursor-default opacity-60'}`}
              >
                {done && <span className="text-ink-950 text-[10px] leading-none">✓</span>}
              </button>
              <span className={`flex-1 text-sm truncate ${done ? 'text-ink-600 line-through' : 'text-ink-100'}`}>
                {t.title}
              </span>
              {!mine && (
                <span className="font-mono text-[10px] text-ink-600 border border-ink-800 px-1.5 py-0.5">
                  {initials(nameById[t.user_id] || '')}
                </span>
              )}
              {t.due && (
                <span className="font-mono text-[11px] text-ink-500 tnum shrink-0">{t.due.slice(5)}</span>
              )}
              {t.spec != null && <SpecTag n={t.spec} />}
              <span
                className="kicker shrink-0 w-10 text-right"
                style={{ color: done ? '#605e58' : priorityColor[t.priority] }}
              >
                {done ? 'done' : t.priority}
              </span>
              {mine && (
                <button
                  onClick={() => remove(t)}
                  className="kicker text-ink-700 hover:text-[#fb7185] transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  aria-label="Delete task"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
