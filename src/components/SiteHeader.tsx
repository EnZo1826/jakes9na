import { getProfile } from '../content/loader';

const NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: '#about', label: 'About' },
  { href: '#domains', label: 'Domains' },
  { href: '#ecosystem', label: 'Ecosystem' },
  { href: '#projects', label: 'Projects' },
  { href: '#architecture-lab', label: 'Architecture Lab' },
  { href: '#ai-lab', label: 'AI Lab' },
  { href: '#github-activity', label: 'GitHub' },
  { href: '#contact', label: 'Contact' },
];

export default function SiteHeader() {
  const profile = getProfile();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#command-center" className="font-mono text-sm uppercase tracking-[0.3em] text-text-strong">
          {profile.brand}
        </a>
        <nav aria-label="Section navigation" className="hidden gap-5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="font-mono text-xs uppercase tracking-wider text-text hover:text-teal">
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
