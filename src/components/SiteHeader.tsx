import { useEffect, useRef, useState } from 'react';
import { getProfile } from '../content/loader';

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: '#about', label: 'About' },
  { href: '#domains', label: 'Domains' },
  { href: '#ecosystem', label: 'Ecosystem' },
  { href: '#projects', label: 'Projects' },
  { href: '#architecture-lab', label: 'Architecture Lab' },
  { href: '#ai-lab', label: 'AI Lab' },
  { href: '#github-activity', label: 'GitHub' },
  { href: '#contact', label: 'Contact' },
];

/**
 * Sticky header: brand, section nav with scroll-spy (aria-current), a
 * scroll-progress hairline and a disclosure menu below lg.
 */
export default function SiteHeader() {
  const profile = getProfile();
  const [active, setActive] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll progress (transform only, rAF-throttled) + header elevation.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Scroll-spy.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = NAV_ITEMS.map((item) => document.querySelector(item.href)).filter(
      (el): el is Element => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, []);

  // Close the menu on Escape and return focus to its button.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-colors duration-300 ${
        scrolled || open ? 'border-line bg-bg/85 backdrop-blur-md' : 'border-transparent bg-bg/40 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#command-center" className="group flex items-center gap-3 font-mono text-sm uppercase tracking-[0.3em] text-text-strong">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
            <rect x="1" y="1" width="18" height="18" rx="4" fill="none" stroke="#1F2A36" />
            <path d="M5 13 L9 7 L12 11 L15 6" fill="none" stroke="#49D7B1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="15" cy="6" r="1.6" fill="#DA3633" />
          </svg>
          <span className="transition-colors group-hover:text-teal">{profile.brand}</span>
        </a>

        <nav aria-label="Section navigation" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'location' : undefined}
                className={`relative rounded px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                  isActive ? 'text-text-strong' : 'text-text hover:text-teal'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2.5 -bottom-[17px] h-px bg-teal transition-transform duration-300 ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-text-strong lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Section navigation" className="border-t border-line px-6 pb-6 pt-2 lg:hidden">
          <ul className="grid grid-cols-2 gap-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active === item.href ? 'location' : undefined}
                  className="block rounded-md border border-line bg-panel px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-text-strong aria-[current=location]:border-teal"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <div ref={progressRef} className="h-px origin-left scale-x-0 bg-gradient-to-r from-teal via-teal to-crimson" />
      </div>
    </header>
  );
}
