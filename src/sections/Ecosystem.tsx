import { getTechnologies, getTechnologyCategories } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import EvidenceTag from '../components/EvidenceTag';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Technology matrix grouped by category.id (from technologies.json's
 * `categories` array). Every technology shows its evidence tag
 * (project/explored/portfolio) — never a skill bar or 1-5 rating.
 */
export default function Ecosystem() {
  const categories = getTechnologyCategories();
  const technologies = getTechnologies();
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="ecosystem" aria-labelledby="ecosystem-heading" className="border-b border-line px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="ecosystem-heading"
          eyebrow="Ecosystem"
          title="Technology matrix"
          description="Grouped by category. Each entry is tagged with how it was actually used — not a skill level."
        />

        <div ref={revealRef} className="space-y-10">
          {categories.map((category) => {
            const items = technologies.filter((tech) => tech.category === category.id);
            if (items.length === 0) return null;

            return (
              <div key={category.id}>
                <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">{category.label}</h3>
                <p className="mt-1 text-sm text-text">{category.description}</p>

                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((tech) => (
                    <li key={tech.id}>
                      <Panel className="flex h-full flex-col gap-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-text-strong">{tech.name}</span>
                          <EvidenceTag evidence={tech.evidence} />
                        </div>
                        <p className="text-sm text-text">{tech.role}</p>
                      </Panel>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
