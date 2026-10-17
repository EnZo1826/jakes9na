import type { ReactElement } from 'react';

/**
 * Authored domain icon set: 24x24, 1.5 stroke, round joins, currentColor.
 * One glyph per engineering domain id in content/domains.json.
 */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ICONS: Record<string, ReactElement> = {
  // PLC module with I/O terminals
  'industrial-automation': (
    <g {...P}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 3v3M12 3v3M16 3v3M8 18v3M12 18v3M16 18v3" />
      <circle cx="8.5" cy="10" r="1" />
      <circle cx="8.5" cy="14" r="1" />
      <path d="M12 10h4M12 14h4" />
    </g>
  ),
  // edge chip with antenna
  'iot-edge': (
    <g {...P}>
      <rect x="6" y="9" width="12" height="12" rx="2" />
      <rect x="9.5" y="12.5" width="5" height="5" rx="1" />
      <path d="M12 9V5M9 3.5a4 4 0 0 1 6 0M7 1.8a7 7 0 0 1 10 0" />
    </g>
  ),
  // code window
  'full-stack': (
    <g {...P}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 8h18M9.5 12l-2.5 2 2.5 2M14.5 12l2.5 2-2.5 2" />
    </g>
  ),
  // agent graph
  'ai-agents': (
    <g {...P}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M6.5 6.5l3.3 3.3M17.5 6.5l-3.3 3.3M6.5 17.5l3.3-3.3M17.5 17.5l-3.3-3.3" />
    </g>
  ),
  // cloud with server rack
  'cloud-infrastructure': (
    <g {...P}>
      <path d="M7 15a4 4 0 0 1-.6-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 15" />
      <rect x="8" y="13" width="8" height="8" rx="1" />
      <path d="M10 16h4M10 18.5h4" />
    </g>
  ),
  // shield with camera lens
  'security-technology': (
    <g {...P}>
      <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6z" />
      <circle cx="12" cy="11.5" r="3" />
      <circle cx="12" cy="11.5" r="0.8" />
    </g>
  ),
  // map pin over route
  'gps-telematics': (
    <g {...P}>
      <path d="M12 13s5-4.2 5-8a5 5 0 0 0-10 0c0 3.8 5 8 5 8z" />
      <circle cx="12" cy="5" r="1.6" />
      <path d="M3 21c3-3 6 1 9-2s6 1 9-2" />
    </g>
  ),
  // live chart
  'realtime-visualization': (
    <g {...P}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M6 15l3-4 3 2 3-5 3 3" />
      <path d="M6 18h12" />
    </g>
  ),
  // ---- pipeline layer glyphs ----
  'layer-transport': (
    <g {...P}>
      <path d="M4 12h16M16 8l4 4-4 4M8 8l-4 4 4 4" />
      <circle cx="12" cy="12" r="1.2" />
    </g>
  ),
  'layer-data': (
    <g {...P}>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </g>
  ),
  'layer-operator': (
    <g {...P}>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </g>
  ),
  'layer-control': (
    <g {...P}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </g>
  ),
};

export default function DomainIcon({ id, className = 'h-5 w-5' }: { id: string; className?: string }) {
  const glyph = ICONS[id];
  if (!glyph) return null;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {glyph}
    </svg>
  );
}
