import { useId, useState, type CSSProperties } from 'react';
import { getDomains, getProfile, getProjectById } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import Disclaimer from '../components/Disclaimer';
import LiveRegion from '../components/LiveRegion';
import DomainIcon from '../illustrations/DomainIcon';
import { C } from '../illustrations/palette';
import { Packet } from '../illustrations/primitives';

const RADIUS = 38;

function position(index: number, count: number): { x: number; y: number } {
  const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
  return { x: 50 + Math.cos(angle) * RADIUS, y: 50 + Math.sin(angle) * RADIUS };
}

/**
 * Domains as an interactive circuit map. Each domain is a real <button>
 * (Tab + Enter/Space via native semantics); aria-pressed reflects the
 * selection and an aria-live region announces it. On large screens the
 * buttons sit on a radial board around the core; below lg they flow as a
 * grid and the board is hidden. The board itself is decorative.
 */
export default function Domains() {
  const domains = getDomains();
  const profile = getProfile();
  const [selectedId, setSelectedId] = useState<string>(domains[0]?.id ?? '');
  const liveRegionId = useId();

  const selectedIndex = Math.max(0, domains.findIndex((domain) => domain.id === selectedId));
  const selected = domains[selectedIndex] ?? null;

  return (
    <section id="domains" aria-labelledby="domains-heading" className="relative border-b border-line px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="domains-heading"
          title="Engineering domains"
          description="Select a domain to see its focus areas and the case studies that use it."
        />

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6" data-reveal>
            <div className="relative lg:aspect-square">
              {/* decorative board */}
              <LiveRegion className="absolute inset-0 hidden lg:block">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle cx={50} cy={50} r={RADIUS} fill="none" stroke={C.line} strokeWidth={0.3} />
                  <circle cx={50} cy={50} r={RADIUS - 12} fill="none" stroke={C.line} strokeWidth={0.25} strokeDasharray="0.6 1.4" />
                  <circle cx={50} cy={50} r={RADIUS + 8} fill="none" stroke={C.line} strokeWidth={0.2} strokeDasharray="0.4 2" className="animate-spin-slow" />
                  {domains.map((domain, index) => {
                    const { x, y } = position(index, domains.length);
                    const active = index === selectedIndex;
                    const d = `M50 50 L${x.toFixed(2)} ${y.toFixed(2)}`;
                    return (
                      <g key={domain.id}>
                        <path d={d} stroke={active ? C.teal : C.line} strokeWidth={active ? 0.45 : 0.3} strokeOpacity={active ? 0.9 : 1} />
                        {active ? (
                          <>
                            <path d={d} stroke={C.teal} strokeWidth={0.45} strokeDasharray="1 1.5" className="animate-trace" />
                            <Packet path={d} dur={1.6} r={0.7} reverse />
                            <Packet path={d} dur={1.6} begin={0.8} r={0.7} reverse />
                          </>
                        ) : null}
                      </g>
                    );
                  })}
                  <circle cx={50} cy={50} r={11} fill={C.panel} stroke={C.teal} strokeOpacity={0.7} strokeWidth={0.35} />
                  <circle cx={50} cy={50} r={13.5} fill="none" stroke={C.teal} strokeOpacity={0.25} strokeWidth={0.3} className="animate-ping-ring" />
                  <text x={50} y={49.2} textAnchor="middle" fill={C.strong} fontSize={2.6} fontFamily="JetBrains Mono, monospace" letterSpacing={0.3}>
                    {profile.brand.toUpperCase()}
                  </text>
                  <text x={50} y={53} textAnchor="middle" fill={C.teal} fontSize={1.9} fontFamily="JetBrains Mono, monospace" letterSpacing={0.3}>
                    {selected ? selected.short : ''}
                  </text>
                </svg>
              </LiveRegion>

              <div role="group" aria-label="Filter by domain" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:block">
                {domains.map((domain, index) => {
                  const isSelected = index === selectedIndex;
                  const { x, y } = position(index, domains.length);
                  const style = { '--x': `${x}%`, '--y': `${y}%` } as CSSProperties;
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedId(domain.id)}
                      style={style}
                      className={`group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-300 lg:absolute lg:left-[var(--x)] lg:top-[var(--y)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:flex-col lg:gap-1.5 lg:px-3 lg:py-3 lg:text-center ${
                        isSelected
                          ? 'border-teal bg-panel text-text-strong shadow-[0_10px_30px_-12px_rgba(73,215,177,0.45)]'
                          : 'border-line bg-panel/90 text-text hover:border-teal/60 hover:text-text-strong'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected ? 'border-teal/60 bg-teal/10 text-teal' : 'border-line bg-bg text-text group-hover:text-teal'
                        }`}
                      >
                        <DomainIcon id={domain.id} />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em]">{domain.short}</span>
                        <span className="text-[13px] leading-tight text-text-strong lg:sr-only">{domain.title}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <p aria-live="polite" id={liveRegionId} className="sr-only">
            {selected ? `${selected.title} selected.` : 'No domain selected.'}
          </p>

          <div className="lg:col-span-6">
            {selected ? (
              <Panel ticks className="p-6 sm:p-8">
                <div key={selected.id} className="animate-panel-in">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-teal/50 bg-teal/10 text-teal">
                      <DomainIcon id={selected.id} className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="label text-teal">{selected.short}</p>
                      <h3 className="text-2xl font-semibold tracking-tight text-text-strong">{selected.title}</h3>
                    </div>
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-text">{selected.summary}</p>
                  <ul className="mt-6 space-y-2.5">
                    {selected.focus.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-text-strong">
                        <svg viewBox="0 0 12 12" aria-hidden="true" className="mt-1 h-3 w-3 shrink-0 text-teal">
                          <path d="M2 6h6M6 3l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  {selected.projects.length > 0 ? (
                    <div className="mt-6 border-t border-line pt-5">
                      <p className="label">Related projects</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {selected.projects.map((id) => {
                          const project = getProjectById(id);
                          return (
                            <li key={id}>
                              <a
                                href={`#project-${id}`}
                                className="inline-flex items-center gap-2 rounded-md border border-line bg-bg/60 px-3 py-1.5 text-sm text-text-strong transition-colors hover:border-teal/60"
                              >
                                {project?.code ? <span className="font-mono text-[10px] text-teal">{project.code}</span> : null}
                                {project?.title ?? id}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                  {selected.id === 'security-technology' ? (
                    <div className="mt-5">
                      <Disclaimer>{profile.disclaimers.security}</Disclaimer>
                    </div>
                  ) : null}
                </div>
              </Panel>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
