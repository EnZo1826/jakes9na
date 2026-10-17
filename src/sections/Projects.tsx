import { getFeaturedProjects, getVisibleProjects } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Cards built from content/projects.json via the loader. Restricted
 * projects are filtered at the loader boundary and never reach this
 * component at all (see src/content/filters.ts + loader.test.ts).
 * Featured projects render first; any visible-but-not-featured project
 * (none currently) renders in a clearly separate, non-featured group.
 */
export default function Projects() {
  const featured = getFeaturedProjects();
  const visible = getVisibleProjects();
  const featuredIds = new Set(featured.map((project) => project.id));
  const other = visible.filter((project) => !featuredIds.has(project.id));
  const revealRef = useScrollReveal<HTMLUListElement>();

  return (
    <section id="projects" aria-labelledby="projects-heading" className="border-b border-line px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="projects-heading"
          eyebrow="Projects"
          title="Case studies"
          description="Engineering contributions. No client is named; some are anonymised."
        />

        <ul ref={revealRef} className="grid gap-6 md:grid-cols-2">
          {featured.map((project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>

        {other.length > 0 ? (
          <div className="mt-10">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-text">Additional, non-featured</h3>
            <ul className="mt-4 grid gap-6 md:grid-cols-2">
              {other.map((project) => (
                <li key={project.id}>
                  <ProjectCard project={project} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
