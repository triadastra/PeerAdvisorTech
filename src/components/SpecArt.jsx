import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────
//  SpecArt — a bespoke ~2.5s line-art animation per spec, used in SpecIntro.
//  Monochrome line-work with a single acid accent, matching the site.
// ─────────────────────────────────────────────────────────────────────────

const INK = '#ecebe6';
const DIM = '#6f6d67';
const ACID = '#c8f135';

const base = { strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const popStyle = { transformBox: 'fill-box', transformOrigin: 'center' };

// Draw a stroke on (pathLength).
const draw = (delay = 0, duration = 1.1) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { pathLength: { delay, duration, ease: [0.22, 1, 0.36, 1] }, opacity: { delay, duration: 0.2 } },
});

// Scale a shape in from its own center.
const pop = (delay = 0) => ({
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
});

function Frame({ children }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" aria-hidden="true">
      {children}
    </svg>
  );
}

/* S0 — Club Alliances: two club nodes link, a third joins. */
function ClubAlliances() {
  return (
    <Frame>
      <motion.line x1="62" y1="120" x2="138" y2="120" stroke={DIM} {...base} {...draw(0.6, 0.8)} />
      <motion.line x1="72" y1="110" x2="100" y2="66" stroke={DIM} {...base} {...draw(1.1, 0.6)} />
      <motion.line x1="128" y1="110" x2="100" y2="66" stroke={DIM} {...base} {...draw(1.3, 0.6)} />
      <motion.circle cx="62" cy="120" r="16" stroke={INK} {...base} {...draw(0, 0.7)} />
      <motion.circle cx="138" cy="120" r="16" stroke={INK} {...base} {...draw(0.2, 0.7)} />
      <motion.circle cx="100" cy="62" r="16" stroke={ACID} {...base} style={popStyle} {...pop(1.0)} />
      <motion.circle cx="100" cy="120" r="5" fill={ACID} stroke="none"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.3, 1] }} transition={{ delay: 0.8, duration: 1.6, repeat: Infinity }} />
    </Frame>
  );
}

/* S1 — Fyona: a magazine layout assembles. */
function Fyona() {
  return (
    <Frame>
      <motion.rect x="48" y="28" width="104" height="144" rx="5" stroke={INK} {...base} {...draw(0, 1)} />
      <motion.rect x="62" y="42" width="76" height="9" rx="2" stroke={DIM} {...base} style={popStyle} {...pop(0.7)} />
      <motion.rect x="62" y="60" width="76" height="40" rx="2" stroke={ACID} fill={ACID} fillOpacity="0.16" {...base} style={popStyle} {...pop(1.0)} />
      {[0, 1, 2, 3].map((i) => (
        <motion.line key={i} x1="62" y1={114 + i * 12} x2={i % 2 ? 118 : 138} y2={114 + i * 12} stroke={DIM} {...base} {...draw(1.2 + i * 0.12, 0.4)} />
      ))}
      <motion.circle cx="130" cy="80" r="4" fill={ACID} stroke="none" style={popStyle}
        animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }} transition={{ delay: 1.1, duration: 1, repeat: Infinity }} />
    </Frame>
  );
}

/* S2 — Synonance: documents retrieved into a chat answer. */
function Synonance() {
  return (
    <Frame>
      {[0, 1, 2].map((i) => (
        <motion.rect key={i} x="28" y={62 + i * 28} width="26" height="20" rx="2" stroke={DIM} {...base} {...draw(0.1 + i * 0.15, 0.5)} />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.line key={i} x1="58" y1={72 + i * 28} x2="100" y2="100" stroke={ACID} {...base} {...draw(0.8 + i * 0.15, 0.5)} />
      ))}
      <motion.path
        d="M106 62 H170 a8 8 0 0 1 8 8 V118 a8 8 0 0 1 -8 8 H130 l-14 14 v-14 h-2 a8 8 0 0 1 -8 -8 V70 a8 8 0 0 1 8 -8 z"
        stroke={INK} {...base} {...draw(0.4, 1.2)} />
      {[0, 1].map((i) => (
        <motion.line key={i} x1="120" y1={86 + i * 16} x2={i ? 150 : 164} y2={86 + i * 16} stroke={DIM} {...base} {...draw(1.5 + i * 0.15, 0.4)} />
      ))}
    </Frame>
  );
}

/* S3 — The Spine: a hub routes to providers; a packet travels. */
function TheSpine() {
  const nodes = [[40, 60], [40, 140], [160, 60], [160, 140], [100, 30], [100, 170]];
  return (
    <Frame>
      {nodes.map(([x, y], i) => (
        <motion.line key={i} x1="100" y1="100" x2={x} y2={y} stroke={DIM} {...base} {...draw(0.4 + i * 0.08, 0.6)} />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.circle key={`n${i}`} cx={x} cy={y} r="9" stroke={INK} {...base} style={popStyle} {...pop(0.7 + i * 0.08)} />
      ))}
      <motion.circle cx="100" cy="100" r="18" stroke={ACID} {...base} {...draw(0, 0.8)} />
      <motion.circle r="4.5" fill={ACID} stroke="none"
        initial={{ opacity: 0 }} animate={{ cx: [100, 160], cy: [100, 60], opacity: [0, 1, 0] }}
        transition={{ delay: 1.4, duration: 1, repeat: Infinity, repeatDelay: 0.5 }} />
    </Frame>
  );
}

/* S4 — Launchpad: a rocket rises off the pad as it draws in. */
function Launchpad() {
  return (
    <Frame>
      {/* launch pad */}
      <motion.line x1="58" y1="152" x2="142" y2="152" stroke={INK} {...base} {...draw(0, 0.6)} />
      <motion.line x1="68" y1="152" x2="68" y2="142" stroke={DIM} {...base} {...draw(0.2, 0.3)} />
      <motion.line x1="132" y1="152" x2="132" y2="142" stroke={DIM} {...base} {...draw(0.25, 0.3)} />

      {/* rocket — rises as it draws */}
      <motion.g
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.path d="M88 116 V70 Q88 50 100 42 Q112 50 112 70 V116 Z" stroke={INK} {...base} {...draw(0.6, 1)} />
        <motion.path d="M88 100 L77 122 L88 112" stroke={INK} {...base} {...draw(1.15, 0.4)} />
        <motion.path d="M112 100 L123 122 L112 112" stroke={INK} {...base} {...draw(1.25, 0.4)} />
        <motion.circle cx="100" cy="72" r="6" stroke={ACID} fill={ACID} fillOpacity="0.18" {...base} style={popStyle} {...pop(1.35)} />
      </motion.g>

      {/* exhaust flame */}
      <motion.path
        d="M92 120 Q96 138 100 148 Q104 138 108 120"
        stroke={ACID}
        {...base}
        animate={{ opacity: [0, 1, 0.5, 1, 0], pathLength: [0, 1, 0.8, 1, 0] }}
        transition={{ delay: 1.4, duration: 1.5, repeat: Infinity }}
      />
    </Frame>
  );
}

/* S5 — SharedSpace: a directory of people; one is found. */
function SharedSpace() {
  const cells = [];
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) cells.push([46 + c * 54, 52 + r * 44, r * 3 + c]);
  return (
    <Frame>
      {cells.map(([x, y, i]) => {
        const hl = i === 4;
        return (
          <motion.g key={i} style={popStyle} {...pop(0.2 + i * 0.07)}>
            <circle cx={x} cy={y} r="7" stroke={hl ? ACID : DIM} {...base} />
            <path d={`M${x - 11} ${y + 19} a11 11 0 0 1 22 0`} stroke={hl ? ACID : DIM} {...base} />
          </motion.g>
        );
      })}
      <motion.circle cx="100" cy="98" r="25" stroke={ACID} {...base} style={popStyle}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.1, duration: 0.5 }} />
      <motion.line x1="117" y1="115" x2="134" y2="132" stroke={ACID} {...base} {...draw(1.4, 0.4)} />
    </Frame>
  );
}

/* S6 — Club Gateway: an arch is raised, a flag planted. */
function ClubGateway() {
  return (
    <Frame>
      <motion.path d="M56 162 V92 a44 44 0 0 1 88 0 V162" stroke={INK} {...base} {...draw(0, 1.3)} />
      <motion.line x1="44" y1="162" x2="156" y2="162" stroke={INK} {...base} {...draw(0.2, 0.6)} />
      <motion.line x1="100" y1="152" x2="100" y2="84" stroke={DIM} {...base} {...draw(1, 0.5)} />
      <motion.path d="M100 88 H128 l-8 9 l8 9 H100" fill={ACID} fillOpacity="0.85" stroke="none"
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ delay: 1.3, duration: 0.5 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'left center' }} />
      {[0, 1].map((i) => (
        <motion.circle key={i} cx={80 + i * 40} cy="150" r="5" fill={DIM} stroke="none"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 + i * 0.2, duration: 0.5 }} />
      ))}
    </Frame>
  );
}

/* S7 — Database: a store fills, a query scans it. */
function Database() {
  return (
    <Frame>
      <motion.ellipse cx="100" cy="58" rx="44" ry="16" stroke={INK} {...base} {...draw(0, 0.8)} />
      <motion.path d="M56 58 V142 a44 16 0 0 0 88 0 V58" stroke={INK} {...base} {...draw(0.3, 1)} />
      {[0, 1].map((i) => (
        <motion.path key={i} d={`M56 ${90 + i * 28} a44 16 0 0 0 88 0`} stroke={DIM} {...base} {...draw(0.9 + i * 0.2, 0.6)} />
      ))}
      <motion.ellipse cx="100" rx="44" ry="14" stroke={ACID} {...base}
        initial={{ cy: 58, opacity: 0 }} animate={{ cy: [58, 142], opacity: [0, 1, 0] }}
        transition={{ delay: 1.2, duration: 1.5, repeat: Infinity }} />
    </Frame>
  );
}

/* S8 — CareerPlanner: a path with milestones to a goal. */
function CareerPlanner() {
  const pts = [[40, 158], [100, 104], [156, 46]];
  return (
    <Frame>
      <motion.path d="M40 158 C 70 150, 70 112, 100 104 S 150 82, 156 46" stroke={INK} {...base} {...draw(0, 1.5)} />
      {pts.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r={i === 2 ? 9 : 6} stroke={i === 2 ? ACID : DIM}
          fill={i === 2 ? ACID : 'none'} fillOpacity={i === 2 ? 0.85 : 1} {...base} style={popStyle} {...pop(0.4 + i * 0.5)} />
      ))}
      <motion.path d="M156 46 v-24 h18 l-6 7 l6 7 h-18" stroke={ACID} {...base} {...draw(1.5, 0.5)} />
    </Frame>
  );
}

/* S9 — DataSci Outreach: data points and a trend emerge. */
function DataSci() {
  const pts = [[58, 140], [82, 118], [106, 124], [130, 92], [154, 70]];
  return (
    <Frame>
      <motion.path d="M50 38 V150 H162" stroke={INK} {...base} {...draw(0, 0.9)} />
      {pts.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="5" fill={DIM} stroke="none" style={popStyle} {...pop(0.6 + i * 0.12)} />
      ))}
      <motion.polyline points={pts.map((p) => p.join(',')).join(' ')} stroke={ACID} {...base} {...draw(1.3, 1)} />
    </Frame>
  );
}

/* S10 — Competition Lists: a checklist completes under a trophy. */
function CompetitionLists() {
  return (
    <Frame>
      <motion.path
        d="M86 30 H114 V44 a14 14 0 0 1 -28 0 z M86 36 H76 a8 8 0 0 0 8 8 M114 36 H124 a8 8 0 0 1 -8 8 M100 58 V66 M90 70 H110"
        stroke={ACID} {...base} {...draw(0, 1)} />
      {[0, 1, 2].map((i) => {
        const y = 98 + i * 26;
        return (
          <g key={i}>
            <motion.rect x="52" y={y} width="16" height="16" rx="3" stroke={DIM} {...base} {...draw(0.6 + i * 0.2, 0.5)} />
            <motion.line x1="78" y1={y + 8} x2="150" y2={y + 8} stroke={DIM} {...base} {...draw(0.8 + i * 0.2, 0.5)} />
            <motion.path d={`M55 ${y + 8} l4 4 l7 -8`} stroke={ACID} {...base} {...draw(1.4 + i * 0.25, 0.4)} />
          </g>
        );
      })}
    </Frame>
  );
}

const ART = {
  'club-alliances': ClubAlliances,
  fyona: Fyona,
  synonance: Synonance,
  'the-spine': TheSpine,
  launchpad: Launchpad,
  sharedspace: SharedSpace,
  'club-gateway': ClubGateway,
  database: Database,
  careerplanner: CareerPlanner,
  'datasci-outreach': DataSci,
  'competition-lists': CompetitionLists,
};

export default function SpecArt({ id }) {
  const Art = ART[id] || TheSpine;
  return <Art />;
}
