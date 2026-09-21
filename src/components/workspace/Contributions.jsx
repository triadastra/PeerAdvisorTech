import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import GitFlow from './GitFlow';

const hours = (n) => Number(n || 0).toFixed(2);
const STATUS = { credited: 'Hours credited', pending: 'Held for your next submission today', merged: 'Combined with a later submission', expired: 'Below threshold · day ended', yearly_cap: '40-hour yearly cap reached', demo: 'Demo example · no real credit awarded', legacy: 'Legacy entry · not Git-scored' };
function Breakdown({ metrics, label = 'Scored signals' }) {
  if (!metrics) return null;
  return <div className="mt-4"><p className="text-xs text-ink-300 mb-2">{label}</p><dl className="grid grid-cols-5 gap-2">{[['L', 'Lines'], ['C', 'Complexity'], ['S', 'Files'], ['T', 'Tested'], ['R', 'Review']].map(([key, name]) => <div key={key} className="bg-ink-950 rounded p-2 text-center"><dt className="text-[10px] text-ink-300">{name}</dt><dd className="font-mono text-sm text-ink-50 mt-1">{metrics[key]}</dd></div>)}</dl></div>;
}
export default function Contributions({ ctx }) {
  const [showDemo, setShowDemo] = useState(true);
  const [records, setRecords] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ assignment_id: '' });
  const [submission, setSubmission] = useState(null);
  const [submissionError, setSubmissionError] = useState('');
  const [updated, setUpdated] = useState(null);
  const [result, setResult] = useState(null);
  const active = useRef(false);
  const requestId = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    try {
      const next = await api.contributions();
      if (!active.current || id !== requestId.current) return;
      setRecords(next); setError(''); setUpdated(new Date());
    } catch (err) { if (active.current && id === requestId.current) setError(err.message); }
  }, []);
  useEffect(() => {
    active.current = true;
    (async () => { await refresh(); })();
    const timer = setInterval(refresh, 5000);
    return () => { active.current = false; clearInterval(timer); };
  }, [refresh]);
  useEffect(() => {
    if (!form.assignment_id) return;
    let live = true;
    const load = async () => {
      try { const s = await api.submissionState(form.assignment_id); if (live) { setSubmission(s); setSubmissionError(''); } }
      catch (err) { if (live) { setSubmission(null); setSubmissionError(err.message); } }
    };
    (async () => { await load(); })();
    const timer = setInterval(load, 5000);
    return () => { live = false; clearInterval(timer); };
  }, [form.assignment_id]);
  const submitted = new Set(records?.feed.filter(c => c.version === records.version && c.user_id === ctx.user.id).map(c => c.assignment_id));
  const available = ctx.myAssignments.filter(a => !submitted.has(a.id));
  const me = records?.scores.find(s => s.user_id === ctx.user.id);
  const set = (key) => (e) => { if (key === 'assignment_id') { setSubmission(null); setSubmissionError(''); } setForm(f => ({ ...f, [key]: e.target.value })); };
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setResult(null);
    try {
      const saved = await api.submitContribution({ assignment_id: form.assignment_id });
      if (!active.current) return;
      setResult(saved);
      setForm({ assignment_id: '' }); setSubmission(null);
      ctx.notify(saved.status === 'pending' ? 'Task finished. Small change held for your next submission today.' : `Task finished. ${hours(saved.hours)} credited hours.`);
      await Promise.all([refresh(), ctx.reload()]);
    } catch (err) { ctx.notify(err.message, 'err'); }
    finally { if (active.current) setBusy(false); }
  };
  const review = async (rating) => {
    if (!submission?.head || busy) return;
    setBusy(true);
    try { await api.reviewSubmission(form.assignment_id, { head: submission.head, rating }); setSubmission(s => ({ ...s, rating })); ctx.notify('Reviewer rating saved for this commit.'); }
    catch (err) { ctx.notify(err.message, 'err'); }
    finally { setBusy(false); }
  };
  return <div className="contributions">
    <div className="studio-section-head"><div><p className="studio-eyebrow">PUSH. FINISH. MAKE AN IMPACT.</p><h1 className="font-display text-4xl text-ink-50 mt-3">Contributions</h1><p className="text-sm text-ink-300 mt-3">Real changes, automatically scored. No AI inspection.</p></div><div className="contribution-score"><strong>{hours(me?.score)} <small className="text-lg">h</small></strong><span>of 40 credited hours · {records?.year || 'this year'}</span><progress aria-label="Yearly credited hours" value={me?.score || 0} max={40} className="block mt-2 w-full accent-[#c8f135]" /></div></div>
    <GitFlow ctx={ctx} />
    <details className="contribution-panel mb-6 text-sm"><summary className="cursor-pointer text-ink-100">How credited hours work</summary><p className="mt-3 text-ink-300">Push to main using your workspace login, then finish the task below. The system measures effective lines (L), changed-function complexity (C), source-file spread (S, max 15), verified tests (T), and an optional reviewer rating (R, default 0).</p><code className="block my-3 text-xs break-words text-acid-500">min(4, 0.4 ln(1+L/500) + 0.3 ln(1+C/10) + 0.15 ln(1+S) + 0.3T + 0.4R)</code><p className="text-ink-300">Lockfiles, generated/vendor code, data files, and notebook outputs are excluded. Whitespace and unchanged moved functions do not add credit. Under 0.25 h is combined with your next submission that day (Hong Kong time). Maximum 4 h per scored group and 40 h per calendar year. These are formula-based credits, not a measurement of time spent or code quality.</p><p className="mt-3 text-ink-300">A shared task closes to further pushes when first finished. Teammates can still submit their own recorded push ranges. CI must report a passing result for the exact final commit to enable the test bonus. {records?.ci_configured ? 'Trusted CI reporting is configured.' : 'CI reporting is not configured; T stays 0.'}</p></details>
    {error && <div role="alert" className="border border-[#fb7185] p-4 mb-5 text-sm">{error} {records && 'Showing the last successful update.'} <button onClick={refresh} className="underline">Retry</button></div>}
    {result && <div role="status" className="contribution-panel mb-6 border-acid-500"><strong className="text-acid-500">Task finished · {hours(result.hours)} h credited</strong><p className="mt-2 text-sm">{STATUS[result.status]}. Calculated: {hours(result.calculated_hours)} h before the yearly cap.</p><Breakdown metrics={result.credited_metrics} /></div>}
    <div className="contribution-layout"><div>
      <form onSubmit={submit} className="contribution-panel space-y-4">
        <h2 className="font-display text-xl text-ink-50">Finish a task</h2>
        <p className="text-sm text-ink-300">Your activity and score are generated from verified Git pushes. There is nothing to write up or self-report.</p>
        {!records ? <p>{error ? 'Reconnect to load your submissions.' : 'Loading your submissions…'}</p> : available.length ? <>
          <label className="block text-sm">Your project step<select required value={form.assignment_id} onChange={set('assignment_id')} disabled={busy}><option value="">Choose a step you joined</option>{available.map(a => <option key={a.id} value={a.id}>{a.track_title} · {a.node_title}</option>)}</select></label>
          {form.assignment_id && <div className="bg-ink-950 p-4 rounded text-xs space-y-2" role="status">{submissionError ? <p className="text-[#fb7185]">{submissionError}</p> : submission ? <><p>Latest main: <code>{submission.head?.slice(0, 12) || 'No commit yet'}</code> · pushed by {submission.pushed_by || 'no verified student yet'}</p><p>CI: {submission.ci} · Reviewer rating: {submission.rating}/2</p><p className={submission.can_finish ? 'text-acid-500' : 'text-[#ffc145]'}>{submission.can_finish ? 'Your authenticated pushes are ready to score.' : 'Push your changes to main with your workspace email and password first.'}</p>{records.can_review && <div className="flex gap-3">{[0, 1, 2].map(r => <button type="button" key={r} disabled={busy} onClick={() => review(r)} className="underline">Rate {r}</button>)}</div>}</> : 'Checking pushed commits…'}</div>}
          <p className="text-xs text-ink-300">Finishing closes the shared task to further pushes. Make sure your team has uploaded its work.</p>
          <button disabled={busy || !submission?.can_finish} className="studio-primary disabled:opacity-50">{busy ? 'Inspecting Git diff…' : 'Finish task & calculate hours'}</button>
        </> : <p className="text-sm text-ink-300">{ctx.myAssignments.length ? 'Your submitted work is recorded below. Ready for your next build?' : 'Join a project step and push your code to get started.'} <button type="button" className="text-acid-500" onClick={() => ctx.go('Groups & Tasks')}>Explore projects →</button></p>}
      </form>
      <div className="flex flex-wrap justify-between gap-2 mt-8 mb-4"><h2 className="font-display text-xl text-ink-50">Student activity</h2><span className="text-xs text-ink-300">{updated ? `Updates every 5s · Synced ${updated.toLocaleTimeString()}` : 'Connecting…'}</span></div>
      {records?.demo_feed?.length > 0 && <label className="flex items-center gap-3 mb-4 text-sm text-ink-300"><input type="checkbox" checked={showDemo} onChange={e => setShowDemo(e.target.checked)} style={{ width: 'auto', margin: 0 }} /> Show demo school activity · sample hours never affect student totals</label>}
      {records?.feed.length === 0 && (!showDemo || !records?.demo_feed?.length) && <p className="contribution-panel text-sm">No finished tasks yet. Your first pushed change starts the story.</p>}
      <div className="space-y-4">{[...(records?.feed || []), ...(showDemo ? records?.demo_feed || [] : [])].map(c => <article key={c.id} className="contribution-panel">
        <div className="flex justify-between gap-3 text-xs"><span className="text-ink-100">{c.demo && <span className="mr-2 rounded bg-[#40344e] px-2 py-1 text-[#dbc4f2]">DEMO</span>}{c.author}{c.user_id === ctx.user.id ? ' · you' : ''}</span><span className="text-acid-500">+{hours(c.hours)} h</span></div>
        <h3 className="font-display text-xl text-ink-50 mt-3 break-words">{c.title}</h3><p className="text-xs text-ink-300 mt-1">{c.track_title} · {c.node_title}</p><p className="text-sm text-ink-200 my-4 whitespace-pre-wrap break-words">{c.body}</p>
        <p className="text-sm text-acid-500">{STATUS[c.status] || c.status}</p>
        {c.head && <p className="text-xs text-ink-300 mt-3 break-all">Git {c.base.slice(0, 10)} → {c.head.slice(0, 10)} · {c.version}</p>}
        <Breakdown metrics={c.credited_metrics} label={c.merged_ids?.length ? 'Combined signals, including earlier small submissions' : 'Scored signals'} />
        {c.metrics && <details className="text-xs text-ink-300 mt-4"><summary className="cursor-pointer">Scoring evidence</summary><p className="mt-2">Calculated {hours(c.calculated_hours)} h · credited {hours(c.hours)} h after threshold and cap</p><p className="mt-2">CI: {c.ci ? (c.ci.passed ? 'passed' : 'failed') : 'not reported'} · Review: {c.review?.rating ?? 0}/2</p><p className="mt-2">This submission: L {c.metrics.L} · C {c.metrics.C} · S {c.metrics.S} · T {c.metrics.T} · R {c.metrics.R}</p>{c.ranges?.map(r => <p key={r.base} className="mt-2 break-all">Your push range: {r.base} → {r.head}</p>)}</details>}
        <div className="mt-4 text-xs text-ink-300"><time dateTime={c.created_at}>{new Date(c.created_at).toLocaleString()}</time></div>
      </article>)}</div>
    </div><aside className="contribution-panel self-start"><h2 className="font-display text-xl text-ink-50">School builders</h2><p className="text-xs text-ink-300 mt-2 mb-5">Credited hours · {records?.year} · 40 h maximum</p>{records?.scores.map(s => <div key={s.user_id} className="flex items-center gap-3 border-t border-ink-700 py-4"><div className="min-w-0 flex-1"><p className="text-sm text-ink-100 break-words">{s.name}{s.user_id === ctx.user.id ? ' (you)' : ''}</p><p className="text-xs text-ink-300 mt-1">{s.submissions} finished submission{s.submissions === 1 ? '' : 's'}</p></div><strong className="font-mono text-acid-500 whitespace-nowrap">{hours(s.score)} h</strong></div>)}{showDemo && records?.demo_scores?.length > 0 && <section className="mt-8 border-t border-ink-700 pt-5"><h3 className="font-display text-lg text-[#dbc4f2]">Demo school</h3><p className="text-xs text-ink-300 mt-1 mb-3">Sample students & hours · preview only</p>{records.demo_scores.map(s => <div className="flex justify-between gap-3 py-3 border-t border-ink-700 text-sm" key={s.user_id}><span>{s.name}<small className="block text-ink-300">{s.submissions} demo log{s.submissions === 1 ? '' : 's'}</small></span><span className="text-[#dbc4f2] whitespace-nowrap">{hours(s.score)} h</span></div>)}</section>}</aside></div>
  </div>;
}
