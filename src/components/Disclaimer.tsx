interface DisclaimerProps {
  children: string;
  label?: string;
}

/** Visible disclaimer banner — used for architecture_lab, ai and security notes. */
export default function Disclaimer({ children, label = 'Disclaimer' }: DisclaimerProps) {
  return (
    <p className="border-l-2 border-crimson bg-bg px-4 py-3 text-sm text-text">
      <span className="font-mono text-xs uppercase tracking-wider text-crimson-text">{label}: </span>
      {children}
    </p>
  );
}
