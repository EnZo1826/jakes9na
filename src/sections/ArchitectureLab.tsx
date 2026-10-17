import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { getProfile, getVisibleProjects } from '../content/loader';
import type { ArchitectureNode, PipelineNode } from '../content/types';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import Disclaimer from '../components/Disclaimer';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import { useScrollReveal } from '../hooks/useScrollReveal';

type Node = ArchitectureNode | PipelineNode;

function hasDetail(node: Node): node is ArchitectureNode {
  return 'detail' in node;
}

/**
 * Clickable SVG-style pipeline. Every node is a real <button> — reachable
 * by Tab in document order (no custom roving tabindex needed) and
 * activated with Enter or Space via native button semantics. Activating a
 * node reveals its role/detail text below the diagram. The
 * architecture_lab disclaimer from profile.json is always visible here.
 *
 * The detail panel's content is a textual duplicate of what aria-pressed
 * already communicates, so the GSAP crossfade below is decoration on top
 * of a state change that is fully readable with JavaScript/motion off —
 * never the only way to perceive which node is active.
 */
export default function ArchitectureLab() {
  const profile = getProfile();
  const projects = getVisibleProjects();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const revealRef = useScrollReveal<HTMLDivElement>();
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedProject = projects.find((project) => project.id === projectId) ?? null;
  const nodes: Node[] = selectedProject ? selectedProject.architecture : profile.pipeline.nodes;
  const activeNode = nodes.find((node) => node.id === activeNodeId) ?? null;

  useEffect(() => {
    const el = panelRef.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', overwrite: true });
  }, [activeNodeId, projectId]);

  function selectDiagram(nextProjectId: string | null) {
    setProjectId(nextProjectId);
    setActiveNodeId(null);
  }

  return (
    <section id="architecture-lab" aria-labelledby="architecture-lab-heading" className="border-b border-line px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          id="architecture-lab-heading"
          eyebrow="Architecture Lab"
          title="Edge-to-cloud pipeline explorer"
          description={profile.pipeline.description}
        />

        <Disclaimer label="Educational model">{profile.disclaimers.architecture_lab}</Disclaimer>

        <div ref={revealRef}>
        <div role="group" aria-label="Choose a diagram" className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={projectId === null}
            onClick={() => selectDiagram(null)}
            className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wider ${
              projectId === null
                ? 'border-teal bg-teal/10 text-text-strong'
                : 'border-line bg-panel text-text hover:text-text-strong'
            }`}
          >
            Generic pipeline
          </button>
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              aria-pressed={projectId === project.id}
              onClick={() => selectDiagram(project.id)}
              className={`border px-3 py-1.5 font-mono text-xs uppercase tracking-wider ${
                projectId === project.id
                  ? 'border-teal bg-teal/10 text-text-strong'
                  : 'border-line bg-panel text-text hover:text-text-strong'
              }`}
            >
              {project.title}
            </button>
          ))}
        </div>

        <div
          role="list"
          aria-label={selectedProject ? `${selectedProject.title} architecture nodes` : 'Edge-to-cloud pipeline nodes'}
          className="mt-8 flex flex-wrap items-center gap-2"
        >
          {nodes.map((node, index) => (
            <div key={node.id} role="listitem" className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={activeNodeId === node.id}
                onClick={() => setActiveNodeId(node.id)}
                className={`border px-4 py-3 text-left font-mono text-xs uppercase tracking-wider ${
                  activeNodeId === node.id
                    ? 'border-teal bg-teal/10 text-text-strong'
                    : 'border-line bg-panel text-text hover:border-teal/60 hover:text-text-strong'
                }`}
              >
                <span className="block text-[10px] text-teal">{node.layer}</span>
                {node.label}
              </button>
              {index < nodes.length - 1 ? (
                <span aria-hidden="true" className="text-line">
                  &rarr;
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div ref={panelRef} className="mt-8">
          {activeNode ? (
            <Panel className="p-5">
              <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">{activeNode.label}</h3>
              <p className="mt-2 text-text">
                {hasDetail(activeNode) && activeNode.detail
                  ? activeNode.detail
                  : `Layer: ${activeNode.layer}.`}
              </p>
            </Panel>
          ) : (
            <p className="text-sm text-text">Select a node above to see its role in this pipeline.</p>
          )}
        </div>
        </div>
      </div>
    </section>
  );
}
