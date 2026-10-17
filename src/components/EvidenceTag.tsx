import type { EvidenceType } from '../content/types';

const LABEL: Record<EvidenceType, string> = {
  project: 'Project',
  explored: 'Explored',
  portfolio: 'Portfolio build',
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
      className="inline-block border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text"
    >
      {LABEL[evidence]}
    </span>
  );
}
