import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { projects } from '../data/projects';
import SpecIntro from './SpecIntro';

const pad = (n) => String(n).padStart(2, '0');
const categories = ['All', ...new Set(projects.map((p) => p.category))];

function WorkRow({ project, number, onSelect, reduce }) {
  return (
    <motion.button
      onClick={() => onSelect(project)}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative block w-full text-left border-t border-ink-800 last:border-b hover:bg-ink-900/50 transition-colors"
    >
      <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-acid-500 origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />
      <div className="flex items-center gap-4 md:gap-8 pl-4 pr-2 py-6 md:py-7">
        <span className="kicker text-ink-500 group-hover:text-acid-500 tnum w-7 shrink-0 transition-colors">{pad(number)}</span>
        <h3 className="font-display text-2xl md:text-4xl font-medium text-ink-100 group-hover:text-ink-50 transition-colors shrink-0">
          {project.title}
        </h3>
        <span className="hidden md:block flex-1 self-end mb-3 border-b border-dashed border-ink-800" />
        <span className="hidden md:flex items-center gap-3 kicker text-ink-400 shrink-0">
          <span>{project.category}</span>
          <span className="text-ink-700">·</span>
          <span>{project.status}</span>
        </span>
        <span className="ml-auto md:ml-0 kicker text-ink-500 group-hover:text-acid-500 group-hover:translate-x-1 transition-all shrink-0">→</span>
      </div>
      <div className="md:hidden pl-[60px] pb-5 -mt-3 kicker text-ink-500">
        {project.category} · {project.status}
      </div>
    </motion.button>
  );
}

export default function WorkIndex({ onProjectSelect }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState('All');
  const [intro, setIntro] = useState(null);

  const filtered = projects.filter((p) => active === 'All' || p.category === active);

  // Click a spec → play its 3s intro, then open the detail. Reduced motion skips straight in.
  const handleSelect = (project) => {
    if (reduce) {
      onProjectSelect(project);
    } else {
      setIntro(project);
    }
  };
  const finishIntro = () => {
    if (intro) onProjectSelect(intro);
  };

  return (
    <>
      <section id="work" className="relative border-t border-ink-800 scroll-mt-20">
        <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="kicker text-ink-500 mb-4">[ 02 ] — Selected work</div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-50 tracking-tight">Work</h2>
              <p className="kicker text-ink-500 mt-4 tnum">
                {pad(filtered.length)} / {pad(projects.length)} projects
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`kicker transition-colors ${active === cat ? 'text-acid-500' : 'text-ink-500 hover:text-ink-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            {filtered.map((project) => (
              <WorkRow key={project.id} project={project} number={project.spec} onSelect={handleSelect} reduce={reduce} />
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>{intro && <SpecIntro key={intro.id} project={intro} onDone={finishIntro} />}</AnimatePresence>
    </>
  );
}
