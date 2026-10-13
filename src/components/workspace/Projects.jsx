import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useSearchParams } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import { plural } from './taskActions';
import ConfirmDialog from './ConfirmDialog';
import TaskFlowModal from './TaskFlowModal';
import Dialog from './Dialog';
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
  const [params, setParams] = useSearchParams();
  const focusProject = params.get('project'), focusTask = params.get('task');
  const [confirming, setConfirming] = useState(null);
  const copyLink = async url => { try { await navigator.clipboard.writeText(url); ctx.notify('Link copied'); } catch { ctx.notify('Could not copy the link. Copy the address from your browser instead.', 'err'); } };
  const clearFocus = () => { setParams({ view: mine ? 'my-work' : 'projects' }); setQuery(''); setStatusFilter('all'); };
  const [statusFilter, setStatusFilter] = useState('all');
  const [addingTo, setAddingTo] = useState(null), [taskTitle, setTaskTitle] = useState(''), [taskInstructions, setTaskInstructions] = useState('');
  const [showArchived, setShowArchived] = useState(false), [deleting, setDeleting] = useState(null);
  const [taskFlow, setTaskFlow] = useState(null), [flowBusy, setFlowBusy] = useState(false), [flowError, setFlowError] = useState('');
  const [now, tick] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => tick(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const act = async fn => { setBusy(true); setError(''); try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const openTaskFlow = (task, workspace = true) => { setFlowError(''); setTaskFlow({ task, joined: workspace }); };
  const flowAction = async (fn, message) => {
    setFlowBusy(true); setFlowError('');
    try { const result = await fn(); await load(); if (message) ctx.notify(message); return result; }
    catch (e) { setFlowError(e.message); throw e; }
    finally { setFlowBusy(false); }
  };
  const loadRepos = async (n = 1) => { const rows = await api.projectService(`/github/repos?page=${n}`); setRepos(old => n === 1 ? rows : [...old, ...rows]); setPage(n); };
  const updateStep = (key, patch) => setSteps(old => old.map(n => n.key === key ? { ...n, ...patch } : n));
  const moveStep = (i, delta) => setSteps(old => { const rows = [...old]; [rows[i], rows[i + delta]] = [rows[i + delta], rows[i]]; return rows; });
  const joined = t => t.members.includes(info?.user_id);
  const visible = projects.filter(p => !focusProject || p.id === focusProject).map(p => ({ ...p, tasks: p.tasks.filter(t => (!focusTask || t.id === focusTask) && (showArchived || focusTask || !t.archived_at) && (!mine || joined(t)) && (statusFilter === 'all' || (statusFilter === 'review' ? t.status === 'review' || !!t.submission : statusFilter === 'done' ? t.status === 'done' || !!t.pr : t.status !== 'done' && !t.pr && !t.archived_at))) })).filter(p => ((statusFilter === 'all' && !focusTask) || p.tasks.length > 0) && (!mine || p.tasks.some(joined)) && `${p.title} ${p.description} ${p.tasks.map(t => t.title).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="project-board space-y-6">
    <div className="flex flex-wrap justify-between items-center gap-3">
      <span className="text-sm text-ink-400">{plural(visible.length, mine ? 'joined project' : 'project')}</span>
      <div className="flex gap-2"><button className={button} disabled={busy} onClick={() => act(load)}>Refresh</button>{info?.admin && !mine && <button className="studio-primary" onClick={() => setCreating(v => !v)}>{creating ? 'Close project form' : 'New project'}</button>}</div>
    </div>
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
    {info?.admin && <div className="ws-admin-bar"><div><strong>Administrator tools</strong><p>Publish project briefs here. Review submitted code in Launchpad.</p></div><a className="ws-secondary" target="_blank" rel="noreferrer" href={info.review_url}>Review submissions ↗</a></div>}
    {projects.some(p => p.tasks.some(t => t.archived_at)) && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />Show archived tasks</label>}
    {deleting && <Dialog titleId="delete-task-title" busy={busy} onClose={() => setDeleting(null)} className="p-5 space-y-3">
      <h2 id="delete-task-title" className="text-lg">Delete “{deleting.title}”?</h2>
      <p id="delete-task-description" className="text-sm text-ink-300">This removes the task from its project and closes access to its shared code. Existing GitHub branches and pull requests stay unchanged. Archive instead if you want to restore the task later.</p>
      {error && <p role="alert" className="text-[#fb7185]">{error}</p>}<div className="flex gap-3"><button className={button} disabled={busy} onClick={() => setDeleting(null)}>Cancel</button><button className={button + ' text-[#fb7185]'} disabled={busy} onClick={() => act(async () => { await api.projectService(`/tasks/${deleting.id}/delete`, { confirm_title: deleting.title }); setDeleting(null); await load(); ctx.notify('Task deleted'); })}>Delete task</button></div>
    </Dialog>}
    <div className="flex flex-wrap gap-2" aria-label="Task status filter">{[['all', 'All tasks'], ['active', 'Active'], ['review', 'In review'], ['done', 'Completed']].map(([value, label]) => <button key={value} className={button} aria-pressed={statusFilter === value} onClick={() => setStatusFilter(value)}>{label}</button>)}</div>
    {(focusProject || focusTask) && <div className="pc-context"><span>Showing a linked {focusTask ? 'task' : 'project'}</span><button onClick={clearFocus}>Show all {mine ? 'my work' : 'projects'}</button></div>}
    {projects.length > 0 && <input className={field} aria-label="Search projects and tasks" placeholder="Search projects and tasks" value={query} onChange={e => setQuery(e.target.value)} />}
    {ctx.projectsLoading ? <p>Loading projects…</p> : !ctx.projectError && !visible.length && <p className="text-ink-400">{query || statusFilter !== 'all' ? 'No tasks match these filters.' : mine ? 'No tasks joined yet. Pick a task in Explore projects to get started.' : 'No projects published here yet.'}</p>}
    {mine && !visible.length && <button className={button} onClick={() => ctx.go('Groups & Tasks')}>Explore projects →</button>}
    {mine && visible.some(p => p.tasks.some(t => joined(t) && !t.archived_at && t.clone_url)) && <div className="border border-ink-800 p-4 space-y-2"><button className={button} disabled={busy} onClick={() => act(async () => { const r = await api.projectService('/credentials', {}); setCredential(r.token); })}>Generate my Git credential</button><p className="text-xs text-ink-400">Valid for 7 days. Replacing it revokes your previous credential.</p>{credential && <div><p>Copy your credential now. Keep it private.</p><code className="select-all break-all">{credential}</code><button className={button} onClick={() => setCredential('')}>Hide</button></div>}</div>}
    {visible.map(p => <ProjectCard key={`${p.id}-${query}-${statusFilter}-${focusTask || ''}-${mine}`} project={p} ctx={ctx} now={now} busy={busy}
      defaultExpanded={mine || p.tasks.length <= 1 || !!query || statusFilter !== 'all' || !!focusProject || !!focusTask}
      onCopy={copyLink}
      onAdd={project => { setError(''); setAddingTo(project); setTaskTitle(''); setTaskInstructions(''); }}
      onJoin={task => openTaskFlow({ ...task, project_title: p.title }, false)}
      onWorkspace={task => openTaskFlow({ ...task, project_title: p.title })}
      onComplete={task => setConfirming({ task, action: 'complete' })}
      onArchive={task => setConfirming({ task, action: task.archived_at ? 'restore' : 'archive' })}
      onDelete={task => { setError(''); setDeleting(task); }}
    />)}
    {addingTo && <Dialog titleId="add-project-task-title" busy={busy} onClose={() => setAddingTo(null)}>
      <form className="pc-task-form" onSubmit={e => { e.preventDefault(); act(async () => {
        await api.projectService(`/projects/${addingTo.id}/tasks`, { title: taskTitle, description: taskInstructions });
        await load(); setParams({ view: 'projects', project: addingTo.id }); setQuery(''); setStatusFilter('all'); setAddingTo(null); ctx.notify('Task added to project');
      }); }}>
        <span className="pc-overline">{addingTo.title}</span><h2 id="add-project-task-title">Add a task</h2>
        <label>Task title<input data-autofocus className={field} required disabled={busy} maxLength={200} value={taskTitle} onChange={e => setTaskTitle(e.target.value)} /></label>
        <label>Task instructions<textarea className={field} rows={5} disabled={busy} maxLength={10000} value={taskInstructions} onChange={e => setTaskInstructions(e.target.value)} /></label>
        <p>The 24-hour teammate window starts when someone joins.{addingTo.repository ? ` Code starts from ${addingTo.repository} · main.` : ' This task does not include a code upload.'}</p>
        {error && <p role="alert">{error}</p>}
        <div><button type="button" className="pc-secondary" disabled={busy} onClick={() => setAddingTo(null)}>Cancel</button><button className="pc-primary" disabled={busy || !taskTitle.trim()}>{busy ? 'Publishing…' : 'Publish task'}</button></div>
      </form>
    </Dialog>}
    {confirming && <ConfirmDialog danger={false}
      title={`${confirming.action === 'complete' ? 'Complete' : confirming.action === 'archive' ? 'Archive' : 'Restore'} “${confirming.task.title}”?`}
      description={confirming.action === 'complete' ? 'This marks the task complete for the whole team. Only confirm when everyone is finished. Contribution hours are handled separately.' : confirming.action === 'archive' ? 'This hides the task from active work and closes access to its shared code. You can restore it later.' : 'This returns the task to the project and reopens access for its existing team. It does not restart the recruitment window.'}
      label={confirming.action === 'complete' ? 'Mark complete' : confirming.action === 'archive' ? 'Archive task' : 'Restore task'}
      onClose={() => setConfirming(null)} onConfirm={async () => { await api.projectService(`/tasks/${confirming.task.id}/${confirming.action}`, {}); await load(); ctx.notify('Task updated'); }} />}
    {taskFlow && <TaskFlowModal
      entry={taskFlow}
      info={info}
      busy={flowBusy}
      error={flowError}
      onClose={() => { if (!flowBusy) setTaskFlow(null); }}
      onJoin={task => flowAction(() => api.projectService(`/tasks/${task.id}/join`, {}), 'Task added to My work')}
      onSync={task => flowAction(() => api.projectService(`/tasks/${task.id}/sync`, {}), 'Launchpad checked for pushed work')}
      onSubmit={task => flowAction(() => api.projectService(`/tasks/${task.id}/submit`, {}), 'Submitted for admin diff review')}
    />}
  </section>;
}
