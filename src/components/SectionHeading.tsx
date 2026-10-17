interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
}

/** Consistent HMI-style section header: mono eyebrow label + heading. */
export default function SectionHeading({ id, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-teal">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-2xl font-semibold text-text-strong sm:text-3xl">
        {title}
      </h2>
      {description ? <p className="mt-3 text-text">{description}</p> : null}
    </div>
  );
}
