import type { Project } from '../content/types';
import { getTechnologies, getDomainById } from '../content/loader';
import StatusBadge from './StatusBadge';
import LiveRegion from './LiveRegion';
import ProjectIllustration from '../illustrations/ProjectIllustrations';
import DomainIcon from '../illustrations/DomainIcon';

export default function ProjectCard({ project }: { project: Project }) {
  const technologies = getTechnologies();
  const domain = getDomainById(project.domain);
  const techNames = project.technologies
    .map((id) => technologies.find((tech) => tech.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <article
      id={`project-${project.id}`}
      aria-labelledby={`project-${project.id}-title`}
      className="surface surface-interactive group flex h-full scroll-mt-24 flex-col overflow-hidden"
    >
      <div className="relative border-b border-line">
        <LiveRegion className="aspect-[320/140] w-full overflow-hidden">
          <div className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]">
            <ProjectIllustration projectId={project.id} />
          </div>
        </LiveRegion>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-panel to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {project.code ? (
            <span className="rounded-md border border-line bg-bg/85 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-teal backdrop-blur">
              Case {project.code}
            </span>
          ) : (
            <span />
          )}
          <StatusBadge status={project.project_status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          {domain ? (
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-text">
              <DomainIcon id={domain.id} className="h-3.5 w-3.5 text-teal" />
              {domain.title}
            </p>
          ) : null}
          <h3 id={`project-${project.id}-title`} className="mt-2 text-xl font-semibold tracking-tight text-text-strong">
            {project.title}
          </h3>
        </div>

        <p className="leading-relaxed text-text">{project.summary}</p>

        <div className="rounded-md border border-line bg-bg/50 p-4">
          <h4 className="label text-teal">Challenge</h4>
          <p className="mt-2 text-sm leading-relaxed text-text-strong">{project.challenge}</p>
        </div>

        {project.scope_areas_requiring_verification && project.scope_areas_requiring_verification.length > 0 ? (
          <p className="rounded-md border border-crimson/35 bg-crimson/[0.06] px-3 py-2 text-xs text-text">
            <span className="font-mono uppercase tracking-wider text-crimson-text">Requires verification: </span>
            {project.scope_areas_requiring_verification.join(', ')}
          </p>
        ) : null}

        {project.screenshots.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {project.screenshots.map((screenshot) => (
              <img
                key={screenshot.src}
                src={`${import.meta.env.BASE_URL}${screenshot.src.replace(/^\//, '')}`}
                alt={screenshot.alt}
                loading="lazy"
                className="rounded border border-line"
              />
            ))}
          </div>
        ) : null}

        {techNames.length > 0 ? (
          <ul className="mt-auto flex flex-wrap gap-1.5 border-t border-line pt-4">
            {techNames.map((name) => (
              <li key={name} className="chip">
                {name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
