import { useNavigate } from 'react-router-dom';
import { people } from '../data/people';
import { site } from '../data/site';
import ProfileRing from './ProfileRing';
import Reveal from './Reveal';

const pad = (n) => String(n).padStart(2, '0');

// Compact home-page roster preview (#team). Clicking a row opens the person's
// profile; the full catalog (incl. historical members) lives at /team.
export default function TeamStrip() {
  const navigate = useNavigate();
  const current = people.filter((p) => p.status !== 'historical');
  const { teamStrip } = site;

  return (
    <section id="team" className="relative mx-auto max-w-[1200px] px-6 py-28 md:py-40 scroll-mt-24">
      <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end mb-14">
        <div className="md:col-span-5">
          <div className="kicker text-ink-500 mb-4">[ 03 ] — {teamStrip.heading}</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-50 tracking-tight">
            {teamStrip.heading}
          </h2>
        </div>
        <p className="md:col-span-6 md:col-start-7 text-ink-300 text-lg leading-relaxed">{teamStrip.blurb}</p>
      </Reveal>

      <div className="border-t border-ink-800">
        {current.map((person, i) => (
          <Reveal key={person.id} delay={i * 0.03}>
            <button
              onClick={() => navigate(`/team/${person.id}`)}
              className="group w-full flex items-center gap-4 md:gap-6 border-b border-ink-800 py-4 md:py-5 text-left"
            >
              <span className="kicker text-ink-500 group-hover:text-acid-500 transition-colors tnum w-7 shrink-0">
                {pad(i + 1)}
              </span>
              <ProfileRing neutral person={person} shape="box" className="team-profile-frame w-9 h-9 shrink-0" />
              <span className="flex items-baseline gap-2 min-w-0">
                <span className="font-display text-lg md:text-xl font-medium text-ink-100 group-hover:text-ink-50 transition-colors truncate">
                  {person.name}
                </span>
                {person.year && <span className="kicker text-ink-500 shrink-0">’{person.year}</span>}
              </span>
              <span className="hidden md:block kicker text-ink-500 ml-4 truncate">{person.title}</span>
              <span className="ml-auto kicker text-ink-600 group-hover:text-acid-500 transition-colors shrink-0">→</span>
            </button>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-10">
        <button
          onClick={() => navigate('/team')}
          className="kicker text-ink-200 hover:text-ink-50 link-underline py-2"
        >
          {teamStrip.cta} →
        </button>
      </Reveal>
    </section>
  );
}
