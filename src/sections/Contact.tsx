import { getProfile } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * LinkedIn only, from profile.contact.channels. Do not add an email field
 * or any other channel, even as a placeholder — the content JSON defines
 * exactly one channel and that is the contract.
 */
export default function Contact() {
  const profile = getProfile();
  const linkedin = profile.contact.channels.find((channel) => channel.id === 'linkedin');
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="contact" aria-labelledby="contact-heading" className="px-6 py-20">
      <div ref={revealRef} className="mx-auto max-w-5xl">
        <SectionHeading id="contact-heading" eyebrow="Contact" title="Get in touch" />

        <Panel className="grid gap-8 p-6 sm:grid-cols-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">Availability</h3>
            <p className="mt-2 text-text-strong">{profile.contact.availability}</p>

            {linkedin ? (
              <a
                href={linkedin.url}
                className="mt-6 inline-block border border-teal px-5 py-2.5 font-mono text-sm uppercase tracking-wider text-text-strong hover:bg-teal/10"
              >
                {linkedin.label} &rarr;
              </a>
            ) : null}
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">Topics</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {profile.contact.topics.map((topic) => (
                <li key={topic} className="border border-line px-3 py-1 text-sm text-text">
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </section>
  );
}
