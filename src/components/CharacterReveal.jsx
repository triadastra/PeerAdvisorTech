import { useEffect } from 'react';
import { motion } from 'framer-motion';
import SpecRing from './SpecRing';

const DURATION = 2900; // ms — the unlock, then settle into the bio page
const RAINBOW =
  'linear-gradient(90deg,#ff5a5f,#ff8c42,#ffc145,#c8f135,#4ade80,#2dd4bf,#38bdf8,#6366f1,#a855f7,#e879f9,#fb7185)';

// A Brawl-Stars-style "character unlock": rotating light rays, a flash, a
// spinning chromatic ring, the avatar card springs in, sparkles burst, and the
// rarity + name reveal. Click / any key / Skip advances; reduced-motion bypasses
// this entirely (handled by the page).
export default function CharacterReveal({ person, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, DURATION);
    const onKey = () => onDone();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [onDone]);

  const specs = person.leads === 'all' ? 'all' : Array.isArray(person.leads) ? person.leads.map((l) => l.n) : [];

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-ink-950 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onDone}
      role="dialog"
      aria-label={`Opening ${person.name}`}
    >
      {/* rotating light rays */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'repeating-conic-gradient(from 0deg, transparent 0 9deg, rgba(255,255,255,0.05) 9deg 18deg)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* burst flash */}
      <motion.div
        className="absolute inset-0 m-auto w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.55), transparent 60%)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.8, 2.6], opacity: [0, 0.8, 0] }}
        transition={{ delay: 0.25, duration: 0.9, ease: 'easeOut' }}
      />

      {/* ring + character card + sparkles */}
      <div className="relative w-[min(82vw,440px)] h-[min(82vw,440px)] flex items-center justify-center">
        <SpecRing specs={specs} spin showCount={false} stroke={6} className="absolute inset-0 w-full h-full" />

        <motion.div
          className="relative w-32 h-32 md:w-40 md:h-40 border-2 border-ink-100/80 bg-ink-900 flex items-center justify-center"
          initial={{ scale: 0, rotate: -12, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 240, damping: 13 }}
        >
          <span className="font-display text-5xl md:text-6xl font-bold text-ink-50">{person.avatar}</span>
        </motion.div>

        {[...Array(12)].map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const d = 180;
          return (
            <motion.span
              key={i}
              className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-ink-50"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ delay: 0.35 + i * 0.015, duration: 1, ease: 'easeOut' }}
            />
          );
        })}
      </div>

      {/* rarity + name */}
      <motion.div
        className="relative mt-10 text-center px-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div
          className="kicker mb-4"
          style={{ background: RAINBOW, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}
        >
          ★ TEAM PROFILE
        </div>
        <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-ink-50">{person.name}</h2>
        <div className="kicker text-ink-500 mt-3 tnum">’{person.year}</div>
      </motion.div>

      <button onClick={onDone} className="absolute top-6 right-6 kicker text-ink-500 hover:text-acid-500 transition-colors z-10">
        Skip →
      </button>

      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-acid-500"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: DURATION / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}
