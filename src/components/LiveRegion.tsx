import { useEffect, useRef, type ReactNode } from 'react';

interface LiveRegionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps decorative animated illustrations. While the wrapper is off-screen
 * (or the tab is hidden) it adds `.is-paused` — which stops every CSS
 * animation inside it — and pauses SMIL animation on every child <svg>.
 * Non-essential loops therefore only cost anything while they are visible.
 */
export default function LiveRegion({ children, className = '' }: LiveRegionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let inView = true;
    const apply = () => {
      const run = inView && document.visibilityState === 'visible';
      el.classList.toggle('is-paused', !run);
      el.querySelectorAll('svg').forEach((svg) => {
        if (run) svg.unpauseAnimations();
        else svg.pauseAnimations();
      });
    };

    const io =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const entry of entries) inView = entry.isIntersecting;
              apply();
            },
            { rootMargin: '120px 0px' },
          );
    io?.observe(el);
    document.addEventListener('visibilitychange', apply);

    return () => {
      io?.disconnect();
      document.removeEventListener('visibilitychange', apply);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={className}>
      {children}
    </div>
  );
}
