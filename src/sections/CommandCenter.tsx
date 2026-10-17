import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { getProfile, getTechnologies } from '../content/loader';
import GridBackdrop from '../components/GridBackdrop';
import StatusLed from '../components/StatusLed';
import EngineeringCoreMount from '../three/EngineeringCoreMount';
import { prefersReducedMotion } from '../hooks/useReducedMotion';

function useClock(timeZone: string): string {
  const format = () =>
    new Date().toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const [time, setTime] = useState(format);
  useEffect(() => {
    const id = window.setInterval(() => setTime(format()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone]);
  return time;
}

/**
 * Hero. The text column is the real content; the Engineering Core on the
 * right is decoration (WebGL when capable, a static SVG core otherwise —
 * see EngineeringCoreMount). The boot-in sequence only runs when motion
 * is allowed, and starts from already-laid-out content.
 */
export default function CommandCenter() {
  const profile = getProfile();
  const technologies = getTechnologies();
  const time = useClock(profile.timezone);
  const rootRef = useRef<HTMLElement>(null);
  const linkedin = profile.contact.channels.find((channel) => channel.id === 'linkedin');

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('[data-boot="status"]', { opacity: 0, y: -8, duration: 0.6 })
        .from('[data-boot="title"] span', { yPercent: 110, duration: 1.1, stagger: 0.04 }, '-=0.3')
        .from('[data-boot="line"]', { opacity: 0, y: 14, filter: 'blur(6px)', duration: 0.9, stagger: 0.09 }, '-=0.8')
        .from('[data-boot="core"]', { opacity: 0, scale: 0.92, duration: 1.6 }, 0.2);
    }, root);
    return () => ctx.revert();
  }, []);

  const names = technologies.map((tech) => tech.name);

  return (
    <section
      ref={rootRef}
      id="command-center"
      aria-labelledby="command-center-heading"
      className="relative overflow-hidden border-b border-line"
    >
      <GridBackdrop />

      <div className="relative mx-auto grid min-h-[88vh] w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-12 lg:py-24">
        <div className="relative z-10 lg:col-span-7">
          <div
            data-boot="status"
            className="mb-10 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-line bg-panel/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-text backdrop-blur"
          >
            <StatusLed tone="teal" pulse />
            <span className="text-text-strong">{profile.location}</span>
            <span aria-hidden="true" className="hidden text-line sm:inline">
              /
            </span>
            <span>{profile.timezone}</span>
            <span aria-hidden="true" className="hidden text-line sm:inline">
              /
            </span>
            <time className="tabular text-teal" aria-label={`Local time in ${profile.location}`}>
              {time}
            </time>
          </div>

          <h1
            id="command-center-heading"
            data-boot="title"
            className="overflow-hidden pb-2 text-6xl font-bold tracking-[-0.035em] text-text-strong sm:text-8xl lg:text-[7.5rem] lg:leading-[0.95]"
            aria-label={profile.brand}
          >
            {[...profile.brand].map((char, index) => (
              <span key={index} aria-hidden="true" className={`inline-block ${char === '9' ? 'text-teal' : ''}`}>
                {char}
              </span>
            ))}
          </h1>

          <p data-boot="line" className="mt-6 max-w-xl font-mono text-xs uppercase leading-relaxed tracking-[0.24em] text-text sm:text-sm">
            {profile.role_line}
          </p>

          <p data-boot="line" className="mt-8 max-w-2xl text-xl leading-snug text-text-strong sm:text-2xl">
            {profile.core_message}
          </p>

          <div data-boot="line" className="mt-10 flex flex-wrap items-center gap-3">
            <a href="#projects" className="btn-primary">
              View case studies
              <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            {linkedin ? (
              <a href={linkedin.url} className="btn-ghost">
                {linkedin.label}
              </a>
            ) : null}
          </div>

          <p data-boot="line" className="mt-12 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-crimson-text">
            <span aria-hidden="true" className="h-px w-8 bg-crimson" />
            {profile.tagline}
          </p>
        </div>

        <div data-boot="core" className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            <EngineeringCoreMount />
          </div>
        </div>
      </div>

      {/* Technology ticker — a decorative duplicate of the Ecosystem matrix. */}
      <div aria-hidden="true" className="relative border-t border-line bg-panel/40">
        <div className="mask-ticker overflow-hidden py-3">
          <div className="animate-marquee flex w-max gap-8 hover:[animation-play-state:paused]">
            {[...names, ...names].map((name, index) => (
              <span key={`${name}-${index}`} className="flex items-center gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-text">
                {name}
                <span className="h-1 w-1 rounded-full bg-teal/60" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
