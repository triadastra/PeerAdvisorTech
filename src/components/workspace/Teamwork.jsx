import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
const field = 'w-full bg-ink-950 border border-ink-700 px-3 py-2 text-sm text-ink-100';
const button = 'border border-ink-600 px-4 py-2 text-sm disabled:opacity-40';
export default function Teamwork({ ctx }) {
  const [tasks, setTasks] = useState([]), [info, setInfo] = useState(null), [error, setError] = useState('');
  const [repos, setRepos] = useState([]), [branches, setBranches] = useState([]), [repository, setRepository] = useState(''), [base, setBase] = useState('');
  const [title, setTitle] = useState(''), [description, setDescription] = useState(''), [busy, setBusy] = useState(false);
  const [device, setDevice] = useState(null), [credential, setCredential] = useState(''), [page, setPage] = useState(1);
  const [branchPage, setBranchPage] = useState(1);
  const load = useCallback(async () => {
    const [me, rows] = await Promise.all([api.teamwork('/me'), api.teamwork('/tasks')]);
    setInfo(me); setTasks(rows);
  }, []);
  useEffect(() => {
    let active = true;
    Promise.all([api.teamwork('/me'), api.teamwork('/tasks')]).then(([me, rows]) => { if (active) { setInfo(me); setTasks(rows); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, []);
  const act = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const loadRepos = async (n = 1) => {
    const rows = await api.teamwork(`/github/repos?page=${n}`); setRepos(old => n === 1 ? rows : [...old, ...rows]); setPage(n);
  };
  const chooseRepo = async name => {
    setRepository(name); setBase(''); setBranches([]); setBranchPage(1);
    if (!name) return;
    const rows = await api.teamwork('/github/branches?repo=' + encodeURIComponent(name));
    setBranches(rows); setBase(rows.includes(repos.find(r => r.name === name)?.default_branch) ? repos.find(r => r.name === name).default_branch : rows[0] || '');
  };
  return <section className="space-y-4 border border-ink-700 p-5">
    <div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl text-ink-100">Teamwork</h2><button className={button} disabled={busy} onClick={() => act(load)}>Refresh</button></div>
    <p className="text-sm text-ink-400">Work together on a published repository. Push contributions to Launchpad, submit for review, and let the admin open the GitHub pull request.</p>
    {error && <p role="alert" className="text-[#fb7185] text-sm">{error}</p>}
    {info?.admin && <details className="space-y-4" open={tasks.length === 0}>
      <summary className="text-acid-500 cursor-pointer">Publish a team task</summary>
      <div className="flex gap-3 flex-wrap">
        <button className={button} disabled={busy} onClick={() => act(async () => setDevice(await api.teamwork('/github/device/start', {})))}>Connect GitHub with Launchpad</button>
        <button className={button} disabled={busy} onClick={() => act(() => loadRepos())}>Choose from my repositories</button>
        <a className={button} target="_blank" rel="noreferrer" href={info.review_url}>Review submissions in Launchpad ↗</a>
      </div>
      {device && <div className="text-sm text-ink-200 space-y-2"><p>Open <a className="underline" href={device.verification_uri || 'https://github.com/login/device'} target="_blank" rel="noreferrer">GitHub device sign-in</a> and enter <strong>{device.user_code}</strong>.</p>
        <button className={button} disabled={busy} onClick={() => act(async () => { const r = await api.teamwork('/github/device/poll', { device_code: device.device_code }); if (r.pending) throw new Error('GitHub approval is still pending. Finish sign-in, then check again.'); if (r.error) throw new Error(r.reason || r.error); setDevice(null); await load(); await loadRepos(); })}>I’ve authorized GitHub — check connection</button>
      </div>}
      <form className="space-y-3 max-w-2xl" onSubmit={e => { e.preventDefault(); act(async () => { await api.teamwork('/tasks', { title, description, repository, base }); setTitle(''); setDescription(''); await load(); ctx.notify('Team task published'); }); }}>
        <label className="block text-sm text-ink-300">Task title<input className={field} required value={title} onChange={e => setTitle(e.target.value)} /></label>
        <label className="block text-sm text-ink-300">What should the team improve?<textarea className={field} value={description} onChange={e => setDescription(e.target.value)} /></label>
        <label className="block text-sm text-ink-300">Repository<select className={field} value={repository} disabled={busy} onChange={e => act(() => chooseRepo(e.target.value))}><option value="">Choose a repository</option>{repos.map(r => <option key={r.name}>{r.name}</option>)}</select></label>
        {repos.length > 0 && <button type="button" className={button} disabled={busy} onClick={() => act(() => loadRepos(page + 1))}>Load more repositories</button>}
        <label className="block text-sm text-ink-300">Source branch<select className={field} value={base} onChange={e => setBase(e.target.value)}><option value="">Choose a branch</option>{branches.map(b => <option key={b}>{b}</option>)}</select></label>
        {branches.length >= 100 && <button type="button" className={button} disabled={busy} onClick={() => act(async () => { const n = branchPage + 1; const rows = await api.teamwork('/github/branches?repo=' + encodeURIComponent(repository) + '&page=' + n); setBranches(old => [...new Set([...old, ...rows])]); setBranchPage(n); })}>Load more branches</button>}
        <button disabled={busy || !repository || !base || !title.trim()} className="bg-acid-500 text-ink-950 px-4 py-2 disabled:opacity-40">{busy ? 'Working…' : 'Publish task for teamwork'}</button>
      </form>
    </details>}
    <div className="flex gap-3 items-center flex-wrap"><button className={button} disabled={busy} onClick={() => act(async () => { const r = await api.teamwork('/credentials', {}); setCredential(r.token); })}>Generate my Git credential</button><span className="text-xs text-ink-500">Valid for 7 days. Replacing it revokes your previous credential.</span></div>
    {credential && <div className="text-sm text-ink-300"><p>Copy your credential now. Keep it private.</p><code className="select-all break-all">{credential}</code><button className={button} onClick={() => setCredential('')}>Hide</button></div>}
    {!tasks.length && <p className="text-sm text-ink-500">No team tasks published yet.</p>}
    {tasks.map(t => <article key={t.id} className="border-t border-ink-700 py-4 space-y-3">
      <div className="flex justify-between gap-3"><h3 className="text-lg text-ink-100">{t.title}</h3><span className="text-xs text-acid-500">{t.status === 'pr_open' ? 'PR opened' : t.status === 'review' ? 'Awaiting admin review' : 'Open for teamwork'}</span></div>
      <p className="text-sm text-ink-400 whitespace-pre-wrap">{t.description}</p><p className="font-mono text-xs text-ink-500">{t.repository} · {t.base} · {t.members.length} team member(s)</p>
      <div className="flex gap-3 flex-wrap"><button className={button} disabled={busy || !!t.pr} onClick={() => act(async () => { await api.teamwork(`/tasks/${t.id}/join`, {}); await load(); ctx.notify('Joined task'); })}>Join team</button><button className={button} disabled={busy || !!t.pr} onClick={() => act(async () => { await api.teamwork(`/tasks/${t.id}/submit`, {}); await load(); ctx.notify('Submitted to Launchpad for admin review'); })}>Submit for admin review</button>{t.pr && <a href={t.pr} target="_blank" rel="noreferrer" className={button}>Open GitHub PR ↗</a>}</div>
      <details><summary className="text-sm text-ink-400 cursor-pointer">Clone, pull and push to the team repository</summary><p className="text-xs text-ink-500 py-2">Join first. Replace YOUR_CREDENTIAL with your generated Git credential. Run these in a terminal; your GitHub password is not needed.</p><pre className="bg-ink-950 p-3 text-xs text-ink-300 overflow-x-auto">{`git -c http.extraHeader="X-Patech-Git: YOUR_CREDENTIAL" clone ${t.clone_url}\ncd ${t.id}\ngit config http.${t.clone_url}.extraHeader "X-Patech-Git: YOUR_CREDENTIAL"\ngit pull --rebase origin main\n# Edit files, then:\ngit add .\ngit commit -m "Improve task"\ngit pull --rebase origin main\ngit push origin main`}</pre></details>
    </article>)}
  </section>;
}
