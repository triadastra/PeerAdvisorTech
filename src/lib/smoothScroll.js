// Thin wrapper around the Lenis instance so navigation code stays clean.
// App registers the instance; everything else just calls these helpers, which
// fall back to native scrolling when Lenis is absent or reduced-motion is on.

let lenis = null;

const NAV_OFFSET = -72; // height of the fixed nav

export function setLenis(instance) {
  lenis = instance;
}

function prefersReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis && !prefersReduced()) {
    lenis.scrollTo(el, { offset: NAV_OFFSET });
  } else {
    el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' });
  }
}

export function scrollToTop() {
  if (lenis && !prefersReduced()) {
    lenis.scrollTo(0);
  } else {
    window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
  }
}

// Instant jump (used on route changes so a new page starts at the top).
export function jumpToTop() {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }
}
