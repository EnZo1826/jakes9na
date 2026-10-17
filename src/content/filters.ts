/**
 * Pure, dependency-free filtering rules for project data. Kept separate
 * from loader.ts so they can be unit-tested against synthetic fixtures
 * without touching the real content/projects.json file.
 */
import type { Project } from './types';

/**
 * A project with confidentiality_level "restricted" must never render,
 * under any filter state. This is the single choke point that enforces
 * that rule — call it at the data-loading boundary (loader.ts), not as a
 * CSS/visual hide further down the tree.
 */
export function filterVisibleProjects(projects: Project[]): Project[] {
  return projects.filter((project) => project.confidentiality_level !== 'restricted');
}

/**
 * "Featured" is a stricter context than "visible": restricted projects are
 * still excluded (defence in depth), and requires_verification projects are
 * defensively excluded even though the content schema already forces
 * featured: false for them.
 */
export function filterFeaturedProjects(projects: Project[]): Project[] {
  return filterVisibleProjects(projects).filter(
    (project) => project.featured && project.project_status !== 'requires_verification',
  );
}

/** Human-readable label derived deterministically from the exact enum value. */
export function formatProjectStatus(status: Project['project_status']): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
