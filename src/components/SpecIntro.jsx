import { useEffect } from 'react';
import { motion } from 'framer-motion';
import SpecArt from './SpecArt';

const pad = (n) => String(n).padStart(2, '0');
const DURATION = 2800; // ms — the ~3s intro, then hand off to the detail page

// Full-screen title card that animates what a spec does, then calls onDone.
// Click anywhere, press a key, or hit Skip to advance early.
export default function SpecIntro({ project, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, DURATION);
    const onKey = () => onDone();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-ink-950 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onDone}
      role="dialog"
      aria-label={`Opening ${project.title}`}
    >
      <div className="absolute inset-0 grid-faint opacity-40 pointer-events-none" aria-hidden="true" />

      <button
        onClick={onDone}
        className="absolute top-6 right-6 kicker text-ink-500 hover:text-acid-500 transition-colors z-10"
      >
        Skip →
      </button>

      <div className="relative w-52 h-52 md:w-64 md:h-64 text-ink-100">
        <SpecArt id={project.id} />
      </div>

      <motion.div
        className="relative mt-8 text-center px-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="kicker text-acid-500 mb-3 tnum">SPEC {pad(project.spec)}</div>
        <h2 className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-ink-50">{project.title}</h2>
        <p className="mt-4 text-ink-400 max-w-md mx-auto">{project.caption}</p>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-acid-500"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: DURATION / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}
