import { useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { projects } from '../data/projects';
import { teamForSpec } from '../data/people';
import Contact from './Contact';

const pad = (n) => String(n).padStart(2, '0');

function SpecRow({ label, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-1 md:gap-6 border-b border-ink-800 py-4">
      <dt className="md:col-span-3 kicker text-ink-500">{label}</dt>
      <dd className="md:col-span-9 text-ink-100">{children}</dd>
    </div>
  );
}

export default function ProjectDetail({ project, onBack, onSelectProject }) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  if (!project) return null;

  const projectIndex = projects.findIndex((p) => p.id === project.id);
  const { spec, status, tier, affiliation, teamOrder = [], techStack = [], highlights = [], workDescriptions = [] } = project;
  const team = teamForSpec(spec).sort((a, b) => {
    if (!teamOrder.length) return 0;
    return teamOrder.indexOf(a.name) - teamOrder.indexOf(b.name);
  });

  const related = projects
    .filter(
      (p) =>
        p.id !== project.id &&
        (p.category === project.category || Math.abs(projects.indexOf(p) - projectIndex) === 1),
    )
    .slice(0, 3);

  const goToProject = (id) => (onSelectProject ? onSelectProject(id) : onBack());

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* reading progress */}
      <motion.div className="fixed top-0 left-0 h-[2px] bg-acid-500 z-[60]" style={{ width: progress }} />

      <div className="mx-auto max-w-[1200px] px-6 pt-[120px] md:pt-[160px]">
        <button onClick={onBack} className="kicker text-ink-400 hover:text-ink-50 transition-colors link-underline">
          ← Back to work
        </button>

        {/* header */}
        <div className="mt-10 border-b border-ink-800 pb-12 md:pb-16">
          <div className="kicker text-ink-500 tnum flex flex-wrap items-center gap-3">
            <span className="text-acid-500">SPEC {pad(spec)}</span>
            <span className="text-ink-700">/</span>
            <span>{project.category}</span>
            <span className="text-ink-700">/</span>
            <span>{status}</span>
            {tier && (
              <>
                <span className="text-ink-700">/</span>
                <span>{tier}</span>
              </>
            )}
          </div>
          <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.02em] text-ink-50 leading-[0.95]">
            {project.title}
          </h1>
          <p className="mt-6 max-w-3xl text-xl md:text-2xl text-ink-300 leading-snug">{project.caption}</p>
        </div>

        {/* spec sheet */}
        <dl className="border-t border-ink-800 mt-0">
          {tier && <SpecRow label="Layer">{tier}</SpecRow>}
          <SpecRow label="Status">{status}</SpecRow>
          {affiliation && <SpecRow label="Affiliation">{affiliation}</SpecRow>}
          {techStack.length > 0 && (
            <SpecRow label="Stack">
              <span className="font-mono text-sm text-ink-200">{techStack.join('  ·  ')}</span>
            </SpecRow>
          )}
        </dl>

        {/* overview */}
        <section className="py-20 md:py-28 border-b border-ink-800">
          <div className="kicker text-ink-500 mb-6">Overview</div>
          <p className="max-w-3xl text-xl md:text-2xl text-ink-200 leading-relaxed text-balance">{project.bio}</p>
        </section>

        {/* what we built */}
        {workDescriptions.length > 0 && (
          <section className="py-20 md:py-28 border-b border-ink-800">
            <div className="kicker text-ink-500 mb-12">What we built</div>
            <div className="border-t border-ink-800">
              {workDescriptions.map((work, i) => (
                <div key={i} className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 border-b border-ink-800 py-8 md:py-10">
                  <div className="md:col-span-1 kicker text-ink-500 group-hover:text-acid-500 transition-colors tnum">{pad(i + 1)}</div>
                  <h3 className="md:col-span-4 font-display text-xl md:text-2xl font-medium text-ink-100">{work.title}</h3>
                  <p className="md:col-span-7 text-ink-400 leading-relaxed md:text-lg">{work.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* highlights */}
        {highlights.length > 0 && (
          <section className="py-20 md:py-28 border-b border-ink-800">
            <div className="kicker text-ink-500 mb-12">Highlights</div>
            <div className="border-t border-ink-800">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-baseline gap-5 border-b border-ink-800 py-5">
                  <span className="text-acid-500 shrink-0">—</span>
                  <span className="text-ink-100 md:text-lg">{h}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* team */}
        <section className="py-20 md:py-28 border-b border-ink-800">
          <div className="kicker text-ink-500 mb-12">Team — {pad(team.length)}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10">
            {team.map((m, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4 border-t border-ink-800 py-4">
                <span className="text-ink-100 font-medium">{m.name}</span>
                <span className="kicker text-ink-500 text-right shrink-0">{m.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* related */}
        {related.length > 0 && (
          <section className="py-20 md:py-28">
            <div className="kicker text-ink-500 mb-12">Related work</div>
            <div>
              {related.map((p) => (
                <button
                  key={p.id}
                  onClick={() => goToProject(p.id)}
                  className="group relative block w-full text-left border-t border-ink-800 last:border-b hover:bg-ink-900/50 transition-colors"
                >
                  <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-acid-500 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
                  <div className="flex items-center gap-4 md:gap-8 pl-4 pr-2 py-6">
                    <span className="kicker text-ink-500 group-hover:text-acid-500 tnum w-7 shrink-0 transition-colors">
                      {pad(p.spec)}
                    </span>
                    <h3 className="font-display text-xl md:text-3xl font-medium text-ink-100 group-hover:text-ink-50 transition-colors shrink-0">
                      {p.title}
                    </h3>
                    <span className="hidden md:block flex-1 self-end mb-3 border-b border-dashed border-ink-800" />
                    <span className="hidden md:flex items-center gap-3 kicker text-ink-400 shrink-0">
                      <span>{p.category}</span>
                      <span className="text-ink-700">·</span>
                      <span>{p.status}</span>
                    </span>
                    <span className="ml-auto md:ml-0 kicker text-ink-500 group-hover:text-acid-500 group-hover:translate-x-1 transition-all shrink-0">→</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <Contact />
    </motion.div>
  );
}
