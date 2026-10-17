/**
 * Decorative technical-grid + scan-line motif. Pure CSS/SVG, no canvas or
 * WebGL — this is part of the finished static hero, not a placeholder for
 * the future 3D core. Respects prefers-reduced-motion via the
 * .animate-scan-line rule in index.css (animation is removed entirely).
 */
export default function GridBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-60" />
      <div className="animate-scan-line absolute inset-x-0 top-0 h-px bg-teal/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />
    </div>
  );
}
