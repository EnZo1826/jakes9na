import { getProfile } from '../content/loader';

export default function SiteFooter() {
  const profile = getProfile();

  return (
    <footer className="border-t border-line px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-text">{profile.closing_line}</p>
        <details className="mt-4">
          <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-text hover:text-teal">
            Everyday toolkit
          </summary>
          <p className="mt-2 text-sm text-text">{profile.toolkit.note}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {profile.toolkit.items.map((item) => (
              <li key={item} className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase text-text">
                {item}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  );
}
