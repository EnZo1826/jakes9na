import type { EvidenceType } from '../content/types';

const LABEL: Record<EvidenceType, string> = {
  project: 'Project',
  explored: 'Explored',
  portfolio: 'Portfolio build',
};

const TONE: Record<EvidenceType, string> = {
  project: 'border-teal/40 text-teal',
  explored: 'border-line text-text',
  portfolio: 'border-line text-text',
};

const DOT: Record<EvidenceType, string> = {
  project: 'bg-teal',
  explored: 'bg-text/60',
  portfolio: 'border border-text/70',
};

/**
 * Evidence tag — NOT a skill rating. There are exactly three possible
 * values, all defined in content/technologies.json; this component must
 * never grow a numeric scale, stars or a progress bar.
 */
export default function EvidenceTag({ evidence, title }: { evidence: EvidenceType; title?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${TONE[evidence]}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOT[evidence]}`} />
      {LABEL[evidence]}
    </span>
  );
}
