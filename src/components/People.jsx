import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { people } from '../data/people';
import { projects, liveLeads } from '../data/projects';
import ProfileRing from './ProfileRing';
import { rolesFor, TRAFFIC_ROLES } from '../data/trafficRoles';
import Contact from './Contact';

const pad = (n) => String(n).padStart(2, '0');
const specByNumber = Object.fromEntries(projects.map((p) => [p.spec, p]));
const currentPeople = people.filter((p) => p.status !== 'historical');
const historicalPeople = people.filter((p) => p.status === 'historical');

// First click expands the row (which specs they lead + a summary).
// Second click — "Open profile →" — goes inside to their page.
function PersonRow({ person, open, onToggle, onOpen, onSpec }) {
  const trafficRoles = rolesFor(person);
  const leads = liveLeads(person);

  return (
    <div className="border-t border-ink-800 last:border-b">
      <button onClick={onToggle} className="group w-full flex items-center gap-4 md:gap-6 py-5 text-left" aria-expanded={open}>
        <ProfileRing person={person} shape="box" className="team-profile-frame w-10 h-10 shrink-0" />
        <span className="flex items-baseline gap-2 min-w-0">
          <span className="font-display text-xl md:text-2xl font-medium text-ink-100 group-hover:text-ink-50 transition-colors truncate">
            {person.name}
          </span>
          <span className="kicker text-ink-500 shrink-0">’{person.year}</span>
        </span>
        <span className="hidden lg:block kicker text-ink-500 ml-4 truncate">{person.title}</span>
        {person.status === 'away' && (
          <span className="ml-3 kicker text-ink-400 border border-ink-700 px-2 py-0.5 shrink-0">Away</span>
        )}
        <span className="ml-auto kicker text-ink-500 group-hover:text-acid-500 transition-colors shrink-0">{open ? '−' : '+'}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-12 md:pl-[64px] grid md:grid-cols-[auto_1fr] gap-8 items-start">
              <div className="flex flex-col items-center gap-2">
                <ProfileRing person={person} className="w-28 h-28" />
              </div>
              <div>
                <div className="kicker text-acid-500 mb-3">
                  Team · ’{person.year}
                  {person.status === 'away' ? ' · Away' : ''}
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {trafficRoles.filter((role) => TRAFFIC_ROLES[role].label).map((role) => (
                    <span key={role} className="kicker border px-2.5 py-1" style={{ color: TRAFFIC_ROLES[role].color, borderColor: `${TRAFFIC_ROLES[role].color}66` }}>
                      {TRAFFIC_ROLES[role].label}
                    </span>
                  ))}
                </div>
                <p className="max-w-2xl text-ink-300 md:text-lg leading-relaxed">{person.insights}</p>

                {leads.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {leads.map((l) => {
                      const s = specByNumber[l.n];
                      return (
                        <button
                          key={l.n}
                          onClick={() => onSpec(s.id)}
                          className="group/spec inline-flex items-center gap-2 border border-ink-700 hover:border-acid-500 px-3 py-1.5 transition-colors"
                        >
                          <span className="kicker text-ink-500 tnum">{pad(l.n)}</span>
                          <span className="text-ink-200 group-hover/spec:text-ink-50 text-sm">{s.title}</span>
                          <span className="kicker text-ink-600">{l.role}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={onOpen}
                  className="mt-8 inline-flex items-center gap-2 kicker text-ink-950 bg-acid-500 px-5 py-2.5 hover:bg-acid-400 transition-colors"
                >
                  Open profile →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Group({ index, label, list, open, setOpen, onOpen, onSpec, emptyNote }) {
  return (
    <section className="py-12 md:py-16 border-b border-ink-800 last:border-b-0">
      <div className="kicker text-ink-500 mb-8">
        [ {index} ] — {label} · {pad(list.length)}
      </div>
      {list.length ? (
        <div>
          {list.map((p) => (
            <PersonRow
              key={p.id}
              person={p}
              open={open === p.id}
              onToggle={() => setOpen(open === p.id ? null : p.id)}
              onOpen={() => onOpen(p.id)}
              onSpec={onSpec}
            />
          ))}
        </div>
      ) : (
        emptyNote
      )}
    </section>
  );
}

export default function People() {
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();
  const onOpen = (id) => navigate(`/team/${id}`);
  const onSpec = (id) => navigate(`/project/${id}`);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="mx-auto max-w-[1200px] px-6 pt-[120px] md:pt-[160px]">
        <div className="border-b border-ink-800 pb-12 md:pb-16">
          <div className="kicker text-ink-500 mb-4">People</div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-[-0.02em] text-ink-50 leading-[0.95]">
            The team behind
            <br />
            AI Central.
          </h1>
          <p className="mt-6 max-w-2xl text-ink-300 text-lg">
            The current team in chronological order, followed by the historical directory inherited from StandardCAS™ SHSID.
          </p>
        </div>

        <Group index="01" label="Team" list={currentPeople} open={open} setOpen={setOpen} onOpen={onOpen} onSpec={onSpec} />
        <Group index="02" label="Historical directory · Inherited from StandardCAS™ SHSID" list={historicalPeople} open={open} setOpen={setOpen} onOpen={onOpen} onSpec={onSpec} />
      </div>

      <Contact />
    </motion.div>
  );
}
