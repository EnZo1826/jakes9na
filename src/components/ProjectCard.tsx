import type { Project } from '../content/types';
import { getTechnologies, getDomainById } from '../content/loader';
import Panel from './Panel';
import StatusBadge from './StatusBadge';

export default function ProjectCard({ project }: { project: Project }) {
  const technologies = getTechnologies();
  const domain = getDomainById(project.domain);
  const techNames = project.technologies
    .map((id) => technologies.find((tech) => tech.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <Panel as="article" className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          {project.code ? (
            <span className="font-mono text-xs text-teal">CASE {project.code}</span>
          ) : null}
          <h3 className="mt-1 text-lg font-semibold text-text-strong">{project.title}</h3>
          {domain ? <p className="font-mono text-xs uppercase tracking-wider text-text">{domain.title}</p> : null}
        </div>
        <StatusBadge status={project.project_status} />
      </div>

      <p className="text-text">{project.summary}</p>

      <div>
        <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-teal">Challenge</h4>
        <p className="mt-1 text-sm text-text">{project.challenge}</p>
      </div>

      {project.scope_areas_requiring_verification && project.scope_areas_requiring_verification.length > 0 ? (
        <p className="border-l-2 border-crimson bg-bg px-3 py-2 text-xs text-text">
          <span className="font-mono uppercase tracking-wider text-crimson-text">Requires verification: </span>
          {project.scope_areas_requiring_verification.join(', ')}
        </p>
      ) : null}

      {project.screenshots.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {project.screenshots.map((screenshot) => (
            <img
              key={screenshot.src}
              src={screenshot.src.startsWith('/') ? screenshot.src : `/${screenshot.src}`}
              alt={screenshot.alt}
              loading="lazy"
              className="border border-line"
            />
          ))}
        </div>
      ) : null}

      {techNames.length > 0 ? (
        <ul className="mt-auto flex flex-wrap gap-2 pt-2">
          {techNames.map((name) => (
            <li key={name} className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase text-text">
              {name}
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}
