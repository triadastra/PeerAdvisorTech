import { useEffect } from 'react';
import { motion } from 'framer-motion';
import ProfileRing from './ProfileRing';

const DURATION = 2200;

export default function CharacterReveal({ person, onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, DURATION);
    const onKey = () => onDone();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] bg-ink-950 flex flex-col items-center justify-center cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onDone}
      role="dialog"
      aria-label={`Opening ${person.name}`}
    >
      <motion.div
        className="w-[min(68vw,360px)] aspect-square"
        initial={{ scale: 0.72, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <ProfileRing person={person} showAvatar={false} className="w-full h-full" />
      </motion.div>

      <button onClick={onDone} className="absolute top-6 right-6 kicker text-ink-500 hover:text-acid-500 transition-colors">
        Skip →
      </button>
    </motion.div>
  );
}
