import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { getEvidenceTypeDescriptions, getTechnologies, getTechnologyCategories } from '../content/loader';
import type { EvidenceType } from '../content/types';
import SectionHeading from '../components/SectionHeading';
import EvidenceTag from '../components/EvidenceTag';

const EVIDENCE_ORDER: EvidenceType[] = ['project', 'explored', 'portfolio'];

/**
 * Technology matrix grouped by category.id (from technologies.json's
 * `categories` array), presented as an ARIA tabs widget (arrow keys,
 * Home/End). Every technology shows its evidence tag
 * (project/explored/portfolio) — never a skill bar or 1-5 rating.
 */
export default function Ecosystem() {
  const technologies = getTechnologies();
  const evidenceDescriptions = getEvidenceTypeDescriptions();
  const categories = getTechnologyCategories().filter((category) =>
    technologies.some((tech) => tech.category === category.id),
  );
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '');
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeIndex = Math.max(0, categories.findIndex((category) => category.id === activeId));
  const active = categories[activeIndex];
  const items = technologies.filter((tech) => tech.category === active?.id);

  const counts = EVIDENCE_ORDER.map((type) => ({
    type,
    count: technologies.filter((tech) => tech.evidence === type).length,
  }));

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = categories.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = activeIndex === last ? 0 : activeIndex + 1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = activeIndex === 0 ? last : activeIndex - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    const category = categories[next];
    if (category) {
      setActiveId(category.id);
      tabRefs.current[next]?.focus();
    }
  }

  return (
    <section id="ecosystem" aria-labelledby="ecosystem-heading" className="relative border-b border-line px-6 py-24 lg:py-32">
      <div aria-hidden="true" className="bg-grid-fine pointer-events-none absolute inset-0 opacity-40 mask-fade-b" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          id="ecosystem-heading"
          title="Technology matrix"
          description="Grouped by category. Each entry is tagged with how it was actually used — not a skill level."
          aside={
            <dl className="flex flex-wrap gap-x-6 gap-y-3">
              {counts.map(({ type, count }) => (
                <div key={type} className="flex items-center gap-3" title={evidenceDescriptions[type]}>
                  <dt>
                    <EvidenceTag evidence={type} />
                  </dt>
                  <dd className="tabular font-mono text-sm text-text-strong">{count}</dd>
                </div>
              ))}
            </dl>
          }
        />

        <div className="grid gap-8 lg:grid-cols-12" data-reveal>
          <div
            role="tablist"
            aria-label="Technology categories"
            aria-orientation="vertical"
            className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:col-span-3 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {categories.map((category, index) => {
              const selected = index === activeIndex;
              const count = technologies.filter((tech) => tech.category === category.id).length;
              return (
                <button
                  key={category.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`${baseId}-tab-${category.id}`}
                  aria-selected={selected}
                  aria-controls={`${baseId}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveId(category.id)}
                  onKeyDown={onKeyDown}
                  className={`group relative flex shrink-0 items-center justify-between gap-4 rounded-md border px-4 py-3 text-left transition-colors ${
                    selected
                      ? 'border-teal/60 bg-panel text-text-strong'
                      : 'border-transparent text-text hover:border-line hover:bg-panel/60 hover:text-text-strong'
                  }`}
                >
                  <span className="font-mono text-xs uppercase tracking-wider">{category.label}</span>
                  <span className={`tabular font-mono text-[11px] ${selected ? 'text-teal' : 'text-text/70'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={active ? `${baseId}-tab-${active.id}` : undefined}
            tabIndex={0}
            className="rounded-lg lg:col-span-9"
          >
            {active ? (
              <div key={active.id}>
                <p className="animate-panel-in text-base text-text">{active.description}</p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((tech, index) => (
                    <li
                      key={tech.id}
                      className="surface surface-interactive animate-panel-in flex flex-col gap-2 p-4"
                      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-medium text-text-strong">{tech.name}</span>
                        <EvidenceTag evidence={tech.evidence} title={evidenceDescriptions[tech.evidence]} />
                      </div>
                      <p className="text-sm leading-relaxed text-text">{tech.role}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
