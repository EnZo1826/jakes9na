import { getProfile } from '../content/loader';
import LiveRegion from '../components/LiveRegion';
import { C } from '../illustrations/palette';
import { Led } from '../illustrations/primitives';

/**
 * LinkedIn only, from profile.contact.channels. Do not add an email field
 * or any other channel, even as a placeholder — the content JSON defines
 * exactly one channel and that is the contract.
 */
export default function Contact() {
  const profile = getProfile();
  const linkedin = profile.contact.channels.find((channel) => channel.id === 'linkedin');

  return (
    <section id="contact" aria-labelledby="contact-heading" className="relative overflow-hidden px-6 py-24 lg:py-32">
      <div aria-hidden="true" className="bg-grid mask-radial pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-6xl">
        <div className="surface ticks grid overflow-hidden lg:grid-cols-12" data-reveal>
          <div className="p-8 sm:p-12 lg:col-span-7">
            <h2 id="contact-heading" className="text-4xl font-semibold tracking-tight text-text-strong sm:text-5xl">
              Get in touch
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-text-strong">{profile.contact.availability}</p>

            {linkedin ? (
              <a href={linkedin.url} className="btn-primary mt-8">
                {linkedin.label}
                <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
                  <path d="M5 11L11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : null}

            <h3 className="label mt-12 text-teal">Topics</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.contact.topics.map((topic) => (
                <li key={topic} className="rounded-full border border-line bg-bg/60 px-4 py-1.5 text-sm text-text-strong">
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[260px] border-t border-line bg-bg/50 lg:col-span-5 lg:border-l lg:border-t-0">
            <LiveRegion className="absolute inset-0">
              <svg viewBox="0 0 300 300" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                {[30, 60, 90, 120, 150].map((r, i) => (
                  <circle key={r} cx={150} cy={150} r={r} fill="none" stroke={C.line} strokeDasharray={i % 2 ? '2 4' : undefined} />
                ))}
                {[0, 1, 2].map((i) => (
                  <circle
                    key={i}
                    cx={150}
                    cy={150}
                    r={40}
                    fill="none"
                    stroke={C.teal}
                    strokeOpacity={0.6}
                    className="animate-ping-ring"
                    style={{ animationDelay: `${i * 0.8}s`, animationDuration: '2.4s' }}
                  />
                ))}
                <path d="M150 0 V300 M0 150 H300" stroke={C.line} strokeDasharray="1 5" />
                <circle cx={150} cy={150} r={14} fill={C.panel} stroke={C.teal} />
                <circle cx={150} cy={150} r={5} fill={C.teal} />
                <Led x={228} y={92} color={C.crimson} blink />
                <Led x={84} y={206} />
                <Led x={206} y={224} r={2} />
                <text x={150} y={190} textAnchor="middle" fill={C.text} fontFamily="JetBrains Mono, monospace" fontSize={8} letterSpacing={1.5}>
                  {profile.location.toUpperCase()}
                </text>
                <text x={150} y={202} textAnchor="middle" fill={C.teal} fontFamily="JetBrains Mono, monospace" fontSize={7} letterSpacing={1.5}>
                  {profile.timezone.toUpperCase()}
                </text>
              </svg>
            </LiveRegion>
          </div>
        </div>
      </div>
    </section>
  );
}
