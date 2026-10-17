import { useReducedMotion } from '../hooks/useReducedMotion';

import { C } from './palette';

/** Shared SVG primitives for the schematic illustration set. */

interface PacketProps {
  /** SVG path data the packet travels along. */
  path: string;
  dur?: number;
  begin?: number;
  r?: number;
  color?: string;
  /** Reverse direction along the path. */
  reverse?: boolean;
}

/**
 * A data packet moving along a trace. Rendered only when motion is
 * allowed — under reduced motion the trace itself (static) carries the
 * meaning, so nothing is lost.
 */
export function Packet({ path, dur = 2.4, begin = 0, r = 2.6, color = C.teal, reverse = false }: PacketProps) {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <g>
      <circle r={r * 2.4} fill={color} opacity={0.14}>
        <animateMotion
          dur={`${dur}s`}
          begin={`${begin}s`}
          repeatCount="indefinite"
          path={path}
          keyPoints={reverse ? '1;0' : '0;1'}
          keyTimes="0;1"
          calcMode="linear"
        />
      </circle>
      <circle r={r} fill={color}>
        <animateMotion
          dur={`${dur}s`}
          begin={`${begin}s`}
          repeatCount="indefinite"
          path={path}
          keyPoints={reverse ? '1;0' : '0;1'}
          keyTimes="0;1"
          calcMode="linear"
        />
      </circle>
    </g>
  );
}

/** A circuit trace: dim base line plus an animated dashed flow overlay. */
export function Trace({
  d,
  color = C.teal,
  flow = true,
  width = 1.25,
  slow = false,
}: {
  d: string;
  color?: string;
  flow?: boolean;
  width?: number;
  slow?: boolean;
}) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={C.line} strokeWidth={width + 1.5} />
      <path d={d} stroke={color} strokeOpacity={0.35} strokeWidth={width} />
      {flow ? (
        <path
          d={d}
          stroke={color}
          strokeWidth={width}
          className={slow ? 'animate-trace-slow' : 'animate-trace'}
          strokeDasharray={slow ? '2 8' : '4 6'}
        />
      ) : null}
    </g>
  );
}

/** Status LED with an optional ping ring. */
export function Led({
  x,
  y,
  color = C.teal,
  ping = false,
  blink = false,
  r = 2.5,
}: {
  x: number;
  y: number;
  color?: string;
  ping?: boolean;
  blink?: boolean;
  r?: number;
}) {
  return (
    <g>
      {ping ? <circle cx={x} cy={y} r={r * 1.6} fill="none" stroke={color} className="animate-ping-ring" /> : null}
      <circle cx={x} cy={y} r={r * 2.2} fill={color} opacity={0.15} />
      <circle cx={x} cy={y} r={r} fill={color} className={blink ? 'animate-led' : undefined} />
    </g>
  );
}

/** Subtle dot grid fill, used as the ground of illustration panels. */
export function DotGrid({ id, gap = 12, opacity = 0.5 }: { id: string; gap?: number; opacity?: number }) {
  return (
    <>
      <defs>
        <pattern id={id} width={gap} height={gap} patternUnits="userSpaceOnUse">
          <circle cx={1} cy={1} r={0.8} fill={C.line} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={opacity} />
    </>
  );
}
