// Shared component primitives for the workspace console — the small
// ruled/typographic pieces every section reuses. Helpers live in ./util.js.

import { specColors } from '../../data/projects';
import { specLabel } from './util';

export function SpecDot({ n, size = 6 }) {
  const color = n == null ? '#605e58' : specColors[n] || '#605e58';
  return <span style={{ width: size, height: size, background: color, borderRadius: '50%', display: 'inline-block', flex: 'none' }} />;
}

export function SpecTag({ n }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <SpecDot n={n} />
      <span className="kicker text-ink-500">{specLabel(n)}</span>
    </span>
  );
}

export function SectionHead({ index, title, meta }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <span className="kicker text-ink-400">[ {index} ] — {title}</span>
      {meta && <span className="kicker text-ink-600 tnum">{meta}</span>}
    </div>
  );
}
