import { motion, useReducedMotion } from 'framer-motion';
import { projects, specColors } from '../data/projects';

// A chromatic ring of 11 segments — one per spec. Segments for the specs a
// person leads light up in that spec's color; the rest stay dim. A person with
// specs="all" shows the full rainbow; others show just their slices —
// the more specs they've joined, the more of the ring is lit.
const ALL = projects.map((p) => p.spec).sort((a, b) => a - b);
const VB = 200;
const DIM = '#2b2a27';

export default function SpecRing({ specs, stroke = 9, spin = false, delay = 0, showCount = true, className = '' }) {
  const reduce = useReducedMotion();
  const lit = specs === 'all' ? ALL : specs;
  const r = (VB - stroke) / 2;
  const c = VB / 2;
  const circumference = 2 * Math.PI * r;
  const n = ALL.length;
  const slot = circumference / n;
  const seg = slot * 0.84; // leave a small gap between segments

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} className={className} aria-hidden="true">
      <motion.g
        style={{ transformOrigin: '50% 50%' }}
        animate={spin && !reduce ? { rotate: 360 } : undefined}
        transition={spin && !reduce ? { duration: 44, repeat: Infinity, ease: 'linear' } : undefined}
      >
        {ALL.map((s, i) => {
          const on = lit.includes(s);
          return (
            <motion.circle
              key={s}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={on ? specColors[s] : DIM}
              strokeWidth={stroke}
              strokeDasharray={`${seg} ${circumference - seg}`}
              strokeDashoffset={-i * slot}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: on ? 1 : 0.4 }}
              transition={{ delay: delay + i * 0.045, duration: 0.4 }}
            />
          );
        })}
      </motion.g>
      {showCount && (
        <text
          x={c}
          y={c}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ecebe6"
          fontFamily="'JetBrains Mono Variable', monospace"
          fontSize={VB * 0.2}
          fontWeight="600"
        >
          {specs === 'all' ? n : lit.length}
        </text>
      )}
    </svg>
  );
}
