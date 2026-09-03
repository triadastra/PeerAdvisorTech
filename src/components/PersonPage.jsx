import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { people } from '../data/people';
import { projects, liveLeads } from '../data/projects';
import SpecRing from './SpecRing';
import CharacterReveal from './CharacterReveal';
import Contact from './Contact';

const pad = (n) => String(n).padStart(2, '0');
const specByNumber = Object.fromEntries(projects.map((p) => [p.spec, p]));

function Section({ title, children }) {
  return (
    <section className="py-10 border-b border-ink-800 last:border-b-0">
      <div className="kicker text-ink-500 mb-5">{title}</div>
      {children}
    </section>
  );
}

export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const person = people.find((p) => p.id === id);
  const [revealed, setRevealed] = useState(!!reduce);

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="kicker text-ink-500 mb-4">Error 404</div>
          <h1 className="font-display text-3xl font-bold text-ink-50 mb-6">Person not found</h1>
          <button onClick={() => navigate('/team')} className="kicker text-acid-500 link-underline">
            ← Back to people
          </button>
        </div>
      </div>
    );
  }

  const leads = liveLeads(person);
  const specs = person.leads === 'all' ? 'all' : leads.map((l) => l.n);
  const bio = person.bio?.length ? person.bio : [person.insights];
  const derived = [
    ['Status', person.status === 'away' ? 'Away' : 'Active'],
    ['Specs', specs === 'all' ? `All ${projects.length}` : String(specs.length)],
  ];
  const infobox = person.facts ? [...person.facts, ...derived] : [['Role', person.title], ['Class', `’${person.year}`], ...derived];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <div className="mx-auto max-w-[1200px] px-6 pt-[120px] md:pt-[160px]">
          <button onClick={() => navigate('/team')} className="kicker text-ink-400 hover:text-ink-50 transition-colors link-underline">
            ← People
          </button>

          <div className="mt-8 border-b border-ink-800 pb-10">
            <div className="kicker text-acid-500 mb-4">{person.title}</div>
            <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-[-0.02em] text-ink-50 leading-[0.95]">
              {person.name} <span className="text-ink-500 font-normal text-3xl md:text-5xl tnum">’{person.year}</span>
            </h1>
            {person.headline && <p className="mt-5 max-w-3xl text-xl md:text-2xl text-ink-300 leading-snug">{person.headline}</p>}
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 mt-10">
            <div>
              <Section title="Biography">
                {bio.map((para, i) => (
                  <p key={i} className="text-ink-200 md:text-lg leading-relaxed mb-4 max-w-2xl">{para}</p>
                ))}
              </Section>

              {person.sections?.map((s) => (
                <Section key={s.title} title={s.title}>
                  {s.body.map((para, i) => (
                    <p key={i} className="text-ink-300 leading-relaxed mb-4 max-w-2xl">{para}</p>
                  ))}
                </Section>
              ))}

              {person.cv?.length > 0 && (
                <Section title="Roles & positions">
                  <div className="border-t border-ink-800">
                    {person.cv.map((e, i) => (
                      <div key={i} className="grid md:grid-cols-[150px_1fr] gap-1 md:gap-6 border-b border-ink-800 py-4">
                        <div className="kicker text-ink-500 tnum">{e.period}</div>
                        <div>
                          <div className="font-display text-lg text-ink-50">{e.role}</div>
                          <div className="kicker text-ink-500">{e.org}</div>
                          {e.detail && <p className="text-ink-400 leading-relaxed mt-2">{e.detail}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              <Section title="Leadership">
                {specs === 'all' ? (
                  <p className="text-ink-200">Lead across all {projects.length} specs.</p>
                ) : specs.length ? (
                  <div className="flex flex-wrap gap-2">
                    {leads.map((l) => {
                      const s = specByNumber[l.n];
                      return (
                        <button
                          key={l.n}
                          onClick={() => navigate(`/project/${s.id}`)}
                          className="group/spec inline-flex items-center gap-2 border border-ink-700 hover:border-acid-500 px-3 py-1.5 transition-colors"
                        >
                          <span className="kicker text-ink-500 tnum">{pad(l.n)}</span>
                          <span className="text-ink-200 group-hover/spec:text-ink-50 text-sm">{s.title}</span>
                          <span className="kicker text-ink-600">{l.role}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-ink-500">—</p>
                )}
              </Section>

              {person.recognition?.length > 0 && (
                <Section title="Selected recognition">
                  <ul className="space-y-2.5 max-w-2xl">
                    {person.recognition.map((a, i) => (
                      <li key={i} className="flex gap-3 text-ink-200">
                        <span className="text-acid-500 shrink-0">—</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {person.focus?.length > 0 && (
                <Section title="Focus">
                  <div className="flex flex-wrap gap-2">
                    {person.focus.map((f) => (
                      <span key={f} className="kicker text-ink-300 border border-ink-700 px-3 py-1.5">{f}</span>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            <aside>
              <div className="lg:sticky lg:top-24 border border-ink-800 p-6">
                <SpecRing specs={specs} className="w-32 h-32 mx-auto" />
                <div className="text-center mt-4 font-display text-xl text-ink-50">{person.name}</div>
                <div className="kicker text-ink-500 text-center mb-5">Team</div>
                <dl>
                  {infobox.map(([k, v]) => (
                    <div key={k} className="border-t border-ink-800 py-3">
                      <dt className="kicker text-ink-500 mb-1">{k}</dt>
                      <dd className="text-ink-100 text-sm leading-snug">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </aside>
          </div>
        </div>
        <Contact />
      </motion.div>

      <AnimatePresence>{!revealed && <CharacterReveal person={person} onDone={() => setRevealed(true)} />}</AnimatePresence>
    </>
  );
}
