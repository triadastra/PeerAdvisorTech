import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useInView, useScroll, useTransform } from 'framer-motion';
import { site, siteStats } from '../data/site';
import { scrollToId } from '../lib/smoothScroll';
import Reveal from './Reveal';

const pad = (n) => String(n).padStart(2, '0');

// Counts up to the real value once scrolled into view. Reduced-motion users
// get the final number immediately.
function CountUp({ value }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const duration = 900;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value]);

  return <span ref={ref}>{pad(display)}</span>;
}

export default function LandingPage({ onViewWork }) {
  const reduce = useReducedMotion();

  // Scroll-driven storytelling: the hero's background layers drift at
  // different rates (glow fastest, grid slower) — depth without gimmick.
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const fadeHero = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <div>
      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24">
        <motion.div style={reduce ? undefined : { y: gridY }} className="absolute -inset-y-24 inset-x-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 grid-faint opacity-60" />
        </motion.div>
        <motion.div style={reduce ? undefined : { y: glowY }} className="hero-glow" aria-hidden="true" />

        <motion.div style={reduce ? undefined : { opacity: fadeHero }} className="relative mx-auto w-full max-w-[1200px] px-6">
          {/* technical meta row */}
          <div className="flex items-center justify-between border-b border-ink-800 pb-4 mb-12 kicker text-ink-400 tnum">
            <span>{site.kicker}</span>
            <span className="hidden sm:block">EST. {site.founded} — v2.0</span>
            <span className="sm:hidden">EST. {site.founded}</span>
          </div>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-semibold tracking-[-0.035em] text-ink-50 text-[13vw] leading-[0.95] sm:text-7xl lg:text-8xl"
          >
            {site.headline[0]}
            <br />
            {site.headline[1]}
            <span className="inline-block w-[0.45em] h-[0.82em] bg-acid-500 ml-3 align-baseline status-dot" />
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-8 max-w-2xl text-lg md:text-xl text-ink-300 leading-relaxed"
          >
            {site.lede}
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={onViewWork}
              className="kicker rounded-full btn-acid px-7 py-3.5"
            >
              View work ↓
            </button>
            <button onClick={() => scrollToId('contact')} className="kicker text-ink-200 hover:text-ink-50 px-2 py-3.5 link-underline">
              Start a conversation →
            </button>
          </motion.div>
        </motion.div>

        {/* Ledger stat strip */}
        <div className="relative mx-auto w-full max-w-[1200px] px-6 mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 border-y border-ink-800 divide-x divide-ink-800">
            {siteStats.map((s) => (
              <div key={s.label} className="px-5 py-6 md:py-7">
                <div className="font-display text-4xl md:text-5xl font-medium text-ink-50 tnum"><CountUp value={s.value} /></div>
                <div className="kicker text-ink-400 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 inset-x-0 mx-auto max-w-[1200px] px-6 hidden md:flex items-center gap-3 kicker text-ink-500">
          <span>Scroll</span>
          <span className="w-10 h-px bg-ink-700" />
          <span>↓</span>
        </div>
      </section>

      {/* ─────────────────────── Capabilities (#about) ─────────────────────── */}
      <section id="about" className="relative mx-auto max-w-[1200px] px-6 py-28 md:py-40 scroll-mt-24">
        <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end mb-14">
          <div className="md:col-span-5">
            <div className="kicker text-ink-500 mb-4">[ 01 ] — {site.capabilities.heading}</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-50 tracking-tight">
              {site.capabilities.heading}
            </h2>
          </div>
          <p className="md:col-span-6 md:col-start-7 text-ink-300 text-lg leading-relaxed">{site.capabilities.blurb}</p>
        </Reveal>

        {/* Bento grid — one feature tile + four companions, all liquid glass.
            Tiles lift a whisper on hover; nothing spins, nothing glows. */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
          {site.capabilities.items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.05}
              className={`group glass-soft rounded-l p-7 md:p-9 transition-transform duration-500 ease-out hover:-translate-y-1 ${
                i === 0 ? 'md:col-span-4' : 'md:col-span-2'
              }`}
            >
              <div className="kicker text-ink-500 group-hover:text-acid-500 transition-colors tnum">
                {pad(i + 1)}
              </div>
              <h3 className={`font-display font-medium text-ink-100 group-hover:text-ink-50 transition-colors mt-5 tracking-tight ${
                i === 0 ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'
              }`}>
                {item.title}
              </h3>
              <p className={`mt-3 text-ink-400 leading-relaxed ${i === 0 ? 'md:text-lg max-w-xl' : 'text-sm'}`}>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

    </div>
  );
}
