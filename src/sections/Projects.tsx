import { getFeaturedProjects, getVisibleProjects } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import ProjectCard from '../components/ProjectCard';
import { reveal } from '../hooks/useScrollReveal';

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

  return (
    <section id="projects" aria-labelledby="projects-heading" className="relative border-b border-line px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="projects-heading"
          title="Case studies"
          description="Engineering contributions. No client is named; some are anonymised. Illustrations are schematic, not screenshots of client systems."
          aside={
            <p className="font-mono text-xs uppercase tracking-wider text-text">
              <span className="tabular text-2xl font-semibold text-text-strong">{featured.length}</span>
              <span className="ml-2">featured</span>
            </p>
          }
        />

        <ul className="grid gap-6 md:grid-cols-2">
          {featured.map((project, index) => (
            <li key={project.id} {...reveal(index % 2)}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>

        {other.length > 0 ? (
          <div className="mt-16">
            <h3 className="label">Additional, non-featured</h3>
            <ul className="mt-4 grid gap-6 md:grid-cols-2">
              {other.map((project, index) => (
                <li key={project.id} {...reveal(index % 2)}>
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
