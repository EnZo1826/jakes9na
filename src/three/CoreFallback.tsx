import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Static/CSS-animated stand-in for the WebGL core: orbital rings, nodes and
 * a lattice sphere. Shown under reduced motion, without WebGL, on
 * low-core devices and while the 3D chunk loads. Nodes orbit via SMIL, which is
 * not rendered under reduced motion.
 */
const TEAL = '#49D7B1';
const CRIMSON = '#DA3633';
const LINE = '#1F2A36';

export default function CoreFallback() {
  const reduced = useReducedMotion();
  const meridians = [0, 30, 60, 90, 120, 150];
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={TEAL} stopOpacity="0.35" />
          <stop offset="0.5" stopColor={TEAL} stopOpacity="0.06" />
          <stop offset="1" stopColor={TEAL} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#core-glow)" />
      {/* lattice sphere */}
      <g fill="none" stroke={TEAL} strokeOpacity="0.28">
        <circle cx="200" cy="200" r="86" />
        {meridians.map((deg) => (
          <ellipse key={deg} cx="200" cy="200" rx={Math.abs(Math.cos((deg * Math.PI) / 180)) * 86 + 0.5} ry="86" />
        ))}
        {[-60, -30, 0, 30, 60].map((y) => (
          <ellipse key={y} cx="200" cy={200 + y} rx={Math.sqrt(86 * 86 - y * y)} ry={Math.sqrt(86 * 86 - y * y) * 0.22} />
        ))}
      </g>
      <circle cx="200" cy="200" r="16" fill={TEAL} fillOpacity="0.9" />
      <circle cx="200" cy="200" r="28" fill="none" stroke={TEAL} strokeOpacity="0.5" className="animate-ping-ring" />
      {/* orbits */}
      {[
        { rx: 150, ry: 46, rot: -18, dur: 26, nodes: [0.1, 0.45, 0.8] },
        { rx: 172, ry: 64, rot: 24, dur: 34, nodes: [0.25, 0.6] },
        { rx: 122, ry: 122, rot: 0, dur: 48, nodes: [0.05, 0.38, 0.7] },
      ].map((orbit, i) => (
        <g key={i} transform={`rotate(${orbit.rot} 200 200)`}>
          <ellipse cx="200" cy="200" rx={orbit.rx} ry={orbit.ry} fill="none" stroke={LINE} strokeWidth="1.2" />
          <ellipse cx="200" cy="200" rx={orbit.rx} ry={orbit.ry} fill="none" stroke={TEAL} strokeOpacity="0.35" strokeDasharray="2 10" className="animate-trace-slow" />
          {orbit.nodes.map((t, j) => {
            const path = `M ${200 - orbit.rx} 200 a ${orbit.rx} ${orbit.ry} 0 1 0 ${orbit.rx * 2} 0 a ${orbit.rx} ${orbit.ry} 0 1 0 ${-orbit.rx * 2} 0`;
            const a = t * Math.PI * 2 + Math.PI;
            const x = 200 + Math.cos(a) * orbit.rx;
            const y = 200 - Math.sin(a) * orbit.ry;
            const accent = (i + j) % 3 === 0;
            const color = accent ? CRIMSON : TEAL;
            return (
              <g key={j} transform={reduced ? `translate(${x} ${y})` : undefined}>
                <circle r={accent ? 9 : 7} fill={color} opacity="0.15" />
                <circle r={accent ? 4 : 3} fill={color} />
                {!reduced ? (
                  <animateMotion dur={`${orbit.dur}s`} begin={`-${(t * orbit.dur).toFixed(2)}s`} repeatCount="indefinite" path={path} />
                ) : null}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
