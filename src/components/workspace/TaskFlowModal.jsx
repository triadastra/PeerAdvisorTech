import { useEffect, useState } from 'react';
import { fmtCountdown } from './util';

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* clipboard access is optional */ }
  };
  return <div>
    <div className="kicker text-ink-500 mb-1.5">{label}</div>
    <div className="flex items-stretch border border-ink-700 bg-ink-950">
      <code className="flex-1 min-w-0 px-3 py-2.5 font-mono text-[12px] text-acid-500 overflow-x-auto no-scrollbar whitespace-nowrap">{value}</code>
      <button type="button" onClick={copy} className="kicker px-3 border-l border-ink-700 text-ink-400 hover:text-ink-50 hover:bg-ink-900 transition-colors shrink-0">{copied ? '✓' : 'Copy'}</button>
    </div>
  </div>;
}

function Step({ number, title, children, active = false, complete = false }) {
  return <div className={`flex gap-3 ${active ? 'text-ink-100' : complete ? 'text-acid-500' : 'text-ink-500'}`}>
    <span className="font-mono text-xs w-5 shrink-0">{complete ? '✓' : number}</span>
    <div className="min-w-0"><strong className="text-sm font-normal">{title}</strong>{children && <p className="mt-1 text-xs text-ink-400 leading-relaxed">{children}</p>}</div>
  </div>;
}

export default function TaskFlowModal({ entry, info, busy, error, onJoin, onSync, onSubmit, onClose }) {
  const [phase, setPhase] = useState(entry.joined ? 'workspace' : 'confirm');
  const [task, setTask] = useState(entry.task);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pushed = !!task.head && !!task.base_sha && task.head !== task.base_sha;
  const reviewReady = task.status === 'review' || !!task.submission;
  const recruitingOpen = task.recruiting_ends_at && now < task.recruiting_ends_at;
  const update = result => setTask(result?.task || result);

  const join = async () => {
    update(await onJoin(task));
    setPhase('workspace');
  };
  const sync = async () => update(await onSync(task));
  const submit = async () => update(await onSubmit(task));

  return <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-950/80 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
    <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-ink-900 border border-ink-700" onClick={e => e.stopPropagation()}>
      <div className="flex items-start justify-between gap-4 border-b border-ink-800 px-6 py-4">
        <div><div className="kicker text-acid-500 mb-1">{task.project_title || 'Project task'}</div><h2 className="font-display text-2xl text-ink-50">{task.title}</h2></div>
        <button type="button" onClick={onClose} className="kicker text-ink-500 hover:text-ink-100 shrink-0">Close ✕</button>
      </div>

      {phase === 'confirm' ? <div className="px-6 py-6 space-y-5">
        <div><div className="kicker text-acid-500 mb-2">Step 1 of 2 · join decision</div><h3 className="font-display text-2xl text-ink-50">Are you sure you want to do this project?</h3><p className="mt-2 text-sm text-ink-300 leading-relaxed">You are joining this exact task, not just bookmarking it. Once you confirm, your shared workspace opens and teammates have 24 hours to join before recruitment closes.</p></div>
        <div className="border border-ink-800 bg-ink-950 p-4 space-y-3">
          <Step number="01" title="Find teammates for 24 hours">{task.members?.length ? `${task.members.join(', ')} ${task.members.length === 1 ? 'is' : 'are'} already on this task.` : 'You will open the teammate window for this task.'}</Step>
          <Step number="02" title="Work from the Git workspace">Your local pushes go to Launchpad, where the submitted commit is retained for review.</Step>
          <Step number="03" title="Review before PR">The exact base-to-push diff is shown to the PA Tech admin before a GitHub pull request is opened.</Step>
        </div>
        {task.repository && <p className="text-xs text-ink-400">GitHub source: <a className="text-acid-500 underline break-all" href={`https://github.com/${task.repository}`} target="_blank" rel="noreferrer">{task.repository}</a> · main</p>}
        {error && <p role="alert" className="text-sm text-[#fb7185]">{error}</p>}
        <div className="flex gap-3"><button type="button" className="studio-primary" disabled={busy} onClick={join}>{busy ? 'Joining…' : 'Yes — open this project →'}</button><button type="button" className="kicker text-ink-500 hover:text-ink-200" onClick={onClose}>Not now</button></div>
      </div> : <div className="px-6 py-6 space-y-6">
        <div><div className="kicker text-acid-500 mb-2">Step 2 of 2 · shared workspace</div><h3 className="font-display text-2xl text-ink-50">Your project handoff</h3><p className="mt-2 text-sm text-ink-300">{task.members?.length > 1 ? `Team: ${task.members.join(', ')}. ` : ''}{recruitingOpen ? `Recruiting closes in ${fmtCountdown(task.recruiting_ends_at)}.` : 'Recruitment is closed; existing members can keep working.'}</p></div>

        {task.repository && task.clone_url ? <section className="border border-ink-700 bg-ink-950 p-4 space-y-4">
          <div><div className="kicker text-acid-500 mb-1">Git workspace</div><p className="text-xs text-ink-400">This is the task repo on Launchpad. Clone it, make changes locally, commit, then push to <code className="text-ink-200">main</code>.</p></div>
          <p className="text-xs text-ink-400">GitHub source: <a className="text-acid-500 underline break-all" href={`https://github.com/${task.repository}`} target="_blank" rel="noreferrer">{task.repository}</a> · main</p>
          <CopyRow label="Your Launchpad Git remote" value={task.clone_url} />
          <details><summary className="cursor-pointer text-sm text-ink-200">Clone, push, and send the work back</summary><pre className="mt-3 bg-ink-900 border border-ink-800 p-3 text-xs text-ink-300 overflow-x-auto">{`git -c http.extraHeader="X-Patech-Git: YOUR_CREDENTIAL" clone ${task.clone_url}\ncd ${task.id}\ngit config http.extraHeader "X-Patech-Git: YOUR_CREDENTIAL"\n# edit files, commit, then:\ngit pull --no-rebase origin main\ngit push origin main`}</pre><p className="mt-2 text-xs text-ink-500">Generate your private Git credential in the project list. Launchpad records the authenticated push, not just the commit author.</p></details>
        </section> : <div className="border border-ink-800 bg-ink-950 p-4 text-sm text-ink-400">This task is not linked to a GitHub repository. Complete it in the normal workspace flow.</div>}

        {task.repository && <section className="space-y-3">
          <div className="kicker text-ink-500">Handoff status</div>
          <div className="border border-ink-800 p-4 space-y-3">
            <Step number="01" title="Teammate window" complete={!!task.members?.length}>{task.recruiting_ends_at ? (recruitingOpen ? `${fmtCountdown(task.recruiting_ends_at)} left to find teammates.` : 'Recruitment closed; the team is locked.') : 'Starts when the first teammate joins.'}</Step>
            <Step number="02" title="Receive pushed work" complete={pushed} active={!pushed}>Launchpad checks the task repo and keeps the latest pushed commit{task.head ? ` (${task.head.slice(0, 10)})` : ''}.</Step>
            <Step number="03" title="Show diff, then open PR" complete={!!task.pr} active={reviewReady && !task.pr}>{task.pr ? 'The GitHub pull request is open.' : reviewReady ? 'The exact diff is ready for PA Tech admin review in Launchpad.' : 'Submit after all teammates have pushed their work.'}</Step>
          </div>
          {error && <p role="alert" className="text-sm text-[#fb7185]">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="border border-ink-600 px-4 py-2 text-sm disabled:opacity-40" disabled={busy} onClick={sync}>{busy ? 'Checking…' : 'Receive pushed work'}</button>
            <button type="button" className="studio-primary disabled:opacity-40" disabled={busy || !pushed || reviewReady || !!task.pr} onClick={submit}>{busy ? 'Submitting…' : reviewReady ? 'Submitted for diff review' : 'Submit for PR diff review'}</button>
            {info?.admin && info.review_url && reviewReady && !task.pr && <a className="border border-acid-500 text-acid-500 px-4 py-2 text-sm" href={info.review_url} target="_blank" rel="noreferrer">Review diff in Launchpad ↗</a>}
            {task.pr && <a className="border border-acid-500 text-acid-500 px-4 py-2 text-sm" href={task.pr} target="_blank" rel="noreferrer">Open GitHub PR ↗</a>}
          </div>
          {!pushed && <p className="text-xs text-ink-500">The review button unlocks after Launchpad receives a push that differs from the starting commit.</p>}
        </section>}
        <button type="button" onClick={onClose} className="kicker text-ink-500 hover:text-ink-200">Back to projects</button>
      </div>}
    </div>
  </div>;
}
