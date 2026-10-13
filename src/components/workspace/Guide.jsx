import { ArrowUpRight, Check, Code2, Users, FileCheck2 } from 'lucide-react';
import { tools } from './navigation';

export default function Guide({ ctx }) {
  return <div className="guide-page">
    <section className="ws-panel guide-start"><p className="ws-eyebrow">START HERE</p><h2>From an idea to finished work.</h2><p>You can design, code, test, or help a teammate. Choose a published task that matches what you want to do.</p>
      <div className="guide-steps">{[[Users, '1. Find your task', 'Open Projects, read the instructions, then confirm that you want to join. The first person starts a 24-hour window for teammates.'], [Code2, '2. Do the work', 'Find your task in My work. Code tasks include a Git workspace; tasks without a repository can be completed directly.'], [FileCheck2, '3. Finish and review', 'Push and check your code, then submit it for administrator review. A GitHub pull request is opened after approval.']].map(([Icon, title, copy]) => <div key={title}><Icon size={22}/><h3>{title}</h3><p>{copy}</p></div>)}</div>
      <button className="studio-primary" onClick={() => ctx.go('Groups & Tasks')}>Browse projects <ArrowUpRight size={17}/></button>
    </section>
    <section><h2 className="ws-section-title">Which tool do I need?</h2><div className="guide-tools">{tools.filter(t => !['home', 'guide'].includes(t.id)).map(t => <button key={t.id} onClick={() => ctx.go(t.key)}><strong>{t.label}<ArrowUpRight size={16}/></strong><span>{t.description}</span></button>)}</div></section>
    <section className="ws-panel guide-faq"><h2>Good to know</h2>
      <details open><summary>Do I need GitHub for every task?</summary><p>No. Only tasks labeled “Code task” use a repository. Open the task workspace for its remote address and instructions. Generate a private Git credential in My work; it lasts seven days. Never share or post it. The administrator connects the source repository through Launchpad.</p></details>
      <details><summary>What happens after the 24-hour teammate window?</summary><p>New teammates can no longer join that task. Existing teammates can keep working. Check the task status before joining; “In review” means work has already been sent to an administrator.</p></details>
      <details><summary>Does completing a task automatically give me hours?</summary><p>No. Contributions calculates credit only for eligible assignments listed in that tool, using verified Git pushes. A completed plain task or a Launchpad project review does not automatically create scored hours. Ask an administrator if an assignment you expect is missing.</p></details>
      <details><summary>Why can’t I create a project or a planning task?</summary><p>Administrators publish projects and planning tasks. Members join projects, update tasks they own, schedule events, and post in Discussion. Ask an administrator to publish a new brief.</p></details>
      <details><summary>My work didn’t load. Is it gone?</summary><p>A connection error does not mean your work was deleted. Use Retry on the error message. If your Launchpad session has expired, sign out and sign in again. Don’t resubmit an action until you’ve checked whether it was saved.</p></details>
    </section>
    {ctx.projectInfo?.admin && <section className="ws-panel"><p className="ws-eyebrow">ADMINISTRATOR</p><h2>Before publishing a project</h2><ul className="guide-checks">{['Write a clear outcome and instructions for every task.', 'Select a GitHub repository for code tasks, or leave it empty for non-code work.', 'Check the task order. Publishing does not join tasks or start recruitment.', 'Review submitted code in Launchpad before opening a pull request.'].map(s => <li key={s}><Check size={16}/>{s}</li>)}</ul><button className="ws-secondary" onClick={() => ctx.go('Groups & Tasks')}>Manage projects</button></section>}
  </div>;
}
