import { useEffect, type CSSProperties } from 'react';
import { prefersReducedMotion } from './useReducedMotion';

/**
 * Page-wide scroll reveal. Mounted once (App). Content is fully visible in
 * the markup; only when motion is allowed does this add `motion-ok` to
 * <html>, which arms the CSS start state for every `[data-reveal]` element
 * (see index.css). Elements are revealed by IntersectionObserver as they
 * approach the viewport. Sibling stagger comes from a `--reveal-i` custom
 * property set by the component.
 *
 * Defensive by design — content must never stay hidden:
 *  - elements already above the viewport (deep links, restored scroll) are
 *    revealed immediately;
 *  - `beforeprint` reveals everything;
 *  - newly mounted `[data-reveal]` nodes (tab switches) are picked up by a
 *    MutationObserver and revealed on the next frame if in view;
 *  - with no IntersectionObserver, `motion-ok` is never added at all.
 */
export function useScrollReveal(): void {
  useEffect(() => {
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    const root = document.documentElement;
    root.classList.add('motion-ok');

    const reveal = (el: Element) => el.classList.add('is-revealed');

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const track = (el: Element) => {
      if (el.classList.contains('is-revealed')) return;
      if (el.getBoundingClientRect().bottom < 0) {
        reveal(el);
        return;
      }
      io.observe(el);
    };

    document.querySelectorAll('[data-reveal]').forEach(track);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('[data-reveal]')) track(node);
          node.querySelectorAll('[data-reveal]').forEach(track);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const revealAll = () => document.querySelectorAll('[data-reveal]').forEach(reveal);
    window.addEventListener('beforeprint', revealAll);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('beforeprint', revealAll);
      revealAll();
      root.classList.remove('motion-ok');
    };
  }, []);
}

/** Props helper: `<li {...reveal(i)}>` — staggered sibling reveal. */
export function reveal(index = 0): { 'data-reveal': true; style: CSSProperties } {
  return { 'data-reveal': true, style: { '--reveal-i': String(index) } as CSSProperties };
}
