import { useEffect, useRef } from 'react';

// Native modal focus containment, Escape, and focus restoration also work on
// mobile. Busy mutations cannot be dismissed midway through a request.
export default function Dialog({ children, titleId, onClose, busy = false, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    dialog.querySelector('[data-autofocus]')?.focus();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus?.(); };
  }, []);
  return <dialog ref={ref} aria-labelledby={titleId} aria-busy={busy} className={`studio-dialog ${className}`}
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={event => { if (event.target === ref.current && !busy) { const rect = ref.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    {children}
  </dialog>;
}
