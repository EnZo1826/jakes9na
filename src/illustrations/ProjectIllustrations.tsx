import type { ReactElement, ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { C } from './palette';
import { DotGrid, Led, Packet, Trace } from './primitives';

/**
 * One schematic banner per case study (320 x 140). Illustrative only —
 * they depict the kind of system described in the case study text, not a
 * screenshot of a client system, and contain no client data.
 */

const W = 320;
const H = 140;

function Mono({ x, y, children, color = C.text, anchor = 'start', size = 7.5 }: { x: number; y: number; children: string; color?: string; anchor?: 'start' | 'middle' | 'end'; size?: number }) {
  return (
    <text x={x} y={y} fill={color} fontFamily="JetBrains Mono, monospace" fontSize={size} letterSpacing={1} textAnchor={anchor}>
      {children}
    </text>
  );
}

function Frame({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="presentation" preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill={C.bg} />
      <DotGrid id={`${id}-dots`} gap={10} opacity={0.7} />
      {children}
    </svg>
  );
}

/* A — fuel: pulser -> counter -> receipt -> ERP */
function Fuel() {
  const reduced = useReducedMotion();
  const sq = 'M70 70 h8 v-10 h8 v10 h8 v-10 h8 v10 h8 v-10 h8 v10 h8';
  return (
    <Frame id="fuel">
      {/* dispenser */}
      <rect x={22} y={30} width={40} height={84} rx={5} fill={C.panel} stroke={C.lineHi} />
      <rect x={28} y={38} width={28} height={16} rx={2} fill={C.bg} stroke={C.line} />
      <Mono x={42} y={49} color={C.teal} anchor="middle" size={7}>L</Mono>
      <rect x={28} y={60} width={28} height={46} rx={2} fill={C.bg} stroke={C.line} />
      <rect x={30} y={62} width={24} height={42} rx={1} fill={C.teal} opacity={0.18} />
      <rect x={30} y={84} width={24} height={20} rx={1} fill={C.teal} opacity={0.75}>
        {!reduced ? (
          <>
            <animate attributeName="y" values="104;64;104" dur="6s" repeatCount="indefinite" />
            <animate attributeName="height" values="0;40;0" dur="6s" repeatCount="indefinite" />
          </>
        ) : null}
      </rect>
      <path d="M62 44 h8 a6 6 0 0 1 6 6 v6" fill="none" stroke={C.lineHi} strokeWidth={3} strokeLinecap="round" />
      {/* pulse train */}
      <path d={sq} fill="none" stroke={C.teal} strokeOpacity={0.35} strokeWidth={1.4} />
      <path d={sq} fill="none" stroke={C.teal} strokeWidth={1.4} className="animate-trace" />
      <Packet path={sq} dur={2} r={2} />
      <Mono x={70} y={88}>PULSES</Mono>
      {/* edge counter */}
      <rect x={130} y={44} width={64} height={48} rx={5} fill={C.panel} stroke={C.teal} strokeOpacity={0.7} />
      <Mono x={162} y={58} anchor="middle" color={C.strong}>EDGE</Mono>
      <rect x={138} y={64} width={48} height={18} rx={2} fill={C.bg} stroke={C.line} />
      <Mono x={162} y={77} anchor="middle" color={C.teal} size={9}>0042.7</Mono>
      <Led x={186} y={52} r={1.8} blink />
      {/* receipt */}
      <rect x={214} y={34} width={36} height={8} rx={2} fill={C.lineHi} />
      <g>
        <path d="M218 42 h28 v46 l-4 -3 l-4 3 l-4 -3 l-4 3 l-4 -3 l-4 3 l-4 -3 z" fill={C.strong} opacity={0.9} />
        {[50, 56, 62, 68].map((y) => (
          <rect key={y} x={222} y={y} width={y === 68 ? 12 : 20} height={2} fill={C.bg} opacity={0.6} />
        ))}
        {!reduced ? <animateTransform attributeName="transform" type="translate" values="0 -40;0 0;0 0;0 -40" keyTimes="0;0.35;0.85;1" dur="6s" repeatCount="indefinite" /> : null}
      </g>
      <Mono x={232} y={108} anchor="middle">RECEIPT</Mono>
      {/* ERP */}
      <Trace d="M194 68 H206 V100 H272 V80" />
      <Packet path="M194 68 H206 V100 H272 V80" dur={2.6} />
      <rect x={262} y={44} width={40} height={36} rx={5} fill={C.panel} stroke={C.lineHi} />
      <Mono x={282} y={60} anchor="middle" color={C.strong}>ERP</Mono>
      <Mono x={282} y={72} anchor="middle">SYNC</Mono>
    </Frame>
  );
}

/* B — checkpoint: barrier arm, visitor badge, tablet, sync queue */
function Checkpoint() {
  const reduced = useReducedMotion();
  return (
    <Frame id="checkpoint">
      <rect x={0} y={112} width={W} height={2} fill={C.line} />
      {/* barrier */}
      <rect x={24} y={70} width={16} height={42} rx={2} fill={C.panel} stroke={C.lineHi} />
      <Led x={32} y={78} r={2} color={C.crimson} blink />
      <g>
        <rect x={34} y={72} width={110} height={6} rx={3} fill={C.strong} opacity={0.9} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={46 + i * 20} y={72} width={8} height={6} fill={C.crimson} />
        ))}
        {!reduced ? (
          <animateTransform attributeName="transform" type="rotate" values="0 37 75;-62 37 75;-62 37 75;0 37 75;0 37 75" keyTimes="0;0.15;0.55;0.7;1" dur="7s" repeatCount="indefinite" />
        ) : null}
      </g>
      {/* badge */}
      <g className="animate-float">
        <rect x={160} y={30} width={50} height={66} rx={5} fill={C.panel} stroke={C.teal} strokeOpacity={0.7} />
        <rect x={177} y={26} width={16} height={6} rx={2} fill={C.lineHi} />
        <circle cx={185} cy={52} r={9} fill={C.bg} stroke={C.lineHi} />
        <circle cx={185} cy={49} r={3} fill={C.text} />
        <path d="M179 58 a6 5 0 0 1 12 0" fill={C.text} />
        <rect x={170} y={68} width={30} height={3} rx={1} fill={C.text} opacity={0.6} />
        <rect x={174} y={75} width={22} height={3} rx={1} fill={C.text} opacity={0.4} />
        <Mono x={185} y={89} anchor="middle" color={C.teal} size={6.5}>VISITOR</Mono>
      </g>
      {/* tablet */}
      <rect x={228} y={38} width={70} height={52} rx={6} fill={C.panel} stroke={C.lineHi} />
      <rect x={234} y={44} width={58} height={40} rx={2} fill={C.bg} />
      <circle cx={263} cy={60} r={9} fill="none" stroke={C.teal} strokeWidth={1.5} />
      <path d="M258 60 l4 4 l7 -8" fill="none" stroke={C.teal} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="animate-node-pulse" />
      <Mono x={263} y={80} anchor="middle" size={6.5}>CHECKED IN</Mono>
      <Trace d="M263 90 V104 H298" slow />
      <Packet path="M263 90 V104 H298" dur={2} />
      <Mono x={298} y={122} anchor="end">OFFLINE QUEUE → ERP</Mono>
    </Frame>
  );
}

/* C — industrial: tank level, threshold, PLC, trend */
function Industrial() {
  const reduced = useReducedMotion();
  return (
    <Frame id="industrial">
      {/* tank */}
      <rect x={28} y={24} width={60} height={92} rx={8} fill={C.panel} stroke={C.lineHi} />
      <defs>
        <clipPath id="tank-clip">
          <rect x={32} y={28} width={52} height={84} rx={6} />
        </clipPath>
      </defs>
      <g clipPath="url(#tank-clip)">
        <rect x={32} y={60} width={52} height={60} fill={C.teal} opacity={0.35}>
          {!reduced ? <animate attributeName="y" values="70;44;56;70" dur="9s" repeatCount="indefinite" /> : null}
        </rect>
      </g>
      <line x1={24} x2={92} y1={44} y2={44} stroke={C.crimson} strokeDasharray="3 3" />
      <Mono x={96} y={46} color={C.crimson} size={6.5}>HI ALARM</Mono>
      {/* PLC */}
      <rect x={128} y={54} width={52} height={50} rx={4} fill={C.panel} stroke={C.teal} strokeOpacity={0.7} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={138 + i * 10} cy={64} r={2} fill={i === 2 ? C.crimson : C.teal} className="animate-led" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
      <Mono x={154} y={84} anchor="middle" color={C.strong}>PLC</Mono>
      <Mono x={154} y={96} anchor="middle" size={6.5}>MODBUS</Mono>
      <Trace d="M88 84 H128" />
      <Packet path="M88 84 H128" dur={1.4} />
      <Trace d="M180 79 H206" />
      <Packet path="M180 79 H206" dur={1.2} begin={0.5} />
      {/* trend */}
      <rect x={206} y={30} width={96} height={84} rx={5} fill={C.panel} stroke={C.lineHi} />
      <Mono x={214} y={44} color={C.strong}>LEVEL TREND</Mono>
      <line x1={214} x2={294} y1={60} y2={60} stroke={C.crimson} strokeOpacity={0.6} strokeDasharray="2 3" />
      <path d="M214 100 C230 96 236 80 250 84 S270 66 280 70 S290 62 294 64" fill="none" stroke={C.teal} strokeWidth={1.5} className="animate-trace-slow" />
      <path d="M214 100 C230 96 236 80 250 84 S270 66 280 70 S290 62 294 64" fill="none" stroke={C.teal} strokeOpacity={0.35} strokeWidth={1.5} />
      <Led x={292} y={41} r={1.8} ping />
    </Frame>
  );
}

/* D — fleet: road map, geofence, moving vehicle */
function Fleet() {
  const route = 'M20 112 C70 112 70 64 120 64 S170 100 210 92 S270 40 302 36';
  return (
    <Frame id="fleet">
      <g stroke={C.line} strokeWidth={6} fill="none" strokeLinecap="round">
        <path d={route} />
        <path d="M120 0 V140" />
        <path d="M0 40 H140" />
      </g>
      <path d={route} fill="none" stroke={C.lineHi} strokeWidth={1} strokeDasharray="4 4" />
      {/* geofence */}
      <path d="M180 60 L246 46 L262 100 L196 116 Z" fill={C.teal} fillOpacity={0.07} stroke={C.teal} strokeDasharray="4 3" className="animate-trace-slow" />
      <Mono x={198} y={128} color={C.teal} size={6.5}>GEOFENCE</Mono>
      {/* depot */}
      <rect x={12} y={100} width={18} height={18} rx={3} fill={C.panel} stroke={C.lineHi} />
      <Mono x={21} y={130} anchor="middle" size={6}>DEPOT</Mono>
      {/* vehicle */}
      <Packet path={route} dur={9} r={4} />
      {/* pins */}
      <g transform="translate(296 22)">
        <path d="M6 0 a6 6 0 0 1 6 6 c0 5 -6 10 -6 10 s-6 -5 -6 -10 a6 6 0 0 1 6 -6 z" fill={C.crimson} />
        <circle cx={6} cy={6} r={2} fill={C.bg} />
      </g>
      {/* satellite */}
      <g transform="translate(40 14)">
        <rect x={0} y={4} width={10} height={6} fill={C.lineHi} />
        <rect x={12} y={2} width={8} height={10} rx={1} fill={C.panel} stroke={C.text} />
        <rect x={22} y={4} width={10} height={6} fill={C.lineHi} />
      </g>
      <path d="M56 32 Q 70 60 120 64" fill="none" stroke={C.teal} strokeOpacity={0.5} strokeDasharray="2 4" className="animate-trace" />
      <rect x={232} y={8} width={76} height={22} rx={4} fill={C.panel} stroke={C.lineHi} />
      <Mono x={240} y={22} color={C.strong} size={6.5}>AVL · LIVE</Mono>
      <Led x={298} y={19} r={1.8} ping />
    </Frame>
  );
}

/* E — LED matrix: dot-masked scrolling text */
function LedMatrix() {
  const reduced = useReducedMotion();
  return (
    <Frame id="led">
      <defs>
        <pattern id="ledm-dots" width={5} height={5} patternUnits="userSpaceOnUse">
          <circle cx={2.5} cy={2.5} r={1.7} fill="#fff" />
        </pattern>
        <mask id="led-mask">
          <rect x={30} y={30} width={260} height={60} fill="url(#ledm-dots)" />
        </mask>
      </defs>
      <rect x={24} y={24} width={272} height={72} rx={5} fill="#020304" stroke={C.lineHi} />
      <rect x={30} y={30} width={260} height={60} fill="url(#ledm-dots)" opacity={0.08} />
      <g mask="url(#led-mask)">
        <g>
          <text x={36} y={74} fill={C.crimson} fontFamily="JetBrains Mono, monospace" fontWeight={700} fontSize={38} letterSpacing={2}>
            BAY 2 · PROCEED
          </text>
          <text x={386} y={74} fill={C.teal} fontFamily="JetBrains Mono, monospace" fontWeight={700} fontSize={38} letterSpacing={2}>
            HUB75 · MQTT
          </text>
          {!reduced ? <animateTransform attributeName="transform" type="translate" values="0 0;-350 0" dur="8s" repeatCount="indefinite" /> : null}
        </g>
      </g>
      <rect x={110} y={104} width={100} height={20} rx={4} fill={C.panel} stroke={C.line} />
      <Mono x={160} y={117} anchor="middle" color={C.teal} size={6.5}>signs/bay2/text</Mono>
      <Trace d="M160 104 V96" />
      <Led x={286} y={110} r={2} blink />
    </Frame>
  );
}

/* F — AI lab: orchestrator, agents, approval gate */
function AgentLab() {
  const agents: Array<[number, number, string]> = [
    [60, 34, 'PLAN'],
    [60, 106, 'BUILD'],
    [160, 20, 'REVIEW'],
    [160, 120, 'TEST'],
  ];
  return (
    <Frame id="agents">
      {agents.map(([x, y], i) => {
        const d = `M${x} ${y} L160 70`;
        return (
          <g key={i}>
            <Trace d={d} slow />
            <Packet path={d} dur={2.2} begin={i * 0.5} reverse={i % 2 === 1} r={2} />
          </g>
        );
      })}
      <circle cx={160} cy={70} r={24} fill={C.panel} stroke={C.teal} strokeOpacity={0.8} />
      <circle cx={160} cy={70} r={30} fill="none" stroke={C.teal} strokeOpacity={0.25} strokeDasharray="3 5" className="animate-spin-slow" />
      <Mono x={160} y={68} anchor="middle" color={C.strong} size={6.5}>ORCHES-</Mono>
      <Mono x={160} y={77} anchor="middle" color={C.strong} size={6.5}>TRATOR</Mono>
      {agents.map(([x, y, label]) => (
        <g key={label}>
          <rect x={x - 22} y={y - 9} width={44} height={18} rx={9} fill={C.panel} stroke={C.lineHi} />
          <Mono x={x} y={y + 2.5} anchor="middle" size={6.5}>{label}</Mono>
        </g>
      ))}
      <Trace d="M184 70 H236" />
      <Packet path="M184 70 H236" dur={1.8} />
      {/* approval gate */}
      <rect x={236} y={46} width={66} height={48} rx={6} fill={C.panel} stroke={C.crimson} strokeOpacity={0.75} />
      <Mono x={269} y={62} anchor="middle" color={C.strong} size={6.5}>APPROVAL</Mono>
      <Mono x={269} y={72} anchor="middle" size={6.5}>GATE</Mono>
      <rect x={252} y={78} width={34} height={10} rx={2} fill={C.bg} stroke={C.line} />
      <Mono x={269} y={86} anchor="middle" color={C.crimson} size={6}>HUMAN</Mono>
      <Led x={296} y={52} r={1.8} color={C.crimson} blink />
    </Frame>
  );
}

/* G — ERP: doctype records -> print format */
function Erp() {
  const reduced = useReducedMotion();
  return (
    <Frame id="erp">
      {/* records table */}
      <rect x={20} y={24} width={110} height={92} rx={5} fill={C.panel} stroke={C.lineHi} />
      <Mono x={30} y={38} color={C.strong} size={6.5}>DOCTYPE</Mono>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={30} y={46 + i * 13} width={90} height={9} rx={1.5} fill={i === 2 ? C.teal : C.bg} opacity={i === 2 ? 0.25 : 1} stroke={C.line} />
          <rect x={34} y={49 + i * 13} width={30} height={3} rx={1} fill={C.text} opacity={0.5} />
          <rect x={98} y={49 + i * 13} width={16} height={3} rx={1} fill={i === 2 ? C.teal : C.text} opacity={0.6} />
        </g>
      ))}
      <Trace d="M130 70 H190" />
      <Packet path="M130 70 H190" dur={1.6} />
      <rect x={146} y={58} width={30} height={24} rx={3} fill={C.bg} stroke={C.line} />
      <Mono x={161} y={73} anchor="middle" color={C.teal} size={6.5}>{'{% %}'}</Mono>
      {/* printed doc */}
      <g>
        <rect x={190} y={16} width={86} height={108} rx={3} fill={C.strong} opacity={0.94} />
        <rect x={200} y={26} width={24} height={8} rx={1} fill={C.crimson} />
        <rect x={244} y={26} width={22} height={3} rx={1} fill={C.bg} opacity={0.5} />
        <rect x={244} y={32} width={16} height={3} rx={1} fill={C.bg} opacity={0.35} />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={200} y={46 + i * 10} width={44} height={3} rx={1} fill={C.bg} opacity={0.35} />
            <rect x={252} y={46 + i * 10} width={14} height={3} rx={1} fill={C.bg} opacity={0.5} />
          </g>
        ))}
        <rect x={200} y={102} width={66} height={1} fill={C.bg} opacity={0.4} />
        <rect x={240} y={108} width={26} height={5} rx={1} fill={C.bg} opacity={0.7} />
        {!reduced ? <animateTransform attributeName="transform" type="translate" values="0 6;0 0;0 6" dur="6s" repeatCount="indefinite" /> : null}
      </g>
      <Mono x={300} y={132} anchor="end" size={6.5}>PRINT FORMAT</Mono>
    </Frame>
  );
}

/* H — dashboards: stat tiles, chart, heatmap */
function Dashboards() {
  const reduced = useReducedMotion();
  const cells = [...Array(24)].map((_, i) => i);
  return (
    <Frame id="dash">
      <rect x={14} y={14} width={292} height={112} rx={6} fill={C.panel} stroke={C.lineHi} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={24 + i * 60} y={24} width={52} height={30} rx={3} fill={C.bg} stroke={C.line} />
          <rect x={30 + i * 60} y={30} width={20} height={3} rx={1} fill={C.text} opacity={0.5} />
          <rect x={30 + i * 60} y={40} width={i === 1 ? 26 : 34} height={7} rx={1.5} fill={i === 1 ? C.crimson : C.teal} opacity={0.85} />
        </g>
      ))}
      {/* chart */}
      <rect x={24} y={62} width={172} height={54} rx={3} fill={C.bg} stroke={C.line} />
      <defs>
        <clipPath id="dash-clip">
          <rect x={26} y={64} width={168} height={50} />
        </clipPath>
      </defs>
      <g clipPath="url(#dash-clip)">
        <g>
          <path d="M26 100 L46 92 L66 96 L86 80 L106 86 L126 74 L146 82 L166 70 L186 78 L206 100 L226 92 L246 96 L266 80 L286 86 L306 74 L326 82 L346 70 L366 78 L386 100" fill="none" stroke={C.teal} strokeWidth={1.5} />
          {!reduced ? <animateTransform attributeName="transform" type="translate" values="0 0;-180 0" dur="8s" repeatCount="indefinite" /> : null}
        </g>
      </g>
      {/* heatmap */}
      <g>
        {cells.map((i) => (
          <rect
            key={i}
            x={206 + (i % 6) * 15}
            y={24 + Math.floor(i / 6) * 23}
            width={12}
            height={20}
            rx={2}
            fill={i % 7 === 3 ? C.crimson : C.teal}
            opacity={0.15 + ((i * 37) % 10) / 14}
            className="animate-node-pulse"
            style={{ animationDelay: `${(i * 0.23) % 2.4}s` }}
          />
        ))}
      </g>
      <Led x={296} y={20} r={1.6} ping />
    </Frame>
  );
}

const BY_ID: Record<string, () => ReactElement> = {
  'fuel-management': Fuel,
  'security-checkpoint': Checkpoint,
  'industrial-monitoring': Industrial,
  'fleet-intelligence': Fleet,
  'led-matrix-control': LedMatrix,
  'ai-agent-lab': AgentLab,
  'erp-solutions': Erp,
  'monitoring-dashboards': Dashboards,
};

/** Returns the banner for a project id, or null when none is authored. */
export default function ProjectIllustration({ projectId }: { projectId: string }) {
  const Illustration = BY_ID[projectId];
  return Illustration ? <Illustration /> : null;
}
