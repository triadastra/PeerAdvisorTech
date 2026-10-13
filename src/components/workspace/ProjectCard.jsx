import { useState } from 'react';
import { ArrowUpRight, Plus, ChevronDown, ChevronUp, Link2, GitBranch, Users, Code2, ClipboardList, MessageSquare, CalendarDays, Archive, RotateCcw, Trash2, Check, CheckCircle2, ArrowRight, FolderOpen, Clock3 } from 'lucide-react';
import { taskAccess, plural, studioLink } from './taskActions';

function Brief({ text, limit = 220 }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return <p className="pc-description">No instructions added yet. Ask the project administrator before starting.</p>;
  const long = text.length > limit;
  return <div className="pc-brief"><p>{long && !expanded ? `${text.slice(0, limit).trimEnd()}…` : text}</p>{long && <button type="button" className="pc-inline" aria-expanded={expanded} onClick={() => setExpanded(v => !v)}>{expanded ? 'Show less' : 'Read full brief'}</button>}</div>;
}

function TaskCard({ task, project, ctx, now, busy, onJoin, onWorkspace, onComplete, onArchive, onDelete, onCopy }) {
  const access = taskAccess(task, ctx.projectInfo?.user_id, ctx.projectInfo?.admin, now);
  const status = access.archived ? 'Archived' : task.pr ? 'Pull request opened' : access.finished ? 'Completed' : access.reviewing ? 'Awaiting review' : !task.recruiting_ends_at ? 'Ready to start' : access.closed ? 'In progress' : 'Finding teammates';
  const tone = access.archived ? 'muted' : access.finished ? 'done' : access.reviewing ? 'review' : task.recruiting_ends_at ? 'active' : 'ready';
  const Icon = task.repository ? Code2 : ClipboardList;
  const discuss = () => ctx.go('Forum', { project: project.id, task: task.id });
  const schedule = () => ctx.go('Calendar', { project: project.id, task: task.id });
  return <li className={`pc-task ${access.archived ? 'is-archived' : ''}`} id={`task-${task.id}`}>
    <div className="pc-task-body">
      <div className="pc-task-kicker"><span><Icon size={15}/>{task.repository ? 'Code task' : 'Team task'}</span><span className={`pc-status is-${tone}`}><i/>{status}</span></div>
      <h3>{task.title}</h3>
      <Brief text={task.description} limit={320}/>
      <div className="pc-task-facts"><span><Users size={15}/>{plural(task.members?.length || 0, 'member')}</span>{access.joined && <span className="pc-joined"><Check size={14}/>You’re on this team</span>}{!!task.recruiting_ends_at && !access.finished && !access.archived && <span><Clock3 size={14}/>{access.closed ? 'Team recruitment closed' : `Join until ${new Date(Number(task.recruiting_ends_at)).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`}</span>}</div>
      {task.repository && <a className="pc-repository" href={`https://github.com/${task.repository}`} target="_blank" rel="noreferrer"><GitBranch size={14}/>{task.repository}<ArrowUpRight size={13}/></a>}
      {['conflict', 'error'].includes(task.main_sync?.status) && <p className="pc-warning" role="alert">{task.main_sync.message} Open the code workspace for recovery instructions.</p>}
      <div className="pc-task-links">
        <button onClick={discuss}><MessageSquare size={15}/>Discuss task</button>
        {!access.archived && <button onClick={schedule}><CalendarDays size={15}/>Plan a session</button>}
        <button onClick={() => onCopy(studioLink('projects', project.id, task.id))}><Link2 size={15}/>Copy task link</button>
      </div>
    </div>
    <aside className="pc-task-action" aria-label={`Actions for ${task.title}`}>
      <span className="pc-action-label">{access.archived ? 'TASK ARCHIVED' : access.finished ? 'WORK RECORDED' : access.canReview ? 'READY FOR YOUR REVIEW' : 'YOUR NEXT STEP'}</span>
      {task.pr ? <><CheckCircle2 size={25} className="pc-success"/><p>The pull request is ready to view on GitHub.</p><a className="pc-primary" href={task.pr} target="_blank" rel="noreferrer">View pull request<ArrowUpRight size={16}/></a></> : access.archived ? <p>This task is read-only. {access.canManage ? 'Restore it to reopen access.' : 'An administrator can restore it.'}</p> : access.finished ? <><CheckCircle2 size={25} className="pc-success"/><p>This task is complete. You can still read the brief and discuss the result.</p><button className="pc-secondary" onClick={() => ctx.go('Groups & Tasks')}>Find another task<ArrowRight size={15}/></button></> : access.canReview && ctx.projectInfo?.review_url ? <><p>Check the submitted changes before opening a pull request.</p><a className="pc-primary" href={ctx.projectInfo.review_url} target="_blank" rel="noreferrer">Review in Launchpad<ArrowUpRight size={16}/></a><button className="pc-secondary" disabled={busy} onClick={() => onWorkspace(task)}>Open code workspace</button></> : access.canWork ? <><p>{access.reviewing ? 'Your work is with the administrator. Open the workspace to check its status.' : 'Get the code, push your changes, and send them for review.'}</p><button className="pc-primary" disabled={busy} onClick={() => onWorkspace(task)}>{access.reviewing ? 'View submission' : 'Open code workspace'}<ArrowRight size={16}/></button>{access.canJoin && <button className="pc-secondary" disabled={busy} onClick={() => onJoin(task)}>Join this task too</button>}</> : access.canComplete ? <><p>Finish the brief with your team, then record it as complete.</p><button className="pc-primary" disabled={busy} onClick={() => onComplete(task)}>Mark complete<Check size={16}/></button><small>No code upload on this task. Completing it does not automatically award hours.</small></> : access.canJoin ? <><p>{task.members?.length ? 'Join the existing team and work on this brief together.' : 'Start this task to open a 24-hour window for teammates.'}</p><button className="pc-primary" disabled={busy} onClick={() => onJoin(task)}>{task.members?.length ? 'Join team' : 'Start this task'}<ArrowRight size={16}/></button></> : <><p>The team is already formed. You can read the brief or ask about another opportunity.</p><button className="pc-secondary" onClick={discuss}>Ask the team<MessageSquare size={15}/></button></>}
    </aside>
    {access.canManage && <div className="pc-admin-actions"><span>Admin controls</span><div><button disabled={busy} onClick={() => onArchive(task)}>{access.archived ? <RotateCcw size={14}/> : <Archive size={14}/>} {access.archived ? 'Restore task' : 'Archive task'}</button><button className="pc-delete" disabled={busy} onClick={() => onDelete(task)}><Trash2 size={14}/>Delete task</button></div></div>}
  </li>;
}

export default function ProjectCard({ project, ctx, defaultExpanded, now, busy, onAdd, onJoin, onWorkspace, onComplete, onArchive, onDelete, onCopy }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const completed = project.tasks.filter(t => t.status === 'done' || t.pr).length;
  const joined = project.tasks.some(t => t.members?.includes(ctx.projectInfo?.user_id));
  const initials = project.title.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const regionId = `project-tasks-${project.id}`;
  return <article className="pc-project" aria-label={project.title}>
    <div className="pc-project-header">
      <div className="pc-project-title"><span className="pc-project-avatar" aria-hidden="true">{initials}</span><div><span className="pc-overline">PROJECT</span><h2>{project.title}</h2></div></div>
      <div className="pc-project-tools">
        <button className="pc-icon-button" onClick={() => onCopy(studioLink('projects', project.id))} aria-label={`Copy link to ${project.title}`} title="Copy project link"><Link2 size={17}/></button>
        {ctx.projectInfo?.admin && <button className="pc-secondary" disabled={busy} onClick={() => onAdd(project)}><Plus size={16}/>Add task</button>}
        {!!project.tasks.length && <button className="pc-secondary pc-expand" aria-expanded={expanded} aria-controls={regionId} onClick={() => setExpanded(v => !v)}>{expanded ? 'Hide tasks' : 'Show tasks'}{expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>}
      </div>
      {project.description && <div className="pc-project-description"><Brief text={project.description}/></div>}
      <div className="pc-project-summary"><span>{plural(project.tasks.length, 'task')}</span>{completed > 0 && <span><CheckCircle2 size={14}/>{completed} completed</span>}{joined && <button onClick={() => ctx.go('Timeline', { project: project.id })}><FolderOpen size={14}/>Your work in this project<ArrowRight size={13}/></button>}{project.repository && <a href={`https://github.com/${project.repository}`} target="_blank" rel="noreferrer"><GitBranch size={14}/>Repository<ArrowUpRight size={13}/></a>}</div>
    </div>
    <div id={regionId} hidden={!expanded}>
      <ul className="pc-task-list">{project.tasks.map(task => <TaskCard key={task.id} task={task} project={project} ctx={ctx} now={now} busy={busy} onJoin={onJoin} onWorkspace={onWorkspace} onComplete={onComplete} onArchive={onArchive} onDelete={onDelete} onCopy={onCopy}/>)}</ul>
    </div>
    {!project.tasks.length && <div className="pc-empty-project"><ClipboardList size={19}/><p>No tasks in this view.{ctx.projectInfo?.admin ? ' Add a task or change the filters.' : 'Try another filter or check back for new tasks.'}</p></div>}
  </article>;
}
