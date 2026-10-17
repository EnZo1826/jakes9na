import { describe, expect, it } from 'vitest';
import { filterFeaturedProjects, filterVisibleProjects, formatProjectStatus } from './filters';
import { getVisibleProjects, getFeaturedProjects } from './loader';
import type { Project } from './types';

function makeProject(overrides: Partial<Project>): Project {
  return {
    id: 'fixture-project',
    title: 'Fixture project',
    summary: 'Fixture summary.',
    domain: 'industrial-automation',
    technologies: ['raspberry-pi'],
    challenge: 'Fixture challenge.',
    approach: ['Fixture approach.'],
    architecture: [
      { id: 'a', label: 'A', layer: 'field' },
      { id: 'b', label: 'B', layer: 'app' },
    ],
    project_status: 'operational',
    verified_outcomes: [],
    screenshots: [],
    repository_url: null,
    demo_url: null,
    confidentiality_level: 'anonymised',
    featured: true,
    ...overrides,
  };
}

describe('filterVisibleProjects', () => {
  it('never includes a restricted project, regardless of any other field', () => {
    const projects = [
      makeProject({ id: 'public-one', confidentiality_level: 'public' }),
      makeProject({ id: 'secret-one', confidentiality_level: 'restricted', featured: true }),
      makeProject({
        id: 'secret-two',
        confidentiality_level: 'restricted',
        featured: false,
        project_status: 'operational',
      }),
    ];

    const visible = filterVisibleProjects(projects);

    expect(visible.map((p) => p.id)).toEqual(['public-one']);
    expect(visible.some((p) => p.confidentiality_level === 'restricted')).toBe(false);
  });
});

describe('filterFeaturedProjects', () => {
  it('excludes restricted projects even if marked featured', () => {
    const projects = [makeProject({ id: 'restricted-featured', confidentiality_level: 'restricted', featured: true })];
    expect(filterFeaturedProjects(projects)).toHaveLength(0);
  });

  it('excludes requires_verification projects from the featured context defensively', () => {
    const projects = [
      makeProject({
        id: 'unverified',
        project_status: 'requires_verification',
        featured: true, // even if data were malformed and set this true
      }),
    ];
    expect(filterFeaturedProjects(projects)).toHaveLength(0);
  });

  it('includes a normal operational, featured, non-restricted project', () => {
    const projects = [makeProject({ id: 'ok' })];
    expect(filterFeaturedProjects(projects).map((p) => p.id)).toEqual(['ok']);
  });
});

describe('formatProjectStatus', () => {
  it('formats the exact enum value without inventing new wording', () => {
    expect(formatProjectStatus('operational')).toBe('Operational');
    expect(formatProjectStatus('in_development')).toBe('In Development');
    expect(formatProjectStatus('requires_verification')).toBe('Requires Verification');
  });
});

describe('real content/projects.json', () => {
  it('contains no restricted projects in the visible set', () => {
    expect(getVisibleProjects().every((p) => p.confidentiality_level !== 'restricted')).toBe(true);
  });

  it('contains no requires_verification projects in the featured set', () => {
    expect(getFeaturedProjects().every((p) => p.project_status !== 'requires_verification')).toBe(true);
  });
});
