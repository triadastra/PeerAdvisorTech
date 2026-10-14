import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, FolderKanban, Hammer, ListTodo, CalendarDays, ChartNoAxesCombined, MessagesSquare, BookOpen, Search, Menu, X, ArrowUpRight, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { vidFor, listTracks, listAssignments, listForum, createAssignment, listTasks, listProfiles, listEvents } from '../../lib/db';
import { initials } from './util';
import Contributions from './Contributions';
import Studio from './Studio';
import { api } from '../../lib/api';
import './studio.css';
import MyTimeline from './MyTimeline';
import Groups from './Groups';
import Forum from './Forum';
import Tasks from './Tasks';
import Calendar from './Calendar';
import Guide from './Guide';
import WorkOnItModal from './WorkOnItModal';
import ThemeToggle from '../ThemeToggle';
import Dialog from './Dialog';
import { tools, toolFor, myProjectTasks } from './navigation';
import { workspaceView } from './viewMode';

const icons = [Home, Hammer, FolderKanban, ListTodo, CalendarDays, ChartNoAxesCombined, MessagesSquare, BookOpen];
const sections = { Studio, Contributions, Timeline: MyTimeline, 'Groups & Tasks': Groups, 'Tasks & plans': Tasks, Forum, Calendar, Guide };
const readers = { tracks: listTracks, assignments: listAssignments, forum: listForum, tasks: listTasks, profiles: listProfiles, events: listEvents };
const required = { Studio: ['tracks', 'assignments'], Timeline: ['tracks', 'assignments'], 'Groups & Tasks': ['tracks', 'assignments'], 'Tasks & plans': ['tasks', 'profiles'], Forum: ['forum'], Calendar: ['events'], Contributions: ['assignments'], Guide: [] };

export default function Workspace() {
  const { user, profile, signOut, oauth } = useAuth();
  const [params, setParams] = useSearchParams();
  const [viewPreference, setViewPreference] = useState(() => {
    let mode = 'admin';
    try { mode = localStorage.getItem(`patd:studio-view:${user?.id}`) || mode; } catch { /* Storage is optional. */ }
    return { userId: user?.id, mode };
  });
  const tool = toolFor(params.get('view'));
  const tab = tool.key;
  const [data, setData] = useState({ tracks: [], assignments: [], forum: [], tasks: [], profiles: [], events: [] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [projectError, setProjectError] = useState('');
  const [projectsLoading, setProjectsLoading] = useState(oauth);
  const [specFilter, setSpecFilter] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const heading = useRef(null);
  const toastTimer = useRef(null);
  const mounted = useRef(false);
  const loadVersion = useRef(0);
  const projectVersion = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; clearTimeout(toastTimer.current); }; }, []);

  const reload = useCallback(async () => {
    const version = ++loadVersion.current;
    const keys = Object.keys(readers);
    const results = await Promise.allSettled(keys.map(key => readers[key]()));
    if (!mounted.current || version !== loadVersion.current) return;
    const nextErrors = {};
    const values = {};
    results.forEach((r, i) => { if (r.status === 'fulfilled') values[keys[i]] = r.value; else nextErrors[keys[i]] = r.reason?.message || 'Please try again.'; });
    setData(previous => ({ ...previous, ...values })); setErrors(nextErrors); setLoading(false);
    return Object.keys(nextErrors).length === 0;
  }, []);
  const reloadProjects = useCallback(async () => {
    if (!oauth) return;
    const version = ++projectVersion.current;
    setProjectsLoading(true);
    try {
      const [info, rows] = await Promise.all([api.projectService('/me'), api.projectService('/projects')]);
      if (!mounted.current || version !== projectVersion.current) return;
      setProjectInfo(info); setProjects(rows); setProjectError('');
    } catch (error) {
      if (mounted.current && version === projectVersion.current) setProjectError(error.message);
      throw error;
    } finally { if (mounted.current && version === projectVersion.current) setProjectsLoading(false); }
  }, [oauth]);
  useEffect(() => { let active = true; queueMicrotask(() => { if (active) { void reload(); void reloadProjects().catch(() => {}); } }); return () => { active = false; }; }, [reload, reloadProjects]);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [tab]);
  useEffect(() => {
    const keydown = event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(value => !value); } };
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  }, []);
  const notify = useCallback((msg, type = 'ok') => { clearTimeout(toastTimer.current); setToast({ msg, type }); toastTimer.current = setTimeout(() => setToast(null), 6000); }, []);
  const go = (value, context = {}) => { setParams({ view: toolFor(value).id, ...Object.fromEntries(['project', 'task'].filter(key => context[key]).map(key => [key, context[key]])) }); setMenuOpen(false); setSearchOpen(false); setQuery(''); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const name = profile?.name || user?.name || user?.email?.split('@')[0] || 'Member';
  const accountRole = profile?.role || user?.role || 'Member';
  const { canSwitchView, studentView, role, projectInfo: visibleProjectInfo } = workspaceView(accountRole, projectInfo, viewPreference.userId === user?.id ? viewPreference.mode : 'admin');
  const switchView = mode => {
    if (!canSwitchView) return;
    setViewPreference({ userId: user?.id, mode });
    try { localStorage.setItem(`patd:studio-view:${user?.id}`, mode); } catch { /* The toggle still works without persistence. */ }
    setModal(null);
  };
  const vid = profile?.vid || vidFor(user);
  const myAssignments = data.assignments.filter(a => a.member_ids?.includes(user?.id));
  const joined = myProjectTasks(projects, projectInfo?.user_id);
  const confirmWorkOn = async () => {
    if (!modal?.node || modal.busy) return;
    setModal(m => ({ ...m, busy: true }));
    try { const assignment = await createAssignment({ node_id: modal.node.id }); await reload(); setModal(m => m && ({ ...m, busy: false, phase: 'done', assignment })); }
    catch (error) { setModal(m => m && ({ ...m, busy: false })); notify(error.message, 'err'); }
  };
  const ctx = { user: studentView ? { ...user, role } : user, name, role, vid, oauth, studentView, projects, projectInfo: visibleProjectInfo, projectError, projectsLoading, reloadProjects, ...data, myAssignments, specFilter, setSpecFilter, loading, reload, notify, go, tab, openWorkOn: (track, node) => setModal({ track, node, phase: 'confirm' }), setForum: forum => setData(d => ({ ...d, forum })) };
  const Section = sections[tab];
  const failures = required[tab].filter(key => errors[key]);
  const searchResults = tools.filter(t => `${t.label} ${t.description}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <div className="student-workspace ws-shell">
    <header className="ws-topbar">
      <Link to="/" className="ws-brand" aria-label="PATD public website"><span className="ws-brand-mark">p.</span><strong>PATD<span>STUDIO</span></strong></Link>
      <div className="ws-top-actions"><button aria-label="Find a tool" className="ws-search-trigger" onClick={() => setSearchOpen(true)}><Search size={17}/><span>Find a tool</span><kbd>⌘ K</kbd></button><ThemeToggle/><button className="ws-menu-toggle" aria-expanded={menuOpen} aria-controls="studio-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X size={21}/> : <Menu size={21}/>}</button></div>
    </header>
    <div className="ws-layout">
      <aside className={`ws-sidebar ${menuOpen ? 'is-open' : ''}`} id="studio-navigation">
        <p className="ws-eyebrow ws-sidebar-label">YOUR WORKSPACE</p>
        <nav aria-label="Studio tools">{['Workspace', 'Organize', 'Collaborate', 'Help'].map(group => <div className="ws-nav-group" key={group}><p>{group}</p>{tools.filter(t => t.group === group).map(t => { const Icon = icons[tools.indexOf(t)]; return <Link key={t.id} to={`?view=${t.id}`} aria-current={t.id === tool.id ? 'page' : undefined} onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}><Icon size={18}/><span>{t.label}</span>{t.id === 'my-work' && joined.filter(t => t.status !== 'done' && !t.pr).length > 0 && <small>{joined.filter(t => t.status !== 'done' && !t.pr).length}</small>}</Link>; })}</div>)}</nav>
        <div className="ws-sidebar-bottom"><div className="ws-person"><span>{initials(name)}</span><div><strong>{name}</strong><small>{accountRole} · {oauth ? 'Launchpad account' : 'Local account'}</small></div></div><button disabled={signingOut} onClick={async () => { setSigningOut(true); try { await signOut(); } catch (e) { notify(e.message, 'err'); setSigningOut(false); } }}><LogOut size={16}/>{signingOut ? 'Signing out…' : 'Sign out'}</button></div>
      </aside>
      <div className="ws-content">
        <div className="ws-page-heading"><div><p className="ws-breadcrumb">Studio <span>/</span> {tool.group}</p><h1 ref={heading} tabIndex={-1}>{tool.label}</h1><p>{tool.description}</p></div><button className="ws-help-link" onClick={() => go('Guide')}><BookOpen size={16}/>How it works</button></div>
        {canSwitchView && <div className="ws-view-bar">
          <div className="ws-view-toggle" role="group" aria-label="Workspace view">
            <button type="button" aria-pressed={!studentView} onClick={() => switchView('admin')}>Admin view</button>
            <button type="button" aria-pressed={studentView} onClick={() => switchView('student')}>Student view</button>
          </div>
          <p role="status">{studentView ? 'Admin tools are hidden. Actions still use your own account.' : 'Manage projects, tasks, and reviews.'}</p>
        </div>}
        {loading && required[tab].length ? <div className="ws-loading" role="status"><RefreshCw size={22}/><p>Loading your workspace…</p></div> : failures.length ? <div className="ws-error" role="alert"><h2>We couldn’t load this section.</h2><p>{errors[failures[0]]}</p><p>Your saved work hasn’t been cleared. Other tools are still available.</p><button className="ws-secondary" onClick={async () => { setLoading(true); await reload(); }}>Retry loading</button></div> : <Section key={`${tab}-${studentView ? 'student' : 'normal'}`} ctx={ctx}/>}
      </div>
    </div>
    {modal && <WorkOnItModal modal={modal} assignments={data.assignments} onConfirm={confirmWorkOn} onClose={() => { if (modal.busy) return; setModal(null); if (modal.phase === 'done') go('Timeline'); }} onInvite={() => { setModal(null); go('Forum'); }}/>}
    {searchOpen && <Dialog titleId="tool-search-title" onClose={() => setSearchOpen(false)} className="ws-tool-dialog"><div className="ws-dialog-heading"><h2 id="tool-search-title">Find a tool</h2><button onClick={() => setSearchOpen(false)} aria-label="Close tool search"><X size={20}/></button></div><label className="ws-search-field"><Search size={19}/><input data-autofocus placeholder="Try projects, deadlines, hours…" aria-label="Search studio tools" value={query} onChange={e => setQuery(e.target.value)}/></label><div className="ws-tool-results">{searchResults.map(t => <button key={t.id} onClick={() => go(t.key)}><div><strong>{t.label}</strong><span>{t.description}</span></div><ArrowUpRight size={18}/></button>)}{!searchResults.length && <p>No tools match “{query}”. Try “projects”, “calendar”, or “hours”.</p>}</div></Dialog>}
    {toast && <div className={`ws-toast ${toast.type === 'err' ? 'is-error' : ''}`} role={toast.type === 'err' ? 'alert' : 'status'}><span>{toast.msg}</span><button aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={17}/></button></div>}
  </div>;
}
