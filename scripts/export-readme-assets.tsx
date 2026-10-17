#!/usr/bin/env tsx
/**
 * Exports the animated SVG set for the GitHub profile README
 * (github.com/EnZo1826/EnZo1826) from this site's content and
 * illustration components, so the profile and the site share one source
 * of truth for copy, palette and drawings.
 *
 *   npx tsx scripts/export-readme-assets.tsx --out ../EnZo1826
 *
 * Writes <out>/assets/*.svg and <out>/assets/cards/*.svg in dark and
 * light variants. Every file:
 *  - is self-contained (no external fonts, images or scripts — GitHub
 *    serves README images through its camo proxy inside <img>);
 *  - animates with CSS keyframes and SMIL only;
 *  - disables CSS animation under prefers-reduced-motion and has a
 *    complete static first frame: only looping motion (traces, packets,
 *    LEDs, typing), never entrance fades — README images can be shown
 *    as a still (mobile app, link previews), so nothing starts hidden.
 *    The `fade-up` class names are inert hooks kept for the site.
 * Light variants are produced by mapping the dark token hexes onto the
 * light tokens from tokens.json.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  getAiLab,
  getDomains,
  getFeaturedProjects,
  getProfile,
  getTechnologies,
  getTechnologyCategories,
} from '../src/content/loader';
import { formatProjectStatus } from '../src/content/filters';
import type { EvidenceType } from '../src/content/types';
import { C } from '../src/illustrations/palette';
import { DomainGlyph } from '../src/illustrations/DomainIcon';
import ProjectIllustration from '../src/illustrations/ProjectIllustrations';
import CoreFallback from '../src/three/CoreFallback';

/* ------------------------------------------------------------------ */
/* setup                                                               */
/* ------------------------------------------------------------------ */

const argOut = process.argv.indexOf('--out');
const OUT = path.resolve(argOut > -1 ? process.argv[argOut + 1]! : '../EnZo1826');
const ASSETS = path.join(OUT, 'assets');
mkdirSync(path.join(ASSETS, 'cards'), { recursive: true });

const MONO = "ui-monospace, 'JetBrains Mono', SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Dark token -> light token (tokens.json). Crimson is shared. */
const LIGHT_MAP: Record<string, string> = {
  [C.bg]: '#FFFFFF',
  [C.panel]: '#F6F8FA',
  [C.line]: '#D9E0E7',
  [C.lineHi]: '#C3CCD5',
  [C.text]: '#4B5768',
  [C.strong]: '#0B0F14',
  [C.teal]: '#107A62',
  '#020304': '#0B0F14',
};

const KEYFRAMES = `
@keyframes trace-flow { to { stroke-dashoffset: -40; } }
@keyframes node-pulse { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
@keyframes led-blink { 0%,70%,100% { opacity: 1; } 80% { opacity: .25; } }
@keyframes ring-ping { 0% { transform: scale(.6); opacity: .8; } 100% { transform: scale(2.6); opacity: 0; } }
@keyframes bar-rise { 0%,100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
@keyframes spin-slow { to { transform: rotate(360deg); } }
@keyframes float-y { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes scan-x { 0% { transform: translateX(-120px); opacity: 0; } 10%,90% { opacity: 1; } 100% { transform: translateX(1320px); opacity: 0; } }
@keyframes caret { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
.animate-trace { stroke-dasharray: 4 6; animation: trace-flow 1.6s linear infinite; }
.animate-trace-slow { stroke-dasharray: 2 8; animation: trace-flow 3.2s linear infinite; }
.animate-node-pulse { animation: node-pulse 2.4s ease-in-out infinite; }
.animate-led { animation: led-blink 2.4s steps(1, end) infinite; }
.animate-ping-ring { transform-box: fill-box; transform-origin: center; animation: ring-ping 2.4s cubic-bezier(.16,1,.3,1) infinite; }
.animate-bar { transform-box: fill-box; transform-origin: bottom; animation: bar-rise 2.4s cubic-bezier(.45,0,.55,1) infinite; }
.animate-spin-slow { transform-box: fill-box; transform-origin: center; animation: spin-slow 30s linear infinite; }
.animate-float { animation: float-y 6s ease-in-out infinite; }
.scan { animation: scan-x 7s linear infinite; }
.caret { animation: caret 1s steps(1, end) infinite; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; }
  .animate-ping-ring, .scan { opacity: 0; }
}`;

function svgDoc(width: number, height: number, label: string, body: ReactNode): string {
  // Rendered with an <svg> root so React keeps SVG namespace casing
  // (clipPath, linearGradient, animateMotion, ...).
  const markup = renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      {body}
    </svg>,
  );
  return `${markup}\n`;
}

function toLight(svg: string): string {
  return svg.replace(/#[0-9A-Fa-f]{6}\b/g, (hex) => LIGHT_MAP[hex.toUpperCase()] ?? hex);
}

/**
 * Nested illustration <svg>s carry role="presentation" and classes meant
 * for the site; strip those so the README image has one accessible name.
 */
function writePair(name: string, svg: string) {
  const clean = svg.replace(/ role="presentation"/g, '').replace(/ class="h-auto w-full"/g, '');
  const dark = clean;
  writeFileSync(path.join(ASSETS, `${name}-dark.svg`), dark);
  writeFileSync(path.join(ASSETS, `${name}-light.svg`), toLight(dark));
  console.log(`  ${name}  ${(dark.length / 1024).toFixed(1)} KB`);
}

/** Greedy word wrap using an average glyph width (em fraction). */
function wrap(text: string, fontSize: number, maxWidth: number, em = 0.56): string[] {
  const maxChars = Math.floor(maxWidth / (fontSize * em));
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (!line) line = word;
    else if ((line + ' ' + word).length <= maxChars) line += ' ' + word;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ------------------------------------------------------------------ */
/* shared drawing                                                      */
/* ------------------------------------------------------------------ */

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={`${id}-grid`} width={40} height={40} patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke={C.line} strokeWidth={1} />
      </pattern>
      <pattern id={`${id}-dots`} width={14} height={14} patternUnits="userSpaceOnUse">
        <circle cx={1} cy={1} r={0.9} fill={C.line} />
      </pattern>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor={C.teal} stopOpacity={0.18} />
        <stop offset="1" stopColor={C.teal} stopOpacity={0} />
      </radialGradient>
      <linearGradient id={`${id}-fade`} x1="0" x2="1">
        <stop offset="0" stopColor={C.teal} stopOpacity={0} />
        <stop offset="0.5" stopColor={C.teal} stopOpacity={0.9} />
        <stop offset="1" stopColor={C.teal} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function Panel({ x, y, w, h, accent = false, ticks = false }: { x: number; y: number; w: number; h: number; accent?: boolean; ticks?: boolean }) {
  return (
    <g>
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={h - 1} rx={10} fill={C.panel} stroke={accent ? C.teal : C.line} strokeOpacity={accent ? 0.6 : 1} />
      {ticks ? (
        <g fill="none" stroke={C.teal} strokeOpacity={0.7}>
          <path d={`M${x} ${y + 16} V${y + 10} a10 10 0 0 1 10 -10 H${x + 16}`} />
          <path d={`M${x + w} ${y + h - 16} V${y + h - 10} a10 10 0 0 1 -10 10 H${x + w - 16}`} />
        </g>
      ) : null}
    </g>
  );
}

function T({
  x,
  y,
  children,
  size = 12,
  color = C.text,
  mono = true,
  weight = 400,
  anchor = 'start',
  spacing,
  className,
  style,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  color?: string;
  mono?: boolean;
  weight?: number;
  anchor?: 'start' | 'middle' | 'end';
  spacing?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <text
      x={x}
      y={y}
      fontFamily={mono ? MONO : SANS}
      fontSize={size}
      fill={color}
      fontWeight={weight}
      textAnchor={anchor}
      letterSpacing={spacing ?? (mono ? 1.2 : 0)}
      className={className}
      style={style}
    >
      {children}
    </text>
  );
}

function Led({ x, y, color = C.teal, ping = false, blink = false, r = 4 }: { x: number; y: number; color?: string; ping?: boolean; blink?: boolean; r?: number }) {
  return (
    <g>
      {ping ? <circle cx={x} cy={y} r={r * 1.5} fill="none" stroke={color} className="animate-ping-ring" /> : null}
      <circle cx={x} cy={y} r={r * 2.2} fill={color} opacity={0.14} />
      <circle cx={x} cy={y} r={r} fill={color} className={blink ? 'animate-led' : undefined} />
    </g>
  );
}

function Icon({ id, x, y, size = 24, color = C.teal }: { id: string; x: number; y: number; size?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 24})`} color={color} style={{ color }}>
      <DomainGlyph id={id} />
    </g>
  );
}

function Packet({ path: d, dur, begin = 0, r = 3, color = C.teal }: { path: string; dur: number; begin?: number; r?: number; color?: string }) {
  return (
    <g>
      <circle r={r * 2.4} fill={color} opacity={0.15}>
        <animateMotion dur={`${dur}s`} begin={`${-(dur - (begin % dur))}s`} repeatCount="indefinite" path={d} />
      </circle>
      <circle r={r} fill={color}>
        <animateMotion dur={`${dur}s`} begin={`${-(dur - (begin % dur))}s`} repeatCount="indefinite" path={d} />
      </circle>
    </g>
  );
}

function Header({ x, y, title, sub }: { x: number; y: number; title: string; sub?: string }) {
  return (
    <g>
      <circle cx={x + 4} cy={y - 5} r={3.5} fill={C.teal} className="animate-node-pulse" />
      <rect x={x + 14} y={y - 5.5} width={60} height={1} fill={`url(#hdr-fade)`} />
      <T x={x} y={y + 26} size={22} mono={false} weight={600} color={C.strong}>
        {title}
      </T>
      {sub ? (
        <T x={x} y={y + 50} size={13} mono={false} color={C.text}>
          {sub}
        </T>
      ) : null}
    </g>
  );
}

function HeaderDefs() {
  return (
    <defs>
      <linearGradient id="hdr-fade" x1="0" x2="1">
        <stop offset="0" stopColor={C.teal} stopOpacity={0.8} />
        <stop offset="1" stopColor={C.teal} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

/* ------------------------------------------------------------------ */
/* hero                                                                */
/* ------------------------------------------------------------------ */

function buildHero(): string {
  const profile = getProfile();
  const W = 1200;
  const H = 400;
  const sites = profile.figures.items.find((f) => f.label === 'SITES')?.value ?? '';
  const uptime = profile.figures.items.find((f) => f.label === 'UPTIME')?.value ?? '';
  const role = wrap(profile.role_line.toUpperCase(), 13, 560, 0.72);
  const brand = profile.brand;
  const nine = brand.indexOf('9');
  const glyph = 11 * 0.6 + 2; // mono advance + letter-spacing
  const locW = profile.location.length * glyph;
  const pillW = 34 + locW + 12 + (profile.timezone.length + 3) * glyph + 14;

  const rows: Array<[string, string, string]> = [
    ['SITES', sites, C.strong],
    ['UPTIME', uptime, C.strong],
    ['TIMEZONE', profile.timezone.toUpperCase(), C.strong],
    ['STATUS', 'NOMINAL', C.teal],
  ];

  const body = (
    <>
      <Defs id="hero" />
      <rect width={W} height={H} fill={C.bg} />
      <rect width={W} height={H} fill="url(#hero-grid)" opacity={0.55} />
      <circle cx={850} cy={200} r={300} fill="url(#hero-glow)" />
      <rect x={0} y={0} width={2} height={H} fill="url(#hero-fade)" className="scan" transform="rotate(0)" />
      <rect y={H - 1} width={W} height={1} fill={C.line} />

      {/* status pill */}
      <g className="fade-up">
        <rect x={60} y={58} width={pillW} height={30} rx={15} fill={C.panel} stroke={C.line} />
        <Led x={80} y={73} r={3.5} ping />
        <T x={94} y={77.5} size={11} color={C.strong} spacing={2}>
          {profile.location.toUpperCase()}
        </T>
        <T x={94 + locW + 12} y={77.5} size={11} color={C.text} spacing={2}>
          {`/  ${profile.timezone.toUpperCase()}`}
        </T>
      </g>

      {/* brand */}
      <g className="fade-up" style={{ animationDelay: '120ms' }}>
        <text x={56} y={186} fontFamily={SANS} fontSize={96} fontWeight={700} letterSpacing={-3.5} fill={C.strong}>
          {nine > -1 ? (
            <>
              <tspan>{brand.slice(0, nine)}</tspan>
              <tspan fill={C.teal}>9</tspan>
              <tspan>{brand.slice(nine + 1)}</tspan>
            </>
          ) : (
            brand
          )}
        </text>
      </g>

      <g className="fade-up" style={{ animationDelay: '260ms' }}>
        {role.map((line, i) => (
          <T key={line} x={60} y={226 + i * 20} size={13} spacing={3} color={C.text}>
            {line}
          </T>
        ))}
      </g>

      <g className="fade-up" style={{ animationDelay: '400ms' }}>
        <rect x={60} y={300} width={28} height={1.5} fill={C.crimson} />
        <T x={100} y={305} size={12} spacing={2.5} color={C.crimson} weight={600}>
          {profile.tagline}
        </T>
      </g>

      {/* engineering core */}
      <svg x={650} y={50} width={300} height={300}>
        <CoreFallback />
      </svg>
      <g fill="none" stroke={C.teal} strokeOpacity={0.5}>
        <path d="M650 70 V54 H666" />
        <path d="M934 54 H950 V70" />
        <path d="M950 330 V346 H934" />
        <path d="M666 346 H650 V330" />
      </g>
      <T x={662} y={370} size={10} spacing={2}>
        FIELD · EDGE · DATA · AI
      </T>

      {/* status panel */}
      <g className="fade-up" style={{ animationDelay: '520ms' }}>
        <Panel x={968} y={86} w={192} h={228} ticks />
        <Led x={990} y={112} r={3.5} blink />
        <T x={1004} y={116} size={11} color={C.strong} spacing={1.8}>
          SYSTEMS ONLINE
        </T>
        <rect x={984} y={130} width={160} height={1} fill={C.line} />
        {rows.map(([label, value, color], i) => (
          <g key={label}>
            <T x={984} y={160 + i * 40} size={9.5} spacing={1.8}>
              {label}
            </T>
            <T x={984} y={178 + i * 40} size={label === 'TIMEZONE' ? 12 : 16} color={color} weight={700} spacing={label === 'TIMEZONE' ? 1 : 1.5}>
              {value}
            </T>
          </g>
        ))}
      </g>
    </>
  );

  return svgDoc(
    W,
    H,
    `${brand}, ${profile.tagline.toLowerCase()} ${profile.location}. Status panel: ${sites} sites, ${uptime.toLowerCase().replace('yrs', 'years')} uptime, timezone ${profile.timezone}, status nominal.`,
    <>
      <HeaderDefs />
      {body}
    </>,
  );
}

/* ------------------------------------------------------------------ */
/* terminal                                                            */
/* ------------------------------------------------------------------ */

function buildTerminal(): string {
  const lines = [
    'I engineer intelligent systems end to end: hardware to cloud.',
    'Edge devices that keep working when the uplink does not.',
    'Practical AI where it measurably helps the work.',
  ];
  const W = 900;
  const H = 52;
  const size = 18;
  const charW = size * 0.6;
  const cycle = 12;
  const slot = cycle / lines.length;
  const x0 = 40;

  const body = (
    <>
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={8} fill={C.panel} stroke={C.line} />
      <T x={18} y={32} size={16} color={C.crimson} weight={700}>
        $
      </T>
      {lines.map((line, i) => {
        const width = line.length * charW;
        const start = i * slot;
        const typeDur = Math.min(2.2, line.length * 0.035);
        const kt = (t: number) => (t / cycle).toFixed(4);
        // timeline per line: hidden -> typed over typeDur -> hold -> hidden
        let keyTimes = ['0', kt(start), kt(start + typeDur), kt(start + slot - 0.3), kt(start + slot - 0.25), '1'];
        let widths = ['0', '0', String(width), String(width), '0', '0'];
        let opac = ['0', '1', '1', '1', '0', '0'];
        if (i === 0) {
          keyTimes = keyTimes.slice(1);
          widths = widths.slice(1);
          opac = opac.slice(1);
        }
        const xs = widths.map((w) => String(x0 + Number(w) + 3));
        return (
          <g key={line}>
            <clipPath id={`type-${i}`}>
              <rect x={x0 - 2} y={8} height={36} width={i === 0 ? width + 2 : 0}>
                <animate attributeName="width" dur={`${cycle}s`} repeatCount="indefinite" keyTimes={keyTimes.join(';')} values={widths.map((w) => String(Number(w) + 2)).join(';')} />
              </rect>
            </clipPath>
            <g clipPath={`url(#type-${i})`}>
              <text x={x0} y={32} fontFamily={MONO} fontSize={size} fill={C.teal} textLength={width} lengthAdjust="spacingAndGlyphs">
                {line}
              </text>
            </g>
            <rect x={i === 0 ? x0 + width + 3 : x0 + 3} y={15} width={9} height={22} fill={C.crimson} opacity={i === 0 ? 0.85 : 0}>
              <animate attributeName="x" dur={`${cycle}s`} repeatCount="indefinite" keyTimes={keyTimes.join(';')} values={xs.join(';')} />
              <animate attributeName="opacity" dur={`${cycle}s`} repeatCount="indefinite" keyTimes={keyTimes.join(';')} values={opac.map((o) => String(Number(o) * 0.85)).join(';')} calcMode="discrete" />
            </rect>
          </g>
        );
      })}
    </>
  );
  return svgDoc(W, H, 'Terminal line cycling through the core engineering message', body);
}

/* ------------------------------------------------------------------ */
/* domains                                                             */
/* ------------------------------------------------------------------ */

function buildDomains(): string {
  const domains = getDomains();
  const W = 1200;
  const cols = 4;
  const gap = 20;
  const tileW = (W - 48 - gap * (cols - 1)) / cols;
  const summaries = domains.map((d) => wrap(d.summary, 12.5, tileW - 40, 0.53));
  const maxLines = Math.max(...summaries.map((s) => s.length));
  const tileH = 112 + maxLines * 19 + 18;
  const rows = Math.ceil(domains.length / cols);
  const H = 24 + rows * tileH + (rows - 1) * gap + 24;

  const body = (
    <>
      <Defs id="dom" />
      {domains.map((domain, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 24 + col * (tileW + gap);
        const y = 24 + row * (tileH + gap);
        return (
          <g key={domain.id} className="fade-up" style={{ animationDelay: `${i * 90}ms` }}>
            <Panel x={x} y={y} w={tileW} h={tileH} />
            <rect x={x + 20} y={y + 20} width={44} height={44} rx={9} fill={C.bg} stroke={C.teal} strokeOpacity={0.45} />
            <Icon id={domain.id} x={x + 30} y={y + 30} size={24} />
            <T x={x + tileW - 20} y={y + 36} size={10.5} anchor="end" color={C.teal} spacing={2}>
              {domain.short}
            </T>
            <Led x={x + tileW - 24} y={y + 54} r={2.5} blink={i % 3 === 0} />
            <T x={x + 20} y={y + 92} size={16} mono={false} weight={600} color={C.strong}>
              {domain.title}
            </T>
            <rect x={x + 20} y={y + 104} width={tileW - 40} height={1} fill={C.line} />
            {summaries[i]!.map((line, li) => (
              <T key={li} x={x + 20} y={y + 128 + li * 19} size={12.5} mono={false} color={C.text}>
                {line}
              </T>
            ))}
          </g>
        );
      })}
    </>
  );
  return svgDoc(W, H, `Eight engineering domains: ${domains.map((d) => d.title).join(', ')}`, body);
}

/* ------------------------------------------------------------------ */
/* capability matrix                                                   */
/* ------------------------------------------------------------------ */

const EVIDENCE_COLOR: Record<EvidenceType, { stroke: string; text: string; fill: string }> = {
  project: { stroke: C.teal, text: C.teal, fill: C.teal },
  explored: { stroke: C.lineHi, text: C.strong, fill: C.text },
  portfolio: { stroke: C.crimson, text: C.crimson, fill: 'none' },
};

const CATEGORY_ICON: Record<string, string> = {
  field: 'industrial-automation',
  edge: 'iot-edge',
  comms: 'layer-transport',
  backend: 'full-stack',
  data: 'layer-data',
  cloud: 'cloud-infrastructure',
  apps: 'realtime-visualization',
  ai: 'ai-agents',
};

function buildMatrix(): string {
  const categories = getTechnologyCategories();
  const technologies = getTechnologies();
  const W = 1200;
  const cols = 4;
  const gap = 20;
  const panelW = (W - 48 - gap * (cols - 1)) / cols;
  const chipH = 24;
  const chipGap = 7;
  const fs = 11;
  const charW = fs * 0.61;

  type Chip = { name: string; evidence: EvidenceType; x: number; y: number; w: number };
  const layouts = categories.map((category) => {
    const items = technologies.filter((t) => t.category === category.id);
    const chips: Chip[] = [];
    let cx = 0;
    let cy = 0;
    const maxW = panelW - 36;
    for (const item of items) {
      const w = Math.min(maxW, item.name.length * charW + 28);
      if (cx + w > maxW && cx > 0) {
        cx = 0;
        cy += chipH + chipGap;
      }
      chips.push({ name: item.name, evidence: item.evidence, x: cx, y: cy, w });
      cx += w + chipGap;
    }
    return { category, chips, height: chips.length ? cy + chipH : 0, count: items.length };
  });

  const rowCount = Math.ceil(layouts.length / cols);
  const rowHeights = [...Array(rowCount)].map((_, r) => Math.max(...layouts.slice(r * cols, r * cols + cols).map((l) => l.height)) + 92);
  const legendH = 44;
  const H = 24 + legendH + rowHeights.reduce((a, b) => a + b, 0) + gap * (rowCount - 1) + 24;

  const legend: Array<[EvidenceType, string]> = [
    ['project', 'PROJECT — used in a listed project'],
    ['explored', 'EXPLORED — evaluated or experimented with'],
    ['portfolio', 'PORTFOLIO — adopted to build this profile/site'],
  ];

  let rowY = 24 + legendH;
  const panels: ReactElement[] = [];
  layouts.forEach((layout, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    if (col === 0 && row > 0) rowY += rowHeights[row - 1]! + gap;
    const x = 24 + col * (panelW + gap);
    const y = rowY;
    const h = rowHeights[row]!;
    panels.push(
      <g key={layout.category.id} className="fade-up" style={{ animationDelay: `${i * 80}ms` }}>
        <Panel x={x} y={y} w={panelW} h={h} />
        <Icon id={CATEGORY_ICON[layout.category.id] ?? 'layer-transport'} x={x + 18} y={y + 18} size={18} />
        <T x={x + 44} y={y + 32} size={11} color={C.strong} weight={700} spacing={1.6}>
          {layout.category.label.toUpperCase()}
        </T>
        <T x={x + panelW - 18} y={y + 32} size={11} color={C.teal} anchor="end">
          {String(layout.count).padStart(2, '0')}
        </T>
        <rect x={x + 18} y={y + 46} width={panelW - 36} height={1} fill={C.line} />
        {layout.chips.map((chip, ci) => {
          const color = EVIDENCE_COLOR[chip.evidence];
          const cx = x + 18 + chip.x;
          const cy = y + 62 + chip.y;
          const maxChars = Math.floor((chip.w - 28) / charW + 0.01);
          const label = chip.name.length > maxChars ? `${chip.name.slice(0, maxChars - 1)}…` : chip.name;
          return (
            <g key={chip.name} className="fade-up" style={{ animationDelay: `${300 + i * 80 + ci * 30}ms` }}>
              <rect x={cx + 0.5} y={cy + 0.5} width={chip.w - 1} height={chipH - 1} rx={6} fill={C.bg} stroke={color.stroke} strokeOpacity={chip.evidence === 'explored' ? 1 : 0.6} />
              <circle cx={cx + 12} cy={cy + chipH / 2} r={2.6} fill={color.fill} stroke={chip.evidence === 'portfolio' ? C.crimson : 'none'} />
              <T x={cx + 21} y={cy + 16} size={fs} color={color.text} spacing={0}>
                {label}
              </T>
            </g>
          );
        })}
      </g>,
    );
  });

  const body = (
    <>
      <Defs id="mx" />
      {legend.map(([type, label], i) => {
        const color = EVIDENCE_COLOR[type];
        const x = 24 + i * 340;
        return (
          <g key={type}>
            <circle cx={x + 6} cy={34} r={4} fill={color.fill} stroke={type === 'portfolio' ? C.crimson : 'none'} />
            <T x={x + 18} y={38} size={10.5} color={color.text === C.strong ? C.text : color.text} spacing={1.2}>
              {label}
            </T>
          </g>
        );
      })}
      {panels}
    </>
  );
  return svgDoc(W, H, 'Capability matrix grouped by purpose, technologies tagged project, explored or portfolio', body);
}

/* ------------------------------------------------------------------ */
/* pipeline                                                            */
/* ------------------------------------------------------------------ */

const LAYER_ICON: Record<string, string> = {
  field: 'industrial-automation',
  edge: 'iot-edge',
  transport: 'layer-transport',
  backend: 'cloud-infrastructure',
  data: 'layer-data',
  app: 'realtime-visualization',
  operator: 'layer-operator',
};

function buildPipeline(): string {
  const profile = getProfile();
  const nodes = profile.pipeline.nodes;
  const W = 1200;
  const H = 270;
  const gap = 18;
  const nodeW = (W - 48 - gap * (nodes.length - 1)) / nodes.length;
  const nodeY = 70;
  const nodeH = 148;
  const trackY = nodeY + 44;
  const track = `M${24 + nodeW / 2} ${trackY} H${W - 24 - nodeW / 2}`;

  const body = (
    <>
      <Defs id="pl" />
      <rect width={W} height={H} fill="url(#pl-dots)" opacity={0.6} />
      <T x={24} y={36} size={11} spacing={2.5} color={C.text}>
        {profile.pipeline.title.toUpperCase()}
      </T>
      <T x={W - 24} y={36} size={11} spacing={2} color={C.teal} anchor="end">
        SIGNAL FLOW →
      </T>
      <path d={track} stroke={C.line} strokeWidth={3} fill="none" />
      <path d={track} stroke={C.teal} strokeOpacity={0.35} strokeWidth={1.5} fill="none" />
      <path d={track} stroke={C.teal} strokeWidth={1.5} fill="none" className="animate-trace" />
      <Packet path={track} dur={5} r={3.5} />
      <Packet path={track} dur={5} begin={1.66} r={3.5} />
      <Packet path={track} dur={5} begin={3.33} r={3.5} />
      {nodes.map((node, i) => {
        const x = 24 + i * (nodeW + gap);
        const isOperator = node.layer === 'operator';
        const labelLines = wrap(node.label, 14, nodeW - 20, 0.55);
        return (
          <g key={node.id} className="fade-up" style={{ animationDelay: `${i * 110}ms` }}>
            <rect x={x + 0.5} y={nodeY + 0.5} width={nodeW - 1} height={nodeH - 1} rx={10} fill={C.panel} stroke={isOperator ? C.crimson : C.line} strokeOpacity={isOperator ? 0.7 : 1} />
            <rect x={x + nodeW / 2 - 22} y={nodeY + 22} width={44} height={44} rx={9} fill={C.bg} stroke={isOperator ? C.crimson : C.teal} strokeOpacity={0.6} />
            <Icon id={LAYER_ICON[node.layer] ?? 'layer-transport'} x={x + nodeW / 2 - 12} y={nodeY + 32} size={24} color={isOperator ? C.crimson : C.teal} />
            <T x={x + nodeW / 2} y={nodeY + 86} size={9.5} anchor="middle" spacing={1.8} color={isOperator ? C.crimson : C.teal}>
              {node.layer.toUpperCase()}
            </T>
            {labelLines.map((line, li) => (
              <T key={li} x={x + nodeW / 2} y={nodeY + 106 + li * 17} size={14} anchor="middle" mono={false} weight={600} color={C.strong}>
                {line}
              </T>
            ))}
            <Led x={x + nodeW - 14} y={nodeY + 14} r={2.2} blink={i % 2 === 0} color={isOperator ? C.crimson : C.teal} />
          </g>
        );
      })}
      <T x={24} y={H - 18} size={10} spacing={1.5} color={C.text}>
        LOCAL LOGIC AT THE EDGE · CONTROLLED HAND-OFF TO THE CLOUD · ILLUSTRATIVE
      </T>
    </>
  );
  return svgDoc(W, H, `Edge to cloud pipeline: ${nodes.map((n) => n.label).join(' to ')}`, body);
}

/* ------------------------------------------------------------------ */
/* AI lab                                                              */
/* ------------------------------------------------------------------ */

function buildAiLab(): string {
  const ai = getAiLab();
  const W = 1200;
  const workflows = ai.workflows;
  const listX = 24;
  const listW = 640;
  const rowH = 58;
  const H = Math.max(110 + workflows.length * (rowH + 10) + 14, 400);

  const body = (
    <>
      <Defs id="ai" />
      <HeaderDefs />
      <Header x={24} y={34} title={ai.title} sub="Models used or evaluated, not built or trained. Human approval gates on every sensitive action." />
      {workflows.map((wf, i) => {
        const y = 110 + i * (rowH + 10);
        const working = /working/i.test(wf.maturity);
        const color = working ? C.teal : C.crimson;
        return (
          <g key={wf.id} className="fade-up" style={{ animationDelay: `${i * 110}ms` }}>
            <Panel x={listX} y={y} w={listW} h={rowH} />
            <Led x={listX + 24} y={y + rowH / 2} r={3.5} color={color} ping={working} blink={!working} />
            <T x={listX + 44} y={y + rowH / 2 + 5.5} size={15} mono={false} weight={600} color={C.strong}>
              {wf.title}
            </T>
            <rect x={listX + listW - 20 - wf.maturity.length * 7 - 22} y={y + rowH / 2 - 12} width={wf.maturity.length * 7 + 22} height={24} rx={12} fill={C.bg} stroke={color} strokeOpacity={0.55} />
            <T x={listX + listW - 20 - (wf.maturity.length * 7 + 22) / 2} y={y + rowH / 2 + 4} size={10} anchor="middle" color={color} spacing={1.2}>
              {wf.maturity.toUpperCase()}
            </T>
          </g>
        );
      })}

      {/* agent schematic */}
      <g className="fade-up" style={{ animationDelay: '300ms' }}>
        <Panel x={688} y={110} w={488} h={H - 134} ticks />
        <T x={708} y={136} size={10.5} spacing={2} color={C.text}>
          AGENT WORKFLOW
        </T>
        <T x={1156} y={136} size={10.5} spacing={2} color={C.text} anchor="end">
          SCHEMATIC
        </T>
        <rect x={704} y={148} width={456} height={1} fill={C.line} />
        <svg x={704} y={156} width={456} height={H - 196} viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet">
          <ProjectIllustration projectId={ai.project_id} />
        </svg>
      </g>
    </>
  );
  return svgDoc(W, H, `AI engineering laboratory: ${workflows.map((w) => `${w.title} (${w.maturity})`).join(', ')}`, body);
}

/* ------------------------------------------------------------------ */
/* case-study cards                                                    */
/* ------------------------------------------------------------------ */

function buildCard(projectId: string): string {
  const project = getFeaturedProjects().find((p) => p.id === projectId)!;
  const technologies = getTechnologies();
  const W = 600;
  const bannerH = 230;
  const summary = wrap(project.summary, 15, W - 56, 0.52);
  const names = project.technologies
    .map((id) => technologies.find((t) => t.id === id)?.name)
    .filter((n): n is string => Boolean(n))
    .map((n) => n.replace(/\s*\(.*\)$/, ''));

  // chips: one row, as many as fit
  const fs = 11;
  const charW = fs * 0.61;
  const chips: Array<{ name: string; x: number; w: number }> = [];
  let cx = 28;
  for (const name of names) {
    const w = name.length * charW + 22;
    if (cx + w > W - 28 - 50) break;
    chips.push({ name, x: cx, w });
    cx += w + 7;
  }
  const more = names.length - chips.length;

  // Uniform card height across the set so README rows line up.
  const maxSummaryLines = Math.max(...getFeaturedProjects().map((p) => wrap(p.summary, 15, W - 56, 0.52).length));
  const titleY = bannerH + 46;
  const summaryY = titleY + 34;
  const chipsY = summaryY + maxSummaryLines * 22 + 10;
  const H = chipsY + 24 + 26;
  const status = formatProjectStatus(project.project_status).toUpperCase();
  const statusW = status.length * 7.2 + 34;

  const body = (
    <>
      <defs>
        <clipPath id="card-clip">
          <rect x={0} y={0} width={W} height={H} rx={14} />
        </clipPath>
        <clipPath id="banner-clip">
          <rect x={1} y={1} width={W - 2} height={bannerH} />
        </clipPath>
        <linearGradient id="banner-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.7" stopColor={C.panel} stopOpacity={0} />
          <stop offset="1" stopColor={C.panel} stopOpacity={1} />
        </linearGradient>
      </defs>
      <g clipPath="url(#card-clip)">
        <rect width={W} height={H} fill={C.panel} />
        <g clipPath="url(#banner-clip)">
          <svg x={0} y={0} width={W} height={bannerH} viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice">
            <ProjectIllustration projectId={project.id} />
          </svg>
          <rect x={0} y={0} width={W} height={bannerH} fill="url(#banner-fade)" />
        </g>
        <rect x={0} y={bannerH} width={W} height={1} fill={C.line} />
      </g>
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={14} fill="none" stroke={C.line} />

      {/* overlays */}
      {project.code ? (
        <g>
          <rect x={16} y={16} width={74} height={26} rx={7} fill={C.bg} fillOpacity={0.9} stroke={C.line} />
          <T x={53} y={33.5} size={10.5} anchor="middle" color={C.teal} spacing={2.2}>
            {`CASE ${project.code}`}
          </T>
        </g>
      ) : null}
      <g>
        <rect x={W - 16 - statusW} y={16} width={statusW} height={26} rx={13} fill={C.bg} fillOpacity={0.9} stroke={C.line} />
        <Led x={W - 16 - statusW + 15} y={29} r={3} ping={project.project_status === 'operational'} />
        <T x={W - 16 - statusW + 26} y={33} size={10.5} color={C.strong} spacing={1.4}>
          {status}
        </T>
      </g>

      <T x={28} y={titleY} size={21} mono={false} weight={700} color={C.strong} spacing={-0.3}>
        {project.title}
      </T>
      {summary.map((line, i) => (
        <T key={i} x={28} y={summaryY + i * 22} size={15} mono={false} color={C.text}>
          {line}
        </T>
      ))}
      {chips.map((chip) => (
        <g key={chip.name}>
          <rect x={chip.x + 0.5} y={chipsY + 0.5} width={chip.w - 1} height={23} rx={6} fill={C.bg} stroke={C.lineHi} />
          <T x={chip.x + chip.w / 2} y={chipsY + 16} size={fs} anchor="middle" color={C.text} spacing={0}>
            {chip.name}
          </T>
        </g>
      ))}
      {more > 0 ? (
        <T x={cx + 4} y={chipsY + 16} size={fs} color={C.teal} spacing={0}>
          {`+${more}`}
        </T>
      ) : null}
      <T x={W - 28} y={titleY} size={16} color={C.teal} anchor="end" weight={700}>
        →
      </T>
    </>
  );

  return svgDoc(W, H, `${project.code ? `${project.code}: ` : ''}${project.title} — ${project.summary}`, body);
}

/* ------------------------------------------------------------------ */
/* run                                                                 */
/* ------------------------------------------------------------------ */

console.log(`Writing README assets to ${ASSETS}`);
writePair('hero', buildHero());
writePair('terminal', buildTerminal());
writePair('domains', buildDomains());
writePair('matrix', buildMatrix());
writePair('pipeline', buildPipeline());
writePair('ai-lab', buildAiLab());
for (const project of getFeaturedProjects()) writePair(`cards/${project.id}`, buildCard(project.id));
console.log('Done.');
