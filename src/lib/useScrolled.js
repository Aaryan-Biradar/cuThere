'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks whether the window has scrolled past `threshold` pixels.
 * Used to toggle the sticky header's background/shadow.
 *
 * @param {number} [threshold=16] — scrollY (px) past which `scrolled` becomes true.
 * @returns {boolean}
 */
export function useScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}
