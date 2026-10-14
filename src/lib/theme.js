import { useCallback, useEffect, useState } from 'react';

const KEY = 'patd-theme';

export function getTheme() {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* private mode — session-only theme */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'light' ? '#faf9f6' : '#0a0908');
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

/** React binding — re-renders subscribers when the theme flips. */
export function useTheme() {
  const [theme, setThemeState] = useState(getTheme);
  useEffect(() => {
    const onFlip = () => setThemeState(getTheme());
    window.addEventListener('patd-theme', onFlip);
    return () => window.removeEventListener('patd-theme', onFlip);
  }, []);
  const toggle = useCallback(() => {
    toggleTheme();
    window.dispatchEvent(new Event('patd-theme'));
  }, []);
  return [theme, toggle];
}
