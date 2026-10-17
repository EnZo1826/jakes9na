import { useId, useState } from 'react';
import { getDomains, getProfile, getProjectById } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import Disclaimer from '../components/Disclaimer';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Domains are selectable: click or keyboard (Tab to a chip, Enter/Space to
 * toggle) to filter/highlight one domain. aria-pressed reflects selection
 * state and an aria-live region announces the change for screen readers.
 */
export default function Domains() {
  const domains = getDomains();
  const profile = getProfile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const liveRegionId = useId();
  const revealRef = useScrollReveal<HTMLDivElement>();

  const selected = domains.find((domain) => domain.id === selectedId) ?? null;

  // Native <button> elements already fire onClick for both Enter and
  // Space, and are naturally Tab-reachable — no custom key handling needed
  // for "keyboard-operable"; aria-pressed below reflects the toggle state.
  function toggle(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    <section id="domains" aria-labelledby="domains-heading" className="border-b border-line px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="domains-heading"
          eyebrow="Domains"
          title="Engineering domains"
          description="Select a domain to see its focus areas and the case studies that use it."
        />

        <div ref={revealRef} role="group" aria-label="Filter by domain" className="flex flex-wrap gap-3">
          {domains.map((domain) => {
            const isSelected = domain.id === selectedId;
            return (
              <button
                key={domain.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggle(domain.id)}
                className={`border px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  isSelected
                    ? 'border-teal bg-teal/10 text-text-strong'
                    : 'border-line bg-panel text-text hover:border-teal/60 hover:text-text-strong'
                }`}
              >
                <span className="text-teal">{domain.short}</span>
                <span className="ml-2">{domain.title}</span>
              </button>
            );
          })}
        </div>

        <p aria-live="polite" id={liveRegionId} className="sr-only">
          {selected ? `${selected.title} selected.` : 'No domain selected.'}
        </p>

        <div className="mt-8">
          {selected ? (
            <Panel className="p-6">
              <h3 className="text-lg font-semibold text-text-strong">{selected.title}</h3>
              <p className="mt-2 text-text">{selected.summary}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {selected.focus.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-text">
                    <span aria-hidden="true" className="text-teal">
                      &rsaquo;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              {selected.projects.length > 0 ? (
                <p className="mt-4 font-mono text-xs uppercase tracking-wider text-text">
                  Related projects:{' '}
                  {selected.projects
                    .map((id) => getProjectById(id)?.title ?? id)
                    .join(', ')}
                </p>
              ) : null}
              {selected.id === 'security-technology' ? (
                <div className="mt-4">
                  <Disclaimer>{profile.disclaimers.security}</Disclaimer>
                </div>
              ) : null}
            </Panel>
          ) : (
            <p className="text-sm text-text">No domain selected — showing all domains above.</p>
          )}
        </div>
      </div>
    </section>
  );
}
