import { useState, useEffect } from 'react';

export function useQuietMode() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getInitial = () => {
    const stored = localStorage.getItem('quietCornerMode');
    if (stored === 'on' && !prefersReduced) return true;
    if (stored === 'off' && prefersReduced) return false;
    if (stored === '' && prefersReduced) return true;
    if (prefersReduced && stored === null) return true;
    return false;
  };

  const [quiet, setQuiet] = useState(getInitial);

  useEffect(() => {
    if (quiet) {
      document.body.classList.add('quiet-mode');
    } else {
      document.body.classList.remove('quiet-mode');
    }
    localStorage.setItem('quietCornerMode', quiet ? 'on' : 'off');
  }, [quiet]);

  const toggle = () => setQuiet((q) => !q);

  return { quiet, toggle };
}
