import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { Menu, X } from 'lucide-react';
// Home-page sections load eagerly — they're the first paint and must not flash.
import LandingPage from './components/LandingPage';
import WorkIndex from './components/WorkIndex';
import Contact from './components/Contact';
// Secondary routes (and the auth-only workspace) are code-split so the landing
// page no longer ships the whole site in one chunk.
const People = lazy(() => import('./components/People'));
const PersonPage = lazy(() => import('./components/PersonPage'));
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const Join = lazy(() => import('./components/Join'));
const Access = lazy(() => import('./components/Access'));
const Workspace = lazy(() => import('./components/workspace/Workspace'));
import { projects } from './data/projects';
import { people } from './data/people';
import { site } from './data/site';
import { setLenis, scrollToId, scrollToTop, jumpToTop } from './lib/smoothScroll';
import { useAuth } from './lib/authContext';

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24));

  // Nav item is either a route ({ route }) or a home-page section ({ target }).
  const go = useCallback((item) => {
    setOpen(false);
    if (item.route) {
      navigate(item.route);
      return;
    }
    if (!isHome) {
      navigate('/');
      setTimeout(() => scrollToId(item.target), 140);
    } else {
      scrollToId(item.target);
    }
  }, [isHome, navigate]);

  const home = useCallback(() => {
    setOpen(false);
    if (!isHome) navigate('/');
    else scrollToTop();
  }, [isHome, navigate]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled ? 'bg-ink-950/85 backdrop-blur-md border-b border-ink-800' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-[1200px] px-6 h-[72px] flex items-center justify-between">
        <button onClick={home} className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-ink-50">
          <span className="inline-block w-2 h-2 bg-acid-500" />
          {site.shortName}
          <span className="text-ink-500 font-normal">/dev</span>
        </button>

        <div className="hidden md:flex items-center gap-9">
          {site.nav.map((item) => (
            <button key={item.label} onClick={() => go(item)} className="kicker text-ink-300 hover:text-ink-50 transition-colors">
              {item.label}
            </button>
          ))}
          <button onClick={() => navigate(user ? '/workspace' : '/access')} className="kicker text-ink-300 hover:text-ink-50 transition-colors">
            {user ? 'Workspace' : 'Sign in'}
          </button>
          <button onClick={() => navigate(user ? '/workspace' : '/access')} className="kicker text-ink-950 bg-acid-500 px-4 py-2 hover:bg-acid-400 transition-colors">
            {user ? 'Open workspace →' : 'Workspace →'}
          </button>
        </div>

        <button
          className="md:hidden text-ink-100"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      <motion.div initial={false} animate={{ height: open ? 'auto' : 0 }} className="md:hidden overflow-hidden border-t border-ink-800 bg-ink-950">
        <div className="px-6 py-6 flex flex-col gap-1">
          {site.nav.map((item) => (
            <button key={item.label} onClick={() => go(item)} className="text-left font-display text-2xl text-ink-100 py-2">
              {item.label}
            </button>
          ))}
          <button onClick={() => { setOpen(false); navigate(user ? '/workspace' : '/access'); }} className="text-left font-display text-2xl text-ink-100 py-2">
            {user ? 'Workspace' : 'Sign in'}
          </button>
          <button onClick={() => { setOpen(false); navigate(user ? '/workspace' : '/access'); }} className="mt-4 kicker text-ink-950 bg-acid-500 px-4 py-3 text-center">
            {user ? 'Open workspace →' : 'Workspace →'}
          </button>
        </div>
      </motion.div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-ink-800">
      <div className="mx-auto max-w-[1200px] px-6 py-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="inline-block w-2 h-2 bg-acid-500" />
          <span className="font-semibold text-ink-100">{site.shortName}</span>
          <span className="text-ink-500">— {site.footerNote}</span>
        </div>
        <div className="flex items-center gap-6 kicker text-ink-400 tnum">
          <span>{projects.length} Projects</span>
          <span className="text-ink-700">·</span>
          <span>{people.length} Builders</span>
          <span className="text-ink-700">·</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-acid-500 status-dot" />
            Operational
          </span>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="mx-auto max-w-[1200px] px-6 py-3 text-right font-mono text-[10px] uppercase tracking-[0.14em] text-ink-600">
          {site.footerCredit}
        </div>
      </div>
    </footer>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setShow(v > 800));
  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 kicker text-ink-300 border border-ink-700 bg-ink-950/80 backdrop-blur-sm px-3 py-2 transition-all duration-300 hover:text-acid-500 hover:border-ink-600 ${
        show ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-2'
      }`}
    >
      ↑ Top
    </button>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const onProjectSelect = useCallback((p) => navigate(`/project/${p.id}`), [navigate]);
  return (
    <>
      <LandingPage onViewWork={() => scrollToId('work')} />
      <WorkIndex onProjectSelect={onProjectSelect} />
      <Contact />
    </>
  );
}

function ProjectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = location.pathname.split('/').pop();
  const project = projects.find((p) => p.id === projectId);
  const handleBack = useCallback(() => navigate('/'), [navigate]);
  const handleSelect = useCallback((id) => navigate(`/project/${id}`), [navigate]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="kicker text-ink-500 mb-4">Error 404</div>
          <h1 className="font-display text-3xl font-bold text-ink-50 mb-6">Project not found</h1>
          <button onClick={handleBack} className="kicker text-acid-500 link-underline">
            ← Back to work
          </button>
        </div>
      </div>
    );
  }
  return <ProjectDetail project={project} onBack={handleBack} onSelectProject={handleSelect} />;
}

// Shown while a lazily-loaded route chunk is fetched.
function RouteFallback({ label = 'Loading…' }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="kicker text-ink-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-acid-500 status-dot" /> {label}
      </span>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <RouteFallback label="Authenticating…" />;
  if (!user) return <Navigate to="/access" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const isApp = location.pathname.startsWith('/workspace');

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    setLenis(lenis);
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduce]);

  useEffect(() => {
    jumpToTop();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-ink-950 text-ink-200">
      <div className="grain" aria-hidden="true" />
      {!isApp && <Nav />}
      <main>
        <AnimatePresence mode="wait">
          <Suspense fallback={<RouteFallback />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/team" element={<People />} />
              <Route path="/team/:id" element={<PersonPage />} />
              <Route path="/join" element={<Join />} />
              <Route path="/project/:id" element={<ProjectPage />} />
              <Route path="/access" element={<Access />} />
              <Route path="/workspace" element={<RequireAuth><Workspace /></RequireAuth>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      {!isApp && <SiteFooter />}
      {!isApp && <BackToTop />}
    </div>
  );
}
