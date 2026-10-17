import { getProfile } from '../content/loader';

export default function SiteFooter() {
  const profile = getProfile();

  return (
    <footer className="relative border-t border-line px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-text-strong">{profile.closing_line}</p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-text">
            {profile.location} · {profile.timezone}
          </p>
        </div>
        <details className="group max-w-xl md:text-right">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 font-mono text-xs uppercase tracking-wider text-text hover:text-teal">
            Everyday toolkit
            <svg viewBox="0 0 12 12" aria-hidden="true" className="h-3 w-3 transition-transform group-open:rotate-180">
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </summary>
          <p className="mt-3 text-sm text-text">{profile.toolkit.note}</p>
          <ul className="mt-3 flex flex-wrap gap-2 md:justify-end">
            {profile.toolkit.items.map((item) => (
              <li key={item} className="chip">
                {item}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  );
}
