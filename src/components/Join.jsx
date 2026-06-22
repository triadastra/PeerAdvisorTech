import { useState } from 'react';
import { motion } from 'framer-motion';
import { projects, specColors } from '../data/projects';
import { site } from '../data/site';
import SpecRing from './SpecRing';

const teamEmail = site.contact.links.find((l) => l.label === 'Email')?.value || 'patech@standardcas.org';
const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const initials = (s) =>
  s.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '—';
const q = (s) => JSON.stringify(s ?? '');

function buildEntry({ name, year, about, focusArr, specs }) {
  const id = slugify(name) || 'new-member';
  const av = initials(name);
  const leads = specs.map((n) => `{ n: ${n}, role: 'Contributor' }`).join(', ');
  return `  {
    id: '${id}', name: ${q(name)}, year: '${year}', avatar: '${av}',
    status: 'active',
    title: 'Member',
    leads: [${leads}],
    insights: ${q(about)},
    focus: [${focusArr.map(q).join(', ')}],
  },`;
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="kicker text-ink-500 flex items-center gap-2">
        {label}
        {hint && <span className="text-ink-700 normal-case tracking-normal">· {hint}</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputCls =
  'w-full bg-ink-950 border border-ink-700 px-3.5 py-2.5 text-ink-50 placeholder-ink-500 outline-none transition-colors focus:border-acid-500 focus:bg-ink-900';

export default function Join() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState('');
  const [about, setAbout] = useState('');
  const [specs, setSpecs] = useState([]);
  const [copied, setCopied] = useState(false);

  const focusArr = focus.split(',').map((s) => s.trim()).filter(Boolean);
  const entry = buildEntry({ name, year, about, focusArr, specs });
  const ready = name.trim() && year.trim() && email.trim();

  const toggleSpec = (n) => setSpecs((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const submit = () => {
    const subject = `New member application — ${name}`;
    const body = [
      `Name: ${name}`,
      `Class: ’${year}`,
      `Email: ${email}`,
      `Focus: ${focus || '—'}`,
      `Interested specs: ${specs.map((n) => projects.find((p) => p.spec === n)?.title).join(', ') || '—'}`,
      '',
      'About:',
      about || '—',
      '',
      '--- people.js entry ---',
      entry,
    ].join('\n');
    window.location.assign(`mailto:${teamEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="mx-auto max-w-[1200px] px-6 pt-[120px] md:pt-[160px]">
        {/* Welcome */}
        <div className="border-b border-ink-800 pb-12 md:pb-16">
          <div className="kicker text-acid-500 mb-4">Membership · Now recruiting</div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-[-0.02em] text-ink-50 leading-[0.95]">
            Welcome — build
            <br />
            with us.
          </h1>
          <p className="mt-6 max-w-2xl text-ink-300 text-lg">
            PA Tech is open to all majors and skill levels. Introduce yourself below to claim your page and join the
            studio — we onboard new members every semester. No résumé required, just curiosity.
          </p>
        </div>

        {/* Form + live preview */}
        <div className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-16 py-12 md:py-16">
          {/* Form */}
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-8">
              <Field label="Name">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="First Last" />
              </Field>
              <Field label="Class year" hint="grad year, e.g. 29">
                <input className={inputCls} value={year} onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} placeholder="29" inputMode="numeric" />
              </Field>
            </div>

            <Field label="Email" hint="how we reach you">
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </Field>

            <Field label="Focus" hint="comma-separated">
              <input className={inputCls} value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Frontend, Design, AI / ML" />
            </Field>

            <Field label="About you" hint="a sentence or two">
              <textarea className={`${inputCls} resize-none`} rows={3} value={about} onChange={(e) => setAbout(e.target.value)} placeholder="What you’re into and what you’d like to build." />
            </Field>

            <Field label="Specs you’d like to work on" hint="optional">
              <div className="flex flex-wrap gap-2 mt-1">
                {projects.map((p) => {
                  const on = specs.includes(p.spec);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleSpec(p.spec)}
                      className={`inline-flex items-center gap-2 border px-3 py-1.5 transition-colors ${on ? 'border-acid-500 text-ink-50' : 'border-ink-700 text-ink-400 hover:text-ink-200'}`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: on ? specColors[p.spec] : '#2b2a27' }} />
                      <span className="text-sm">{p.title}</span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={submit}
                disabled={!ready}
                className="kicker text-ink-950 bg-acid-500 px-6 py-3.5 hover:bg-acid-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit application →
              </button>
              <button onClick={copy} className="kicker text-ink-300 hover:text-ink-50 link-underline">
                {copied ? 'Copied ✓' : 'Copy entry'}
              </button>
              {!ready && <span className="kicker text-ink-600">Name, year & email required</span>}
            </div>

            <p className="kicker text-ink-600 leading-relaxed normal-case tracking-normal max-w-xl">
              Submitting opens a pre-filled email to the team with your details. Applications are reviewed and added to
              the roster — once merged, your page goes live at /team/your-name.
            </p>
          </div>

          {/* Live preview */}
          <aside>
            <div className="lg:sticky lg:top-24">
              <div className="kicker text-ink-500 mb-4">Live preview — your page</div>
              <div className="border border-ink-800 p-6">
                <SpecRing specs={specs} className="w-28 h-28 mx-auto" />
                <div className="text-center mt-4">
                  <span className="font-display text-2xl text-ink-50">{name || 'Your name'}</span>{' '}
                  <span className="kicker text-ink-500">’{year || '—'}</span>
                </div>
                <div className="kicker text-ink-500 text-center mt-1">Member</div>
                {about && <p className="mt-5 text-ink-300 text-sm leading-relaxed">{about}</p>}
                {focusArr.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2 justify-center">
                    {focusArr.map((f) => (
                      <span key={f} className="kicker text-ink-400 border border-ink-700 px-2.5 py-1">{f}</span>
                    ))}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-ink-800 text-center kicker text-ink-500 tnum">
                  {specs.length} {specs.length === 1 ? 'spec' : 'specs'} selected
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
