import { getProfile } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Renders profile.json intro/approach/characteristics/contribution_note and
 * the two owner-verified header figures. No other numeric claim may be
 * added here — figures come only from profile.figures.items.
 */
export default function About() {
  const profile = getProfile();
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="about" aria-labelledby="about-heading" className="border-b border-line px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading id="about-heading" eyebrow="About" title="Working across OT and IT" />

        <div ref={revealRef} className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {profile.intro.map((paragraph) => (
              <p key={paragraph} className="text-text-strong">
                {paragraph}
              </p>
            ))}

            <h3 className="pt-4 font-mono text-xs uppercase tracking-[0.3em] text-teal">Approach</h3>
            <ul className="space-y-2">
              {profile.about.approach.map((item) => (
                <li key={item} className="flex gap-3 text-text">
                  <span aria-hidden="true" className="mt-1 text-teal">
                    &rsaquo;
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="pt-4 text-sm text-text">{profile.about.contribution_note}</p>
          </div>

          <div className="space-y-6">
            <Panel className="p-5">
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">Figures</h3>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                {profile.figures.items.map((figure) => (
                  <div key={figure.label}>
                    <dt className="font-mono text-xs uppercase tracking-wider text-text">{figure.label}</dt>
                    <dd className="text-3xl font-semibold text-text-strong">{figure.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-text">{profile.figures.note}</p>
            </Panel>

            <Panel className="p-5">
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">Characteristics</h3>
              <ul className="mt-4 space-y-1.5 text-sm text-text">
                {profile.about.characteristics.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}
