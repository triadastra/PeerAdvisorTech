import { motion } from 'framer-motion';
import wordmark from '../data/standardcas-wordmark.json';

// Actual sans-serif glyph outlines, generated from our self-hosted Space Grotesk.
// Draw for ~0.8 seconds, then hold the completed wordmark before the handoff.
export default function StandardCASWordmark({ delay = 0 }) {
  return (
    <svg viewBox={wordmark.viewBox} className="w-[min(76vw,640px)] h-auto overflow-visible" role="img" aria-label={wordmark.label}>
      {wordmark.paths.map((d, i) => (
        <motion.path key={i} d={d} stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"
          initial={{ pathLength: 0, opacity: 0, fillOpacity: 0 }}
          animate={{ pathLength: 1, opacity: 1, fillOpacity: 1 }}
          transition={{
            pathLength: { delay: delay + i * 0.014, duration: 0.6, ease: 'easeInOut' },
            opacity: { delay: delay + i * 0.014, duration: 0.04 },
            fillOpacity: { delay: delay + 0.76, duration: 0.12 },
          }}
        />
      ))}
    </svg>
  );
}
