import type { ReactNode } from 'react';

interface SectionHeadingProps {
  id: string;
  title: string;
  description?: string;
  aside?: ReactNode;
}

/**
 * Section header: large heading, optional lead, and a signal-trace rule
 * that draws in on reveal. Optional `aside` sits on the right on wide
 * screens (legend, counts, controls).
 */
export default function SectionHeading({ id, title, description, aside }: SectionHeadingProps) {
  return (
    <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl" data-reveal>
        <div aria-hidden="true" className="mb-6 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 rounded-full bg-teal/40 animate-node-pulse" />
            <span className="relative m-auto h-1.5 w-1.5 rounded-full bg-teal" />
          </span>
          <span className="h-px w-24 bg-gradient-to-r from-teal/70 to-transparent" />
        </div>
        <h2 id={id} className="text-3xl font-semibold tracking-tight text-text-strong sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {title}
        </h2>
        {description ? <p className="mt-4 text-base leading-relaxed text-text sm:text-lg">{description}</p> : null}
      </div>
      {aside ? (
        <div className="shrink-0" data-reveal>
          {aside}
        </div>
      ) : null}
    </div>
  );
}
