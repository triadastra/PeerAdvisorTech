import { motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../lib/theme';

/**
 * Dark/light scheme switch. Quiet hairline pill — the icon cross-fades,
 * nothing bounces, nothing glows. Persists via localStorage (see lib/theme).
 */
export default function ThemeToggle({ className = '' }) {
  const [theme, toggle] = useTheme();
  const reduce = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full neu-chip text-ink-300 transition-colors hover:text-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acid-500 ${className}`}
    >
      <motion.span
        key={theme}
        initial={reduce ? false : { opacity: 0, rotate: -30, scale: 0.7 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: reduce ? 0 : 0.25, ease: 'easeOut' }}
        className="flex"
      >
        {isDark ? <Sun className="h-4 w-4" strokeWidth={1.75} /> : <Moon className="h-4 w-4" strokeWidth={1.75} />}
      </motion.span>
    </button>
  );
}
