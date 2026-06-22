import { motion, useReducedMotion } from 'framer-motion';
import { site, siteStats } from '../data/site';
import { scrollToId } from '../lib/smoothScroll';
import Reveal from './Reveal';

const pad = (n) => String(n).padStart(2, '0');

export default function LandingPage({ onViewWork }) {
  const reduce = useReducedMotion();

  return (
    <div>
      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-[72px]">
        <div className="absolute inset-0 grid-faint opacity-60 pointer-events-none" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-[1200px] px-6">
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
            className="font-display font-semibold tracking-[-0.02em] text-ink-50 text-[13vw] leading-[0.95] sm:text-7xl lg:text-8xl"
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
              className="kicker text-ink-950 bg-acid-500 px-6 py-3.5 hover:bg-acid-400 transition-colors"
            >
              View work ↓
            </button>
            <button onClick={() => scrollToId('contact')} className="kicker text-ink-200 hover:text-ink-50 px-2 py-3.5 link-underline">
              Start a conversation →
            </button>
          </motion.div>
        </div>

        {/* Ledger stat strip */}
        <div className="relative mx-auto w-full max-w-[1200px] px-6 mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 border-y border-ink-800 divide-x divide-ink-800">
            {siteStats.map((s) => (
              <div key={s.label} className="px-5 py-6 md:py-7">
                <div className="font-display text-4xl md:text-5xl font-medium text-ink-50 tnum">{pad(s.value)}</div>
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
      <section id="about" className="relative mx-auto max-w-[1200px] px-6 py-24 md:py-32 scroll-mt-20">
        <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end mb-14">
          <div className="md:col-span-5">
            <div className="kicker text-ink-500 mb-4">[ 01 ] — {site.capabilities.heading}</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-50 tracking-tight">
              {site.capabilities.heading}
            </h2>
          </div>
          <p className="md:col-span-6 md:col-start-7 text-ink-300 text-lg leading-relaxed">{site.capabilities.blurb}</p>
        </Reveal>

        <div className="border-t border-ink-800">
          {site.capabilities.items.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 0.04}
              className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 border-b border-ink-800 py-8 md:py-10"
            >
              <div className="md:col-span-1 kicker text-ink-500 group-hover:text-acid-500 transition-colors tnum">
                {pad(i + 1)}
              </div>
              <h3 className="md:col-span-4 font-display text-2xl md:text-3xl font-medium text-ink-100 group-hover:text-ink-50 transition-colors">
                {item.title}
              </h3>
              <p className="md:col-span-7 text-ink-400 leading-relaxed md:text-lg">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

    </div>
  );
}
