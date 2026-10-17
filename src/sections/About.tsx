import { getProfile } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import CountUp from '../components/CountUp';
import LiveRegion from '../components/LiveRegion';
import HeroSchematic from '../illustrations/HeroSchematic';
import { reveal } from '../hooks/useScrollReveal';

/**
 * Renders profile.json intro/approach/characteristics/contribution_note and
 * the two owner-verified header figures. No other numeric claim may be
 * added here — figures come only from profile.figures.items.
 */
export default function About() {
  const profile = getProfile();
  const [lead, ...rest] = profile.intro;

  return (
    <section id="about" aria-labelledby="about-heading" className="relative border-b border-line px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="about-heading" title="Working across OT and IT" />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-6 lg:col-span-5">
            {lead ? (
              <p {...reveal(0)} className="text-xl leading-relaxed text-text-strong sm:text-2xl sm:leading-relaxed">
                {lead}
              </p>
            ) : null}
            {rest.map((paragraph, index) => (
              <p key={paragraph} {...reveal(index + 1)} className="text-base leading-relaxed text-text sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="lg:col-span-7" data-reveal>
            <Panel ticks className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="label">Signal chain</span>
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-line" />
                  <span className="h-2 w-2 rounded-full bg-line" />
                  <span className="h-2 w-2 rounded-full bg-teal/70" />
                </span>
              </div>
              <LiveRegion className="p-3 sm:p-5">
                <HeroSchematic />
              </LiveRegion>
            </Panel>
          </div>
        </div>

        <div className="mt-20 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h3 className="label text-teal" data-reveal>
              Approach
            </h3>
            <ol className="relative mt-6 space-y-0">
              <span aria-hidden="true" className="absolute bottom-6 left-[11px] top-3 w-px bg-gradient-to-b from-teal/60 via-line to-transparent" />
              {profile.about.approach.map((item, index) => (
                <li key={item} {...reveal(index)} className="relative flex gap-5 pb-6">
                  <span aria-hidden="true" className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal/50 bg-bg">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                  </span>
                  <span className="text-base leading-relaxed text-text-strong">{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text" data-reveal>
              {profile.about.contribution_note}
            </p>
          </div>

          <div className="space-y-6 lg:col-span-5">
            <Panel className="p-6" ticks>
              <div data-reveal>
                <h3 className="label text-teal">Figures</h3>
                <dl className="mt-5 grid grid-cols-2 divide-x divide-line">
                  {profile.figures.items.map((figure, index) => (
                    <div key={figure.label} className={index === 0 ? 'pr-6' : 'pl-6'}>
                      <dt className="label">{figure.label}</dt>
                      <dd className="mt-2 text-5xl font-semibold tracking-tight text-text-strong">
                        <CountUp value={figure.value} />
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-text">{profile.figures.note}</p>
              </div>
            </Panel>

            <Panel className="p-6">
              <div data-reveal>
                <h3 className="label text-teal">Characteristics</h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {profile.about.characteristics.map((item) => (
                    <li key={item} className="rounded-md border border-line bg-bg/60 px-3 py-1.5 text-sm text-text-strong">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}
