import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { site } from '../data/site';

export default function Contact() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { contact } = site;

  return (
    <section id="contact" className="relative border-t border-ink-800 scroll-mt-20">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12"
      >
        <div className="lg:col-span-7">
          <div className="kicker text-ink-500 mb-6">[ 04 ] — Contact</div>
          <h2 className="font-display text-5xl md:text-6xl font-semibold text-ink-50 tracking-tight leading-[1.02] text-balance">
            {contact.heading[0]}
            <br />
            {contact.heading[1]}
          </h2>
          <p className="mt-7 max-w-xl text-ink-300 text-lg leading-relaxed">{contact.blurb}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href={contact.primary.href} className="kicker text-ink-950 bg-acid-500 px-6 py-3.5 hover:bg-acid-400 transition-colors">
              {contact.primary.label} →
            </a>
            {contact.secondary.to ? (
              <button onClick={() => navigate(contact.secondary.to)} className="kicker text-ink-200 hover:text-ink-50 px-2 py-3.5 link-underline">
                {contact.secondary.label} →
              </button>
            ) : (
              <a href={contact.secondary.href} className="kicker text-ink-200 hover:text-ink-50 px-2 py-3.5 link-underline">
                {contact.secondary.label} →
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 lg:border-l lg:border-ink-800 lg:pl-12">
          <div className="kicker text-ink-500 mb-2">Direct</div>
          <div>
            {contact.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between gap-4 border-t border-ink-800 last:border-b py-5"
              >
                <span className="kicker text-ink-500 group-hover:text-acid-500 transition-colors">{l.label}</span>
                <span className="font-mono text-sm text-ink-200 group-hover:text-ink-50 transition-colors">
                  {l.value} <span className="text-ink-600 group-hover:text-acid-500">↗</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
