#!/usr/bin/env tsx
/**
 * Validates content/projects.json against schema/project.schema.json with
 * ajv (draft 2020-12), then sanity-checks that every domain/technology id
 * referenced from a project actually exists in domains.json /
 * technologies.json. Also runs light structural checks on the other
 * content files. Exits non-zero on any violation — wired into
 * `npm run validate` and the CI gate.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function readJson<T>(relativePath: string): T {
  const fullPath = path.join(rootDir, relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf-8')) as T;
}

let failures = 0;

function fail(message: string) {
  failures += 1;
  console.error(`✖ ${message}`);
}

function ok(message: string) {
  console.log(`✓ ${message}`);
}

// --- 1. Schema validation of content/projects.json -------------------------

const schema = readJson<Record<string, unknown>>('schema/project.schema.json');
const projectsContent = readJson<{ version: number; projects: Array<Record<string, unknown>> }>(
  'content/projects.json',
);

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateProjects = ajv.compile(schema);

if (validateProjects(projectsContent)) {
  ok(`content/projects.json matches schema/project.schema.json (${projectsContent.projects.length} projects)`);
} else {
  fail('content/projects.json failed schema validation:');
  for (const error of validateProjects.errors ?? []) {
    console.error(`    ${error.instancePath || '/'} ${error.message}`);
  }
}

// --- 2. Cross-reference domain / technology ids -----------------------------

const domainsContent = readJson<{ domains: Array<{ id: string }> }>('content/domains.json');
const technologiesContent = readJson<{ technologies: Array<{ id: string }> }>('content/technologies.json');

const domainIds = new Set(domainsContent.domains.map((d) => d.id));
const technologyIds = new Set(technologiesContent.technologies.map((t) => t.id));

for (const project of projectsContent.projects) {
  const id = project.id as string;
  const domain = project.domain as string | undefined;
  const secondaryDomains = (project.secondary_domains as string[] | undefined) ?? [];
  const technologies = (project.technologies as string[] | undefined) ?? [];

  if (domain && !domainIds.has(domain)) {
    fail(`project "${id}" references unknown domain "${domain}"`);
  }
  for (const secondary of secondaryDomains) {
    if (!domainIds.has(secondary)) {
      fail(`project "${id}" references unknown secondary_domain "${secondary}"`);
    }
  }
  for (const techId of technologies) {
    if (!technologyIds.has(techId)) {
      fail(`project "${id}" references unknown technology "${techId}"`);
    }
  }
}

if (failures === 0) {
  ok('all domain/technology ids referenced from projects.json exist');
}

// --- 3. Restricted projects must never be featured --------------------------

for (const project of projectsContent.projects) {
  if (project.confidentiality_level === 'restricted' && project.featured !== false) {
    fail(`project "${project.id as string}" is restricted but not featured: false`);
  }
}

// --- 4. Light structural checks on the other content files ------------------

function requireFields(label: string, obj: Record<string, unknown>, fields: string[]) {
  for (const field of fields) {
    if (!(field in obj)) {
      fail(`${label} is missing required field "${field}"`);
    }
  }
}

const profile = readJson<Record<string, unknown>>('content/profile.json');
requireFields('content/profile.json', profile, [
  'version',
  'brand',
  'role_line',
  'core_message',
  'tagline',
  'intro',
  'about',
  'pipeline',
  'figures',
  'contact',
  'disclaimers',
  'seo',
]);

const figures = profile.figures as { items?: Array<Record<string, unknown>> } | undefined;
if (!figures?.items || figures.items.length === 0) {
  fail('content/profile.json figures.items must be non-empty');
} else {
  for (const figure of figures.items) {
    requireFields('a profile.json figures.items entry', figure, ['label', 'value', 'verified_by', 'verified_on']);
  }
}

const contact = profile.contact as { channels?: Array<Record<string, unknown>> } | undefined;
if (!contact?.channels || contact.channels.length !== 1) {
  fail('content/profile.json contact.channels must contain exactly one channel (LinkedIn only)');
} else if (contact.channels[0]?.id !== 'linkedin') {
  fail('content/profile.json contact.channels[0] must be the LinkedIn channel');
}

requireFields('content/domains.json', domainsContent as unknown as Record<string, unknown>, ['domains']);
for (const domain of domainsContent.domains) {
  requireFields(`a domains.json entry (${domain.id})`, domain as unknown as Record<string, unknown>, [
    'id',
    'title',
    'summary',
    'focus',
    'projects',
  ]);
}

requireFields('content/technologies.json', technologiesContent as unknown as Record<string, unknown>, [
  'categories',
  'technologies',
  'evidence_types',
]);

const allowedEvidence = new Set(['project', 'explored', 'portfolio']);
for (const tech of technologiesContent.technologies as Array<Record<string, unknown>>) {
  requireFields(`a technologies.json entry (${tech.id as string})`, tech, ['id', 'name', 'category', 'evidence']);
  if (!allowedEvidence.has(tech.evidence as string)) {
    fail(`technology "${tech.id as string}" has invalid evidence value "${tech.evidence as string}"`);
  }
}

const categoryIds = new Set(
  (technologiesContent as unknown as { categories: Array<{ id: string }> }).categories.map((c) => c.id),
);
for (const tech of technologiesContent.technologies as Array<Record<string, unknown>>) {
  if (!categoryIds.has(tech.category as string)) {
    fail(`technology "${tech.id as string}" references unknown category "${tech.category as string}"`);
  }
}

const aiLab = readJson<Record<string, unknown>>('content/ai-lab.json');
requireFields('content/ai-lab.json', aiLab, [
  'version',
  'title',
  'intro',
  'environments',
  'models',
  'workflows',
  'use_cases',
  'disclaimer',
]);

const aiModels = aiLab.models as { items?: Array<Record<string, unknown>> } | undefined;
const allowedRelations = new Set(['used', 'evaluated']);
for (const model of aiModels?.items ?? []) {
  if (!allowedRelations.has(model.relation as string)) {
    fail(`ai-lab.json model "${model.name as string}" has invalid relation "${model.relation as string}"`);
  }
}

// --- Result ------------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} content validation failure(s).`);
  process.exit(1);
} else {
  console.log('\nAll content validation checks passed.');
}
