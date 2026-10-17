import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

/**
 * Counts the leading integer of `value` up from zero the first time it
 * scrolls into view ("13 YRS" -> 0..13 + " YRS"). Renders the final value
 * until then, and permanently under reduced motion, so the static frame
 * is always the true figure.
 */
export default function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    const match = /^(\d+)(.*)$/.exec(value);
    if (!el || !match || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;
    const target = Number(match[1]);
    const suffix = match[2] ?? '';
    let frame = 0;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setDisplay(`${Math.round(target * eased)}${suffix}`);
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular">
      <span className="sr-only">{value}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
