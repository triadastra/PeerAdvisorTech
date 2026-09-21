import { motion, useReducedMotion } from 'framer-motion';

// Subtle, restrained reveal-on-scroll with an Apple-like spring settle.
// Disabled entirely for reduced-motion users.
export default function Reveal({ children, className = '', delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', stiffness: 70, damping: 18, mass: 0.9, delay }}
    >
      {children}
    </motion.div>
  );
}
