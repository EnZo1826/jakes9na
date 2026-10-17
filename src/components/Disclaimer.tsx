interface DisclaimerProps {
  children: string;
  label?: string;
}

/** Visible disclaimer note — used for architecture_lab, ai and security notes. */
export default function Disclaimer({ children, label = 'Disclaimer' }: DisclaimerProps) {
  return (
    <p className="flex gap-3 rounded-md border border-crimson/35 bg-crimson/[0.06] px-4 py-3 text-sm leading-relaxed text-text">
      <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-crimson-text">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 4.8v3.8M8 10.8v.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-crimson-text">{label}: </span>
        {children}
      </span>
    </p>
  );
}
