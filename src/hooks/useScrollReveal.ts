import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from './useReducedMotion';

const SAFETY_TIMEOUT_MS = 1200;

/**
 * Subtle reveal-on-scroll. Every element this attaches to already has a
 * meaningful static first frame in markup/CSS terms (full layout, no
 * content removed) — GSAP only adds a short fade/rise when it is NOT
 * reduced-motion, using IntersectionObserver rather than GSAP ScrollTrigger
 * to keep the initial JS bundle small.
 *
 * Defensive by design: content must never end up permanently invisible if
 * something about the observer doesn't fire the way we expect (a captured
 * full-page screenshot, an unusual layout, a browser quirk). A safety
 * timeout force-reveals the element regardless, and the observer is also
 * skipped outright if the element is already inside the viewport on mount.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const alreadyVisible = el.getBoundingClientRect().top < window.innerHeight;
    if (alreadyVisible) {
      return;
    }

    gsap.set(el, { opacity: 0, y: 16 });

    function reveal() {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', overwrite: true });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);

    // Safety net: never leave the element invisible longer than this,
    // regardless of what the observer does.
    const timeoutId = window.setTimeout(reveal, SAFETY_TIMEOUT_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeoutId);
    };
  }, []);

  return ref;
}
