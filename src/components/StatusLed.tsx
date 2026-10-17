export type LedTone = 'teal' | 'crimson' | 'neutral';

const TONE_CLASS: Record<LedTone, string> = {
  teal: 'bg-teal',
  crimson: 'bg-crimson',
  neutral: 'bg-text/50',
};

const HALO_CLASS: Record<LedTone, string> = {
  teal: 'bg-teal/50',
  crimson: 'bg-crimson/50',
  neutral: 'bg-text/20',
};

/** Small HMI-style status LED. Purely decorative; pair with visible text. */
export default function StatusLed({ tone, pulse = false }: { tone: LedTone; pulse?: boolean }) {
  return (
    <span aria-hidden="true" className="relative inline-flex h-2 w-2">
      {pulse ? <span className={`absolute inset-0 rounded-full ${HALO_CLASS[tone]} animate-node-pulse`} /> : null}
      <span className={`relative inline-block h-2 w-2 rounded-full ${TONE_CLASS[tone]}`} />
    </span>
  );
}
