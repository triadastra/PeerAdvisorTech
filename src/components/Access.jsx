import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { site, projectCountWord } from '../data/site';

const inputCls = 'w-full rounded-m field-input px-4 py-2.5';

const inside = [
  ['01', 'Calendar', 'Agenda + month view, every event tagged to a spec'],
  ['02', 'Timeline', 'The roadmap to the September handoff'],
  ['03', 'Agents', 'Super Relay™, Academy RAG & autonomous ops'],
  ['04', 'Team', 'Who leads what across the project network'],
  ['05', 'Tasks & plans', 'The shared coordination ledger'],
];

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

export default function Access() {
  const { user, signIn, signUp, oauth, loading, authError, signInWithLaunchpad } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Already signed in → go straight to the workspace.
  useEffect(() => {
    if (user) navigate('/workspace', { replace: true });
  }, [user, navigate]);

  const isSignup = mode === 'signup';

  // What's still needed before this submits cleanly — drives the helper nudge.
  const missing = isSignup && !name.trim()
    ? 'name'
    : !email.trim()
      ? 'email'
      : !password.trim()
        ? 'password'
        : '';

  // Client-side checks that mirror the server, so we catch problems before the
  // round-trip instead of bouncing off a 400.
  const validate = () => {
    if (isSignup && !name.trim()) return 'Please enter your name.';
    if (!email.trim()) return 'Please enter your email.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return 'Enter a valid email address.';
    if (!password) return 'Please enter your password.';
    if (isSignup && password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setBusy(true);
    try {
      if (isSignup) await signUp({ email, password, name });
      else await signIn({ email, password });
      navigate('/workspace', { replace: true });
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="absolute inset-0 grid-faint opacity-40 pointer-events-none" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-6 pt-[120px] md:pt-[150px] pb-24 min-h-screen">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-20 items-start">
          {/* ── Left: editorial intro ── */}
          <div>
            <div className="flex items-center justify-between border-b border-ink-800 pb-4 mb-12 kicker text-ink-400 tnum">
              <span>{site.shortName} · Workspace</span>
              <span>VID — verified identity</span>
            </div>

            <div className="kicker text-acid-500 mb-4">Operations console · Restricted</div>
            <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-[-0.02em] text-ink-50 leading-[0.95]">
              Sign in to
              <br />
              the studio.
            </h1>
            <p className="mt-6 max-w-xl text-ink-300 text-lg leading-relaxed">
              Your private workspace inside {site.name} — where the {projectCountWord} projects of AI Central are coordinated,
              planned, and shipped. Calendar, timeline, agents, your team, and the tasks that move the work forward.
            </p>

            <div className="mt-12 border-t border-ink-800">
              {inside.map(([n, title, text]) => (
                <div key={n} className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_160px_1fr] gap-x-5 gap-y-1 border-b border-ink-800 py-4 items-baseline">
                  <span className="kicker text-ink-600 tnum">{n}</span>
                  <span className="font-display text-lg text-ink-100">{title}</span>
                  <span className="col-span-2 sm:col-span-1 text-ink-500 text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: auth panel (first on small screens, sticky beside the intro on desktop) ── */}
          <aside className="order-first lg:order-none w-full lg:sticky lg:top-28">
            <div className="rounded-xl glass-panel p-7 md:p-8">
              {loading ? <p className="text-ink-300">Checking sign-in…</p> : oauth ? (
                <div className="space-y-6">
                  <h2 className="text-xl text-ink-100">Sign in with Launchpad</h2>
                  <p className="text-ink-400">Use your StandardCAS identity to access tasks and GitHub branches.</p>
                  {(error || authError) && <p role="alert" className="text-[#fb7185]">{error || authError}</p>}
                  <button disabled={busy} className="w-full rounded-full btn-acid px-6 py-3.5" onClick={async () => {
                    setBusy(true); setError('');
                    try { await signInWithLaunchpad(); } catch (err) { setError(err.message); setBusy(false); }
                  }}>{busy ? 'Connecting…' : 'Continue with Launchpad →'}</button>
                </div>
              ) : (<>
              <div className="grid grid-cols-2 gap-1 mb-8 rounded-full border border-ink-700 bg-ink-900/70 p-1">
                <button
                  onClick={() => { setMode('signin'); setError(''); }}
                  aria-pressed={!isSignup}
                  className={`kicker rounded-full py-2 transition-all ${!isSignup ? 'bg-acid-500 text-on-acid shadow-sm' : 'text-ink-400 hover:text-ink-100'}`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(''); }}
                  aria-pressed={isSignup}
                  className={`kicker rounded-full py-2 transition-all ${isSignup ? 'bg-acid-500 text-on-acid shadow-sm' : 'text-ink-400 hover:text-ink-100'}`}
                >
                  Request access
                </button>
              </div>

              <form onSubmit={submit} className="space-y-6">
                {isSignup && (
                  <Field label="Name">
                    <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="First Last" autoComplete="name" />
                  </Field>
                )}
                <Field label="Email">
                  <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </Field>
                <Field label="Password" hint={isSignup ? '8+ characters' : undefined}>
                  <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={isSignup ? 'new-password' : 'current-password'} />
                </Field>

                {error && <p className="kicker text-[#fb7185] normal-case tracking-normal leading-relaxed">{error}</p>}

                <div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full kicker rounded-full btn-acid px-6 py-3.5 disabled:opacity-70 disabled:cursor-wait"
                  >
                    {busy ? 'Working…' : isSignup ? 'Request access →' : 'Sign in →'}
                  </button>
                  {missing && !error && (
                    <p className="mt-3 kicker text-ink-500 normal-case tracking-normal">
                      Enter your {missing} to continue.
                    </p>
                  )}
                </div>
              </form>

              <p className="mt-6 kicker text-ink-600 normal-case tracking-normal leading-relaxed">
                {isSignup
                  ? 'Access is for PA Tech members. Your profile and workspace are created on first sign-in.'
                  : 'New to the studio? Request access above.'}
              </p>
              </>)}
            </div>

            <Link to="/" className="mt-6 inline-block kicker text-ink-500 hover:text-ink-200 link-underline">
              ← Back to site
            </Link>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
