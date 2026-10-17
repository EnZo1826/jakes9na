/**
 * Decorative technical grid + scan line + soft teal bloom behind the hero.
 * Pure CSS, no canvas. The scan line is removed under reduced motion.
 */
export default function GridBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-grid mask-radial absolute inset-0 opacity-70" />
      <div className="absolute -right-40 top-10 h-[520px] w-[720px] rounded-full bg-teal/[0.06] blur-3xl" />
      <div className="absolute -left-40 bottom-0 h-[360px] w-[520px] rounded-full bg-crimson/[0.05] blur-3xl" />
      <div className="animate-scan-line absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
