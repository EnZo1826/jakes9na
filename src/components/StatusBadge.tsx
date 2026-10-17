import { formatProjectStatus } from '../content/filters';
import type { ProjectStatus } from '../content/types';
import StatusLed, { type LedTone } from './StatusLed';

const TONE_BY_STATUS: Record<ProjectStatus, LedTone> = {
  operational: 'teal',
  in_development: 'neutral',
  prototype: 'neutral',
  concept: 'neutral',
  requires_verification: 'crimson',
};

/**
 * Renders the exact project_status enum value (formatted, never
 * re-labelled into invented marketing words like "Live").
 */
export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-bg/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-text-strong backdrop-blur">
      <StatusLed tone={TONE_BY_STATUS[status]} pulse={status === 'operational'} />
      {formatProjectStatus(status)}
    </span>
  );
}
