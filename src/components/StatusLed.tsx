export type LedTone = 'teal' | 'crimson' | 'neutral';

const TONE_CLASS: Record<LedTone, string> = {
  teal: 'bg-teal shadow-[0_0_6px_rgba(73,215,177,0.8)]',
  crimson: 'bg-crimson shadow-[0_0_6px_rgba(218,54,51,0.8)]',
  neutral: 'bg-text/50',
};

/** Small HMI-style status LED. Purely decorative; pair with visible text. */
export default function StatusLed({ tone }: { tone: LedTone }) {
  return <span aria-hidden="true" className={`inline-block h-2 w-2 rounded-full ${TONE_CLASS[tone]}`} />;
}
