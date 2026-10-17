/**
 * The single typed boundary between /content JSON and the UI. No component
 * may import from /content directly — everything goes through the getters
 * below, so content rules (e.g. "restricted projects never render") are
 * enforced in exactly one place.
 */
import profileJson from '../../content/profile.json';
import domainsJson from '../../content/domains.json';
import technologiesJson from '../../content/technologies.json';
import projectsJson from '../../content/projects.json';
import aiLabJson from '../../content/ai-lab.json';
import type {
  AiLabContent,
  Domain,
  DomainsContent,
  Profile,
  Project,
  ProjectsContent,
  Technology,
  TechnologiesContent,
  TechnologyCategory,
} from './types';
import { filterFeaturedProjects, filterVisibleProjects } from './filters';

const profile = profileJson as Profile;
const domainsContent = domainsJson as DomainsContent;
const technologiesContent = technologiesJson as TechnologiesContent;
const projectsContent = projectsJson as ProjectsContent;
const aiLabContent = aiLabJson as AiLabContent;

export function getProfile(): Profile {
  return profile;
}

export function getDomains(): Domain[] {
  return domainsContent.domains;
}

export function getDomainById(id: string): Domain | undefined {
  return domainsContent.domains.find((domain) => domain.id === id);
}

export function getTechnologyCategories(): TechnologyCategory[] {
  return technologiesContent.categories;
}

export function getTechnologies(): Technology[] {
  return technologiesContent.technologies;
}

export function getEvidenceTypeDescriptions(): TechnologiesContent['evidence_types'] {
  return technologiesContent.evidence_types;
}

/** All non-restricted projects. Restricted projects never reach the UI. */
export function getVisibleProjects(): Project[] {
  return filterVisibleProjects(projectsContent.projects);
}

/** Visible AND featured AND not requires_verification. */
export function getFeaturedProjects(): Project[] {
  return filterFeaturedProjects(projectsContent.projects);
}

export function getProjectById(id: string): Project | undefined {
  return getVisibleProjects().find((project) => project.id === id);
}

export function getAiLab(): AiLabContent {
  return aiLabContent;
}
