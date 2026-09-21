import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import Lenis from 'lenis';
import { Menu, X } from 'lucide-react';
import LandingPage from './components/LandingPage';
import WorkIndex from './components/WorkIndex';
import TeamStrip from './components/TeamStrip';
import Contact from './components/Contact';
import ThemeToggle from './components/ThemeToggle';
import { projects } from './data/projects';
import { people } from './data/people';
import { site } from './data/site';
import { setLenis, scrollToId, scrollToTop, jumpToTop } from './lib/smoothScroll';
import { useAuth } from './lib/authContext';

// Route-level code splitting: the workspace (and other secondary pages) ship
// in their own chunks, keeping the landing bundle lean.
const People = lazy(() => import('./components/People'));
const PersonPage = lazy(() => import('./components/PersonPage'));
const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const Access = lazy(() => import('./components/Access'));
const Workspace = lazy(() => import('./components/workspace/Workspace'));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="kicker text-ink-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-acid-500 status-dot" /> Loading…
      </span>
    </div>
  );
}

// Per-route document title + meta description, derived from the live data.
function PageMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const base = 'Peer Advisor Tech Department — Engineering Studio';
    let title = base;
    let description =
      'Peer Advisor Tech Department — a student engineering studio building production software for campus. Selected work, capabilities, and team.';

    if (pathname === '/team') {
      title = 'Team — PATD';
      description = 'Meet the builders of the Peer Advisor Tech Department — current team and historical contributors.';
    } else if (pathname.startsWith('/team/')) {      const person = people.find((p) => p.id === pathname.split('/').pop());
      if (person) {
        title = `${person.name} — PATD`;
        description = person.insights || description;
      }
    } else if (pathname.startsWith('/project/')) {
      const project = projects.find((p) => p.id === pathname.split('/').pop());
      if (project) {
        title = `${project.title} — PATD`;
        description = project.caption || description;
      }
    } else if (pathname === '/access') {
      title = 'Sign in — PATD';
      description = 'Member access to the Peer Advisor Tech Department workspace.';
    } else if (pathname === '/workspace') {
      title = 'Workspace — PATD';
      description = 'The PATD operations console — projects, tasks, and team coordination.';
    } else if (pathname !== '/') {
      title = 'Page not found — PATD';
    }

    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description);
  }, [pathname]);
  return null;
}

// Thin acid scroll-progress hairline pinned under the nav.
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 inset-x-0 z-[60] h-[2px] origin-left bg-acid-500"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

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

  const isActive = (item) => item.route && location.pathname.startsWith(item.route);

  return (
    <header className="fixed top-3 md:top-4 inset-x-3 md:inset-x-6 z-50">
      {/* Floating frosted capsule — Apple-style nav that lifts off the page */}
      <div
        className={`mx-auto max-w-[1200px] transition-all duration-500 ${
          open ? 'rounded-[28px]' : 'rounded-full'
        } ${
          scrolled || open
            ? 'glass-nav border border-ink-800 shadow-lift'
            : 'glass-nav border border-ink-800/60'
        }`}
      >
        <nav className="px-5 md:px-7 h-[60px] flex items-center justify-between" aria-label="Main">
        <button onClick={home} className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-ink-50">
          <span className="inline-block w-2 h-2 bg-acid-500" />
          {site.shortName}
          <span className="text-ink-500 font-normal">/dev</span>
        </button>

        <div className="hidden md:flex items-center gap-9">
          {site.nav.map((item) => (
            <button
              key={item.label}
              onClick={() => go(item)}
              aria-current={isActive(item) ? 'page' : undefined}
              className={`kicker transition-colors ${
                isActive(item) ? 'text-ink-50 link-underline' : 'text-ink-300 hover:text-ink-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <ThemeToggle />
          <button onClick={() => navigate(user ? '/workspace' : '/access')} className="kicker rounded-full btn-acid px-6 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid-500">
            {user ? 'Workspace' : 'Sign in'}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <ThemeToggle />
          <button
            className="text-ink-100"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        </nav>

        <motion.div initial={false} animate={{ height: open ? 'auto' : 0 }} className="md:hidden overflow-hidden border-t border-transparent" style={open ? { borderColor: 'var(--color-ink-800)' } : undefined}>
        <div className="px-6 py-6 flex flex-col gap-1">
          {site.nav.map((item) => (
            <button
              key={item.label}
              onClick={() => go(item)}
              aria-current={isActive(item) ? 'page' : undefined}
              className={`text-left font-display text-2xl py-2 ${isActive(item) ? 'text-acid-500' : 'text-ink-100'}`}
            >
              {item.label}
            </button>
          ))}
          <button onClick={() => { setOpen(false); navigate(user ? '/workspace' : '/access'); }} className="self-start mt-4 kicker rounded-full btn-acid px-6 py-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid-500">
            {user ? 'Workspace' : 'Sign in'}
          </button>
        </div>
        </motion.div>
      </div>
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
          <span>{people.filter((p) => p.status !== 'historical').length} Builders</span>
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

function SponsorSet({ hidden = false }) {
  return (
    <div className="sponsor-ticker__set" aria-hidden={hidden || undefined}>
      {site.sponsors.map((name) => (
        <span key={name} className="sponsor-ticker__item">
          <span className="text-acid-500">✦</span>
          {name}
        </span>
      ))}
    </div>
  );
}

function SponsorTicker() {
  return (
    <section className="sponsor-ticker border-t border-ink-800" aria-label="Sponsors">
      <div className="sponsor-ticker__label">Sponsors</div>
      <div className="sponsor-ticker__viewport">
        <div className="sponsor-ticker__track">
          <SponsorSet />
          <SponsorSet hidden />
        </div>
      </div>
    </section>
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
      className={`fixed bottom-6 right-6 z-40 kicker rounded-full glass-soft px-4 py-2 text-ink-300 transition-all duration-300 hover:text-acid-500 ${
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
      <TeamStrip />
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
    return <NotFound />;
  }
  return <ProjectDetail project={project} onBack={handleBack} onSelectProject={handleSelect} />;
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        <div className="kicker text-ink-500 mb-4">Error 404</div>
        <h1 className="font-display text-5xl md:text-7xl font-semibold text-ink-50 mb-6 tracking-tight">
          Nothing at this address.
        </h1>
        <p className="text-ink-400 mb-8 max-w-md mx-auto">
          The page you’re looking for moved, retired, or never shipped.
        </p>
        <button onClick={() => navigate('/')} className="kicker rounded-full btn-acid px-7 py-3.5">
          ← Back to home
        </button>
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="kicker text-ink-500 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-acid-500 status-dot" /> Authenticating…
        </span>
      </div>
    );
  }
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
    <div className="min-h-screen text-ink-200">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="grain" aria-hidden="true" />
      <PageMeta />
      {!isApp && <ScrollProgress />}
      {!isApp && <Nav />}
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/team" element={<People />} />
              <Route path="/team/:id" element={<PersonPage />} />
              <Route path="/join" element={<Navigate to="/" replace />} />
              <Route path="/project/:id" element={<ProjectPage />} />
              <Route path="/access" element={<Access />} />
              <Route path="/workspace" element={<RequireAuth><Workspace /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      {!isApp && <SponsorTicker />}
      {!isApp && <SiteFooter />}
      {!isApp && <BackToTop />}
    </div>
  );
}
