import { ArrowUpRight, Sparkles, Users, Flag, Code2 } from 'lucide-react';

export default function Studio({ ctx }) {
  const { name, tracks, myAssignments, assignments, forum, openWorkOn, go } = ctx;
  const starters = tracks.filter((t) => t.category === 'School starter');
  const recruiting = assignments.filter((a) => a.status === 'recruiting');
  const joined = new Set(myAssignments.map((a) => a.track_id));
  return (
    <div className="studio-home">
      <div className="studio-eyebrow"><span className="studio-live" /> THE SCHOOL BUILD CLUB <span>Small ideas. Real impact.</span></div>
      <section className="studio-hero">
        <div>
          <p className="studio-greeting">Hey {name.split(' ')[0]}, welcome to your studio.</p>
          <h1>Make school<br />a little <em>better.</em></h1>
          <p className="studio-intro">That thing you wish your school had? You can build it. Pick a tiny challenge, bring a friend, and learn as you go.</p>
          <button className="studio-primary" onClick={() => go('Groups & Tasks')}>Find your first project <ArrowUpRight size={18} /></button>
          <span className="studio-footnote">Designers, coders, curious people — everyone belongs.</span>
        </div>
        <div className="studio-notebook">
          <span className="studio-sticker">YOUR NEXT SIDE PROJECT ↗</span>
          <div className="studio-doodle"><Code2 size={42} strokeWidth={1.5} /><span>made by us.<br />used by our school.</span></div>
          <h2>Start small. Make it real.</h2>
          <ol><li><b>01</b> Find one everyday school problem</li><li><b>02</b> Build the smallest useful version</li><li><b>03</b> Let a classmate try it</li></ol>
          <div className="studio-note">Your first version is allowed to be a bit messy.</div>
        </div>
      </section>
      <section className="studio-pulse" aria-label="Your studio activity">
        <div><Flag size={18}/><strong>{joined.size}</strong><span>projects you joined</span></div>
        <div><Users size={18}/><strong>{recruiting.length}</strong><span>steps welcoming teammates</span></div>
        <div><Sparkles size={18}/><strong>{forum.length}</strong><span>common room posts</span></div>
      </section>
      {starters.length > 0 && <section>
        <div className="studio-section-head"><div><p className="studio-eyebrow">A GOOD PLACE TO START</p><h2>Built for your school.</h2></div><button onClick={() => go('Groups & Tasks')}>All projects <ArrowUpRight size={16}/></button></div>
        <div className="studio-project-grid">
          {starters.map((t, i) => <article className="studio-project" key={t.id} style={{ '--project-color': t.color }}>
            <div className="studio-project-top"><span>0{i + 1} / SCHOOL LIFE</span><span className="studio-project-symbol">{['✳', '↗', '✦'][i]}</span></div>
            <h3>{t.title}</h3><p>{t.blurb}</p>
            <div className="studio-project-tags"><span>Beginner friendly</span><span>Design · Code · Test</span></div>
            <div className="studio-first-step"><span>YOUR FIRST SMALL WIN</span><strong>{t.nodes[0].title}</strong><p>{t.nodes[0].detail}</p></div>
            <button onClick={() => joined.has(t.id) ? go('Timeline') : openWorkOn(t, t.nodes[0])}>{joined.has(t.id) ? 'Continue your build' : 'Try this challenge'} <ArrowUpRight size={17}/></button>
          </article>)}
        </div>
      </section>}
      <section className="studio-bottom-grid">
        <div className="studio-next"><span className="studio-eyebrow">YOUR NEXT MOVE</span><h2>{myAssignments.length ? 'Keep the momentum going.' : 'No experience? Start with curiosity.'}</h2><p>{myAssignments.length ? `You’ve joined ${myAssignments.length} project step${myAssignments.length === 1 ? '' : 's'}. Open your builds for the brief, your teammates, and your shared code.` : 'You don’t need to write code on day one. Interview a friend, sketch a screen, or test someone’s prototype. It all counts as building.'}</p><button onClick={() => go(myAssignments.length ? 'Timeline' : 'Groups & Tasks')}>{myAssignments.length ? 'Open my builds' : 'Explore the first steps'} →</button></div>
        <div className="studio-room"><span className="studio-eyebrow">THE COMMON ROOM</span><h2>Better with a buddy.</h2><p>Find someone to build with, share a small win, or ask that question you think is too basic. We all started somewhere.</p><button onClick={() => go('Forum')}>Meet your fellow builders <ArrowUpRight size={17}/></button></div>
      </section>
      <p className="studio-footer">A sketch counts. A bug fixed counts. Helping a friend counts. Keep making things.</p>
    </div>
  );
}
