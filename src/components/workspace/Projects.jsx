import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { fmtCountdown } from './util';
const field = 'w-full bg-ink-950 border border-ink-700 px-3 py-2 text-sm text-ink-100';
const button = 'border border-ink-600 px-4 py-2 text-sm disabled:opacity-40';
const newStep = () => ({ key: crypto.randomUUID(), title: '', description: '' });

export default function Projects({ ctx, mine = false }) {
  const { projects, projectInfo: info, reloadProjects: load } = ctx;
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [creating, setCreating] = useState(false);
  const [title, setTitle] = useState(''), [description, setDescription] = useState('');
  const [steps, setSteps] = useState(() => [newStep()]);
  const [repos, setRepos] = useState([]), [repository, setRepository] = useState('');
  const [device, setDevice] = useState(null), [credential, setCredential] = useState(''), [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [addingTo, setAddingTo] = useState(null), [taskTitle, setTaskTitle] = useState(''), [taskInstructions, setTaskInstructions] = useState('');
  const [showArchived, setShowArchived] = useState(false), [deleting, setDeleting] = useState(null);
  const [now, tick] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => tick(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const act = async fn => { setBusy(true); setError(''); try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const loadRepos = async (n = 1) => { const rows = await api.projectService(`/github/repos?page=${n}`); setRepos(old => n === 1 ? rows : [...old, ...rows]); setPage(n); };
  const updateStep = (key, patch) => setSteps(old => old.map(n => n.key === key ? { ...n, ...patch } : n));
  const moveStep = (i, delta) => setSteps(old => { const rows = [...old]; [rows[i], rows[i + delta]] = [rows[i + delta], rows[i]]; return rows; });
  const joined = t => t.members.includes(info?.user_id);
  const visible = projects.map(p => ({ ...p, tasks: p.tasks.filter(t => showArchived || !t.archived_at) })).filter(p => (!mine || p.tasks.some(joined)) && `${p.title} ${p.description} ${p.tasks.map(t => t.title).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-3">
      <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-50">{mine ? 'My builds' : 'Explore projects'}</h1>
      <div className="flex gap-2"><button className={button} disabled={busy} onClick={() => act(load)}>Refresh</button>{info?.admin && !mine && <button className="studio-primary" onClick={() => setCreating(v => !v)}>{creating ? 'Close project form' : 'New project'}</button>}</div>
    </div>
    <p className="text-ink-300">{mine ? 'Your projects and the tasks you’ve joined. Keep building with your teammates after recruitment closes.' : 'Projects are a series of tasks published by admins. Start a task to open its 24-hour window for finding teammates.'}</p>
    {(error || ctx.projectError) && <p role="alert" className="text-[#fb7185]">{error || ctx.projectError}</p>}
    {creating && info?.admin && !mine && <section className="border border-ink-700 p-5 space-y-4">
      <h2 className="text-xl text-ink-100">Create a project</h2>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); act(async () => {
        await api.projectService('/projects', { title, description, repository, tasks: steps.map(({ title, description }) => ({ title, description })) });
        setCreating(false); setTitle(''); setDescription(''); setSteps([newStep()]); setRepository(''); await load(); ctx.notify('Project and tasks published');
      }); }}>
        <label className="block text-sm text-ink-300">Project title<input className={field} required maxLength={200} value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label className="block text-sm text-ink-300">About this project<textarea className={field} maxLength={10000} value={description} onChange={e => setDescription(e.target.value)} /></label>
        <div className="space-y-4"><h3 className="text-lg text-ink-100">Tasks in this project</h3>{steps.map((n, i) => <fieldset key={n.key} className="border border-ink-800 p-4 space-y-3">
          <legend className="text-sm px-2">Task {i + 1}</legend>
          <label className="block text-sm text-ink-300">Task {i + 1} title<input className={field} required maxLength={200} value={n.title} onChange={e => updateStep(n.key, { title: e.target.value })} /></label>
          <label className="block text-sm text-ink-300">Task {i + 1} instructions<textarea className={field} maxLength={10000} value={n.description} onChange={e => updateStep(n.key, { description: e.target.value })} /></label>
          <div className="flex gap-2"><button type="button" className={button} disabled={busy || i === 0} onClick={() => moveStep(i, -1)}>Move up</button><button type="button" className={button} disabled={busy || i === steps.length - 1} onClick={() => moveStep(i, 1)}>Move down</button><button type="button" className={button} disabled={busy || steps.length === 1} onClick={() => setSteps(old => old.filter(x => x.key !== n.key))}>Remove task {i + 1}</button></div>
        </fieldset>)}<button type="button" className={button} disabled={busy || steps.length >= 20} onClick={() => setSteps(old => [...old, newStep()])}>Add task</button></div>
        <details className="border border-ink-800 p-4 space-y-3"><summary className="cursor-pointer">GitHub repository (optional)</summary>
          <p className="text-sm text-ink-400">New code tasks always start from the latest main branch. Existing work merges main updates when cloned or pulled; submissions go to Launchpad for admin review before a GitHub PR.</p>
          <div className="flex gap-3 flex-wrap">
            <button type="button" className={button} disabled={busy} onClick={() => act(async () => setDevice(await api.projectService('/github/device/start', {})))}>Connect GitHub with Launchpad</button>
            <button type="button" className={button} disabled={busy} onClick={() => act(() => loadRepos())}>Choose from my repositories</button>
          </div>
          {device && <div className="text-sm space-y-2"><p>Open <a className="underline" href={device.verification_uri || 'https://github.com/login/device'} target="_blank" rel="noreferrer">GitHub device sign-in</a> and enter <strong>{device.user_code}</strong>.</p><button type="button" className={button} disabled={busy} onClick={() => act(async () => { const r = await api.projectService('/github/device/poll', { device_code: device.device_code }); if (r.pending) throw new Error('Finish GitHub sign-in, then check again.'); if (r.error) throw new Error(r.reason || r.error); setDevice(null); await load(); await loadRepos(); })}>Check GitHub connection</button></div>}
          <label className="block text-sm">Repository<select className={field} value={repository} disabled={busy} onChange={e => setRepository(e.target.value)}><option value="">No repository</option>{repos.map(r => <option key={r.name}>{r.name}</option>)}</select></label>
          {repos.length > 0 && <button type="button" className={button} disabled={busy} onClick={() => act(() => loadRepos(page + 1))}>Load more repositories</button>}
          {repository && <p className="text-sm text-ink-300">Source branch: main (always the latest version)</p>}
        </details>
        <button disabled={busy || !title.trim() || steps.some(n => !n.title.trim())} className="studio-primary">{busy ? 'Publishing…' : 'Publish project and tasks'}</button>
      </form>
    </section>}
    {info?.admin && <a className="text-sm underline" target="_blank" rel="noreferrer" href={info.review_url}>Review project submissions in Launchpad ↗</a>}
    {projects.some(p => p.tasks.some(t => t.archived_at)) && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />Show archived tasks</label>}
    {deleting && <div role="alertdialog" aria-labelledby="delete-task-title" aria-describedby="delete-task-description" className="border border-[#fb7185] bg-ink-950 p-5 space-y-3">
      <h2 id="delete-task-title" className="text-lg">Delete “{deleting.title}”?</h2>
      <p id="delete-task-description" className="text-sm text-ink-300">This removes the task from its project and closes access to its shared code. Existing GitHub branches and pull requests stay unchanged. Archive instead if you want to restore the task later.</p>
      <div className="flex gap-3"><button className={button} disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button className={button + ' text-[#fb7185]'} disabled={busy} onClick={() => act(async () => { await api.projectService(`/tasks/${deleting.id}/delete`, { confirm_title: deleting.title }); setDeleting(null); await load(); ctx.notify('Task deleted'); })}>Delete task</button></div>
    </div>}
    {projects.length > 0 && <input className={field} aria-label="Search projects and tasks" placeholder="Search projects and tasks" value={query} onChange={e => setQuery(e.target.value)} />}
    {ctx.projectsLoading ? <p>Loading projects…</p> : !ctx.projectError && !visible.length && <p className="text-ink-400">{query ? 'No matching projects.' : mine ? 'No tasks joined yet. Pick a task in Explore projects to get started.' : 'No projects published here yet.'}</p>}
    {mine && !visible.length && <button className={button} onClick={() => ctx.go('Groups & Tasks')}>Explore projects →</button>}
    {visible.some(p => p.tasks.some(t => joined(t) && !t.archived_at && t.clone_url)) && <div className="border border-ink-800 p-4 space-y-2"><button className={button} disabled={busy} onClick={() => act(async () => { const r = await api.projectService('/credentials', {}); setCredential(r.token); })}>Generate my Git credential</button><p className="text-xs text-ink-400">Valid for 7 days. Replacing it revokes your previous credential.</p>{credential && <div><p>Copy your credential now. Keep it private.</p><code className="select-all break-all">{credential}</code><button className={button} onClick={() => setCredential('')}>Hide</button></div>}</div>}
    {visible.map(p => <article key={p.id} className="border border-ink-700">
      <header className="p-5 border-b border-ink-800"><h2 className="font-display text-2xl text-ink-50">{p.title}</h2><p className="text-sm text-ink-300 whitespace-pre-wrap mt-2">{p.description}</p><p className="text-xs text-ink-500 mt-2">{p.tasks.length} tasks{p.repository ? ` · ${p.repository} · main` : ''}</p>{info?.admin && <button className={button + ' mt-3'} disabled={busy} onClick={() => { setAddingTo(p.id); setTaskTitle(''); setTaskInstructions(''); }}>Add task</button>}</header>
      {info?.admin && addingTo === p.id && <form className="p-5 border-b border-ink-800 space-y-3" onSubmit={e => { e.preventDefault(); act(async () => {
        await api.projectService(`/projects/${p.id}/tasks`, { title: taskTitle, description: taskInstructions });
        setAddingTo(null); await load(); ctx.notify('Task added to project');
      }); }}>
        <h3 className="text-lg text-ink-100">Add a task to {p.title}</h3>
        <label className="block text-sm">Task title<input className={field} required maxLength={200} value={taskTitle} onChange={e => setTaskTitle(e.target.value)} /></label>
        <label className="block text-sm">Task instructions<textarea className={field} maxLength={10000} value={taskInstructions} onChange={e => setTaskInstructions(e.target.value)} /></label>
        <p className="text-sm text-ink-400">The 24-hour teammate window starts when someone starts this task.{p.repository ? ` Code starts from ${p.repository} · main.` : ''}</p>
        <div className="flex gap-3"><button className="studio-primary" disabled={busy || !taskTitle.trim()}>{busy ? 'Adding…' : 'Publish task'}</button><button type="button" className={button} disabled={busy} onClick={() => setAddingTo(null)}>Cancel</button></div>
      </form>}
      {!p.tasks.length && <p className="p-5 text-sm text-ink-400">No active tasks in this project.</p>}
      <ol className="divide-y divide-ink-800">{p.tasks.map((t, i) => {
        const isJoined = joined(t), closed = !!t.recruiting_ends_at && now >= t.recruiting_ends_at;
        const archived = !!t.archived_at;
        const finished = t.status === 'done' || !!t.pr, canJoin = !archived && t.status === 'open' && !closed && !finished;
        return <li key={t.id} className="p-5 space-y-3">
          <div className="flex justify-between flex-wrap gap-2"><h3 className="text-lg text-ink-100">{i + 1}. {t.title}</h3><span className="text-xs text-acid-500">{archived ? 'Archived' : finished ? t.pr ? 'PR opened' : 'Completed' : t.status === 'review' ? 'Awaiting admin review' : !t.recruiting_ends_at ? 'Ready to start' : closed ? 'In progress · recruitment closed' : `${fmtCountdown(t.recruiting_ends_at)} to find teammates`}</span></div>
          <p className="text-sm text-ink-400 whitespace-pre-wrap">{t.description}</p>
          <p className="text-xs text-ink-500">{t.members.length} teammate{t.members.length === 1 ? '' : 's'}{isJoined ? ' · You joined this task' : ''}</p>
          {info?.admin && <div className="flex flex-wrap gap-2"><button className={button} disabled={busy} onClick={() => act(async () => { await api.projectService(`/tasks/${t.id}/${archived ? 'restore' : 'archive'}`, {}); await load(); ctx.notify(archived ? 'Task restored' : 'Task archived'); })}>{archived ? 'Restore task' : 'Archive task'}</button><button className={button + ' text-[#fb7185]'} disabled={busy} onClick={() => setDeleting(t)}>Delete…</button></div>}
          {!isJoined && !archived && <button className={button} disabled={busy || !canJoin} onClick={() => act(async () => { await api.projectService(`/tasks/${t.id}/join`, {}); await load(); ctx.notify('Task added to My builds'); })}>{!canJoin ? 'Joining closed' : t.members.length ? 'Join task' : 'Start this task'}</button>}
          {(isJoined || info?.admin) && !archived && !finished && t.repository && <div className="space-y-2">
            <button className={button} disabled={busy} onClick={() => act(async () => { try { const result = await api.projectService(`/tasks/${t.id}/sync`, {}); ctx.notify(result.changed ? 'Latest main merged. Pull to update your local files.' : 'Already includes latest main'); } finally { await load(); } })}>Update from main</button>
            <p className="text-xs text-ink-400">Main is merged automatically when you clone or pull and before review. Your task’s commits are preserved.</p>
            {t.main_sync?.status === 'current' && <p className="text-xs text-ink-400">Main checked {new Date(t.main_sync.checked_at).toLocaleString()}</p>}
            {['conflict', 'error'].includes(t.main_sync?.status) && <p role="alert" className="text-sm text-[#fb7185]">{t.main_sync.message}</p>}
            {t.main_sync?.status === 'conflict' && <details><summary className="cursor-pointer text-sm">Resolve the main merge locally</summary><pre className="bg-ink-950 p-3 text-xs overflow-x-auto">{`git pull --no-rebase origin main
git fetch origin refs/patech/upstream-main
git merge FETCH_HEAD
# Resolve conflicts, then:
git add .
git commit
git push origin main`}</pre></details>}
          </div>}
          {isJoined && !archived && !finished && (t.repository ? <button className={button} disabled={busy} onClick={() => act(async () => { await api.projectService(`/tasks/${t.id}/submit`, {}); await load(); ctx.notify('Submitted for admin review'); })}>Submit for admin review</button> : <button className={button} disabled={busy} onClick={() => act(async () => { await api.projectService(`/tasks/${t.id}/complete`, {}); await load(); ctx.notify('Task completed'); })}>Mark task complete</button>)}
          {t.pr && <a className={button} href={t.pr} target="_blank" rel="noreferrer">Open GitHub PR ↗</a>}
          {isJoined && !archived && t.clone_url && <details><summary className="text-sm cursor-pointer">Clone, pull and push this task</summary><p className="text-xs text-ink-400 py-2">Replace YOUR_CREDENTIAL with your generated Git credential, then run these commands in a terminal.</p><pre className="bg-ink-950 p-3 text-xs text-ink-300 overflow-x-auto">{`git -c http.extraHeader="X-Patech-Git: YOUR_CREDENTIAL" clone ${t.clone_url}\ncd ${t.id}\ngit config http.${t.clone_url}.extraHeader "X-Patech-Git: YOUR_CREDENTIAL"\ngit pull --no-rebase origin main\n# Edit files, then:\ngit add .\ngit commit -m "Improve task"\ngit pull --no-rebase origin main\ngit push origin main`}</pre></details>}
        </li>;
      })}</ol>
    </article>)}
  </section>;
}
