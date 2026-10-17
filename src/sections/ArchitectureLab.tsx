import { useState, type CSSProperties } from 'react';
import { getProfile, getVisibleProjects } from '../content/loader';
import type { ArchitectureNode, PipelineNode } from '../content/types';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import Disclaimer from '../components/Disclaimer';
import DomainIcon from '../illustrations/DomainIcon';
import { layerIconId } from '../illustrations/layers';

type Node = ArchitectureNode | PipelineNode;

function hasDetail(node: Node): node is ArchitectureNode {
  return 'detail' in node;
}

/**
 * Interactive pipeline. Every node is a real <button> — reachable by Tab in
 * document order and activated with Enter or Space via native button
 * semantics. Activating a node reveals its role/detail text below the
 * diagram; aria-pressed carries the same state, so the animated signal
 * trace and panel transition are decoration on top of a state change that
 * is fully readable with motion off. The architecture_lab disclaimer from
 * profile.json is always visible here.
 */
export default function ArchitectureLab() {
  const profile = getProfile();
  const projects = getVisibleProjects();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const selectedProject = projects.find((project) => project.id === projectId) ?? null;
  const nodes: Node[] = selectedProject ? selectedProject.architecture : profile.pipeline.nodes;
  const activeIndex = nodes.findIndex((node) => node.id === activeNodeId);
  const activeNode = activeIndex >= 0 ? nodes[activeIndex] : null;

  function selectDiagram(nextProjectId: string | null) {
    setProjectId(nextProjectId);
    setActiveNodeId(null);
  }

  const gridStyle = { '--cols': String(nodes.length) } as CSSProperties;

  return (
    <section id="architecture-lab" aria-labelledby="architecture-lab-heading" className="relative border-b border-line px-6 py-24 lg:py-32">
      <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-25 mask-fade-b" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          id="architecture-lab-heading"
          title="Edge-to-cloud pipeline explorer"
          description={profile.pipeline.description}
        />

        <div data-reveal>
          <Disclaimer label="Educational model">{profile.disclaimers.architecture_lab}</Disclaimer>
        </div>

        <div data-reveal>
          <div role="group" aria-label="Choose a diagram" className="mt-10 flex flex-wrap gap-2">
            <button type="button" aria-pressed={projectId === null} onClick={() => selectDiagram(null)} className="toggle">
              Generic pipeline
            </button>
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                aria-pressed={projectId === project.id}
                onClick={() => selectDiagram(project.id)}
                className="toggle"
              >
                {project.code ? <span className="mr-1.5 text-teal">{project.code}</span> : null}
                {project.title}
              </button>
            ))}
          </div>

          <Panel ticks className="mt-8 overflow-hidden p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="label">
                {selectedProject ? selectedProject.title : profile.pipeline.title}
                <span className="ml-3 text-teal">{nodes.length} nodes</span>
              </p>
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-teal animate-node-pulse" />
                Signal flow →
              </p>
            </div>

            <div
              key={projectId ?? 'generic'}
              role="list"
              aria-label={selectedProject ? `${selectedProject.title} architecture nodes` : 'Edge-to-cloud pipeline nodes'}
              style={gridStyle}
              className="relative grid gap-3 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))] lg:gap-6"
            >
              {/* signal track: vertical below lg, horizontal on lg */}
              <div aria-hidden="true" className="pointer-events-none absolute bottom-6 left-[27px] top-6 w-px overflow-hidden bg-teal/25 lg:bottom-auto lg:left-8 lg:right-8 lg:top-[38px] lg:h-px lg:w-auto">
                <div className="signal-runner absolute inset-0" />
              </div>

              {nodes.map((node, index) => {
                const pressed = activeNodeId === node.id;
                const passed = activeIndex >= 0 && index <= activeIndex;
                return (
                  <div key={node.id} role="listitem" className="animate-panel-in relative" style={{ animationDelay: `${index * 60}ms` }}>
                    <button
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => setActiveNodeId(node.id)}
                      className={`group relative flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-300 lg:flex-col lg:items-center lg:gap-3 lg:p-4 lg:text-center ${
                        pressed
                          ? 'border-teal bg-panel shadow-[0_12px_32px_-14px_rgba(73,215,177,0.5)]'
                          : passed
                            ? 'border-teal/40 bg-panel'
                            : 'border-line bg-bg/70 hover:border-teal/50'
                      }`}
                    >
                      <span
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors lg:h-11 lg:w-11 ${
                          pressed || passed ? 'border-teal/60 bg-teal/10 text-teal' : 'border-line bg-panel text-text group-hover:text-teal'
                        }`}
                      >
                        <DomainIcon id={layerIconId(node.layer)} className="h-4 w-4 lg:h-5 lg:w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-teal">{node.layer}</span>
                        <span className="mt-0.5 block text-sm font-medium leading-snug text-text-strong">{node.label}</span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 min-h-[96px] border-t border-line pt-6">
              {activeNode ? (
                <div key={activeNode.id} className="animate-panel-in flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-teal/50 bg-teal/10 text-teal">
                    <DomainIcon id={layerIconId(activeNode.layer)} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-teal">
                      {activeNode.label}
                      <span className="ml-3 text-text">
                        {activeIndex + 1}/{nodes.length}
                      </span>
                    </h3>
                    <p className="mt-2 max-w-3xl leading-relaxed text-text-strong">
                      {hasDetail(activeNode) && activeNode.detail ? activeNode.detail : `Layer: ${activeNode.layer}.`}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text">Select a node above to see its role in this pipeline.</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  );
}
