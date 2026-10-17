/**
 * Typed shapes for everything under /content. These mirror the JSON files
 * (and schema/project.schema.json) exactly — no field here should imply
 * more than the source JSON actually states. Components must only read
 * content through src/content/loader.ts, never import JSON directly.
 */

export interface PipelineNode {
  id: string;
  label: string;
  layer: string;
}

export interface FigureItem {
  label: string;
  value: string;
  verified_by: string;
  verified_on: string;
}

export interface ContactChannel {
  id: string;
  label: string;
  url: string;
}

export interface Profile {
  version: number;
  brand: string;
  github: { username: string; url: string };
  location: string;
  timezone: string;
  role_line: string;
  core_message: string;
  tagline: string;
  closing_line: string;
  intro: string[];
  about: {
    approach: string[];
    characteristics: string[];
    contribution_note: string;
  };
  pipeline: {
    title: string;
    description: string;
    nodes: PipelineNode[];
  };
  figures: {
    note: string;
    items: FigureItem[];
  };
  toolkit: {
    note: string;
    items: string[];
  };
  contact: {
    channels: ContactChannel[];
    availability: string;
    topics: string[];
  };
  disclaimers: {
    security: string;
    ai: string;
    architecture_lab: string;
  };
  seo: {
    title: string;
    description: string;
  };
}

export interface Domain {
  id: string;
  title: string;
  short: string;
  summary: string;
  focus: string[];
  projects: string[];
}

export interface DomainsContent {
  version: number;
  domains: Domain[];
}

export type EvidenceType = 'project' | 'explored' | 'portfolio';

export interface TechnologyCategory {
  id: string;
  label: string;
  description: string;
}

export interface Technology {
  id: string;
  name: string;
  category: string;
  role: string;
  projects: string[];
  evidence: EvidenceType;
}

export interface TechnologiesContent {
  version: number;
  evidence_types: Record<EvidenceType, string>;
  familiarity_note: string;
  categories: TechnologyCategory[];
  technologies: Technology[];
}

export type ProjectStatus =
  | 'operational'
  | 'in_development'
  | 'prototype'
  | 'concept'
  | 'requires_verification';

export type ConfidentialityLevel = 'public' | 'anonymised' | 'restricted';

export interface ArchitectureNode {
  id: string;
  label: string;
  layer: string;
  detail?: string;
}

export interface ProjectScreenshot {
  src: string;
  alt: string;
  anonymised: true;
}

export interface Project {
  id: string;
  code?: string;
  title: string;
  summary: string;
  domain: string;
  secondary_domains?: string[];
  technologies: string[];
  contribution?: string;
  challenge: string;
  approach: string[];
  capabilities?: string[];
  scope_areas_requiring_verification?: string[];
  architecture: ArchitectureNode[];
  project_status: ProjectStatus;
  status_source?: string;
  verified_outcomes: string[];
  screenshots: ProjectScreenshot[];
  repository_url: string | null;
  demo_url: string | null;
  confidentiality_level: ConfidentialityLevel;
  featured: boolean;
}

export interface ProjectsContent {
  version: number;
  projects: Project[];
}

export type ModelRelation = 'used' | 'evaluated';

export interface AiLabEnvironment {
  name: string;
  use: string;
  technology_id: string;
}

export interface AiLabModel {
  name: string;
  relation: ModelRelation;
}

export interface AiLabWorkflow {
  id: string;
  title: string;
  maturity: string;
  description: string;
  guardrails?: string[];
}

export interface AiLabContent {
  version: number;
  title: string;
  intro: string;
  project_id: string;
  environments: AiLabEnvironment[];
  models: {
    note: string;
    items: AiLabModel[];
  };
  workflows: AiLabWorkflow[];
  use_cases: string[];
  disclaimer: string;
}

export interface GithubActivityData {
  generated_at: string;
  [key: string]: unknown;
}
