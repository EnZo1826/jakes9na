import { useReducedMotion } from '../hooks/useReducedMotion';
import { C } from './palette';
import { DotGrid, Led, Packet, Trace } from './primitives';

/**
 * Hero illustration: the physical-to-digital chain this portfolio is about.
 * Field devices -> edge gateway (local logic, buffer) -> cloud backend ->
 * live dashboard -> operator action. Purely illustrative: it is labelled
 * "illustrative" on screen and conveys nothing that is not in the text.
 */

const T_FLOW = 'M150 75 H190 V205 H232';
const T_PLC = 'M150 185 H180 V228 H232';
const T_GPS = 'M150 295 H180 V252 H232';
const T_CAM = 'M150 395 H190 V275 H232';
const T_UP = 'M362 222 H392 V92 H420';
const T_DOWN = 'M500 132 V230';
const T_OPS = 'M490 402 V432';

function Label({ x, y, children, anchor = 'start', color = C.text }: { x: number; y: number; children: string; anchor?: 'start' | 'middle' | 'end'; color?: string }) {
  return (
    <text x={x} y={y} fill={color} fontFamily="JetBrains Mono, monospace" fontSize={8.5} letterSpacing={1.2} textAnchor={anchor}>
      {children}
    </text>
  );
}

function Box({ x, y, w, h, accent = false }: { x: number; y: number; w: number; h: number; accent?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={C.panel} stroke={accent ? C.teal : C.line} strokeOpacity={accent ? 0.7 : 1} />
      <rect x={x + 0.5} y={y + 0.5} width={w - 1} height={1} fill={C.strong} opacity={0.05} />
    </g>
  );
}

export default function HeroSchematic() {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 600 470" className="h-auto w-full" role="presentation">
      <DotGrid id="hero-dots" gap={14} opacity={0.6} />

      {/* ---------- traces ---------- */}
      <Trace d={T_FLOW} />
      <Trace d={T_PLC} />
      <Trace d={T_GPS} />
      <Trace d={T_CAM} color={C.text} slow />
      <Trace d={T_UP} width={1.6} />
      <Trace d={T_DOWN} width={1.6} />
      <Trace d={T_OPS} color={C.crimson} />

      <Packet path={T_FLOW} dur={2.2} />
      <Packet path={T_PLC} dur={1.8} begin={0.6} />
      <Packet path={T_GPS} dur={2} begin={1.1} />
      <Packet path={T_CAM} dur={2.6} begin={0.3} color={C.strong} r={2.2} />
      <Packet path={T_UP} dur={1.6} begin={0.4} r={3} />
      <Packet path={T_UP} dur={1.6} begin={1.2} r={3} />
      <Packet path={T_DOWN} dur={1.2} begin={0.8} r={3} />
      <Packet path={T_OPS} dur={1.4} begin={1.4} color={C.crimson} />

      {/* ---------- field: flow meter ---------- */}
      <Box x={20} y={40} w={130} h={70} />
      <circle cx={52} cy={75} r={20} fill={C.bg} stroke={C.lineHi} />
      {[...Array(9)].map((_, i) => {
        const a = (-210 + i * 30) * (Math.PI / 180);
        return <line key={i} x1={52 + Math.cos(a) * 15} y1={75 + Math.sin(a) * 15} x2={52 + Math.cos(a) * 18} y2={75 + Math.sin(a) * 18} stroke={C.text} strokeOpacity={0.6} />;
      })}
      <g>
        <line x1={52} y1={75} x2={52} y2={60} stroke={C.teal} strokeWidth={1.6} strokeLinecap="round" />
        {!reduced ? (
          <animateTransform attributeName="transform" type="rotate" values="-100 52 75;40 52 75;-20 52 75;-100 52 75" dur="6s" repeatCount="indefinite" />
        ) : null}
      </g>
      <circle cx={52} cy={75} r={2.5} fill={C.strong} />
      <Label x={80} y={68} color={C.strong}>FLOW</Label>
      <Label x={80} y={81}>PULSE OUT</Label>
      <Led x={138} y={52} blink />

      {/* ---------- field: PLC ---------- */}
      <Box x={20} y={140} w={130} h={90} />
      <rect x={30} y={150} width={44} height={70} rx={3} fill={C.bg} stroke={C.lineHi} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <circle cx={40} cy={160 + i * 10} r={2} fill={i % 3 === 0 ? C.crimson : C.teal} className="animate-led" style={{ animationDelay: `${i * 0.35}s` }} />
          <rect x={47} y={158 + i * 10} width={20} height={3} rx={1} fill={C.line} />
        </g>
      ))}
      <Label x={82} y={165} color={C.strong}>PLC</Label>
      <Label x={82} y={178}>DI / AI</Label>
      <Label x={82} y={191}>MODBUS</Label>
      <rect x={82} y={202} width={56} height={14} rx={2} fill={C.bg} stroke={C.line} />
      <text x={110} y={212} fill={C.teal} fontFamily="JetBrains Mono, monospace" fontSize={8} textAnchor="middle">
        RUN
      </text>

      {/* ---------- field: GPS tracker ---------- */}
      <Box x={20} y={260} w={130} h={70} />
      <rect x={34} y={284} width={30} height={22} rx={4} fill={C.bg} stroke={C.lineHi} />
      <circle cx={49} cy={295} r={3} fill={C.teal} />
      {[10, 17, 24].map((r, i) => (
        <path
          key={r}
          d={`M${49 - r * 0.7} ${284 - r * 0.2} A ${r} ${r} 0 0 1 ${49 + r * 0.7} ${284 - r * 0.2}`}
          fill="none"
          stroke={C.teal}
          strokeOpacity={0.7}
          className="animate-node-pulse"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
      <Label x={76} y={290} color={C.strong}>GPS</Label>
      <Label x={76} y={303}>AVL · CAN</Label>
      <Led x={138} y={272} ping />

      {/* ---------- field: camera ---------- */}
      <Box x={20} y={360} w={130} h={70} />
      <path d="M34 384 h28 l8 -5 v22 l-8 -5 h-28 z" fill={C.bg} stroke={C.lineHi} />
      <circle cx={47} cy={390} r={5} fill="none" stroke={C.text} />
      <circle cx={47} cy={390} r={2} fill={C.crimson} className="animate-led" />
      <Label x={80} y={388} color={C.strong}>CAMERA</Label>
      <Label x={80} y={401}>RTSP · ANPR</Label>

      {/* ---------- edge gateway ---------- */}
      <g>
        {[...Array(7)].map((_, i) => (
          <g key={i}>
            <rect x={240 + i * 16} y={156} width={6} height={10} fill={C.lineHi} />
            <rect x={240 + i * 16} y={328} width={6} height={10} fill={C.lineHi} />
          </g>
        ))}
        <rect x={232} y={166} width={130} height={162} rx={8} fill={C.panel} stroke={C.teal} strokeOpacity={0.75} />
        <rect x={244} y={178} width={106} height={138} rx={4} fill={C.bg} stroke={C.line} />
        <Label x={297} y={196} anchor="middle" color={C.strong}>EDGE GATEWAY</Label>
        <Label x={297} y={210} anchor="middle">LOCAL LOGIC</Label>
        {/* buffer meter */}
        <Label x={254} y={234}>BUFFER</Label>
        <rect x={254} y={240} width={86} height={8} rx={2} fill={C.panel} stroke={C.line} />
        <rect x={255} y={241} width={52} height={6} rx={1.5} fill={C.teal} opacity={0.85}>
          {!reduced ? <animate attributeName="width" values="12;70;30;52;12" dur="7s" repeatCount="indefinite" /> : null}
        </rect>
        {/* node graph */}
        <g stroke={C.lineHi} fill="none">
          <path d="M262 278 L290 266 L318 284 L336 270" />
          <path d="M290 266 L300 296" />
        </g>
        {[
          [262, 278],
          [290, 266],
          [318, 284],
          [336, 270],
          [300, 296],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.2} fill={i === 1 ? C.teal : C.panel} stroke={C.teal} className={i === 1 ? 'animate-node-pulse' : undefined} />
        ))}
        <Led x={254} y={306} r={2} />
        <Led x={264} y={306} r={2} blink />
        <Led x={274} y={306} r={2} color={C.crimson} />
      </g>

      {/* uplink label */}
      <rect x={366} y={140} width={48} height={16} rx={3} fill={C.bg} stroke={C.line} />
      <Label x={390} y={151} anchor="middle" color={C.teal}>MQTT</Label>

      {/* ---------- cloud backend ---------- */}
      <Box x={420} y={40} w={160} h={92} accent />
      <Label x={432} y={58} color={C.strong}>CLOUD BACKEND</Label>
      <Label x={432} y={71}>API · QUEUE · AUDIT</Label>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${440 + i * 40} 84)`}>
          <ellipse cx={12} cy={4} rx={12} ry={4} fill={C.bg} stroke={C.lineHi} />
          <path d="M0 4 v24 a12 4 0 0 0 24 0 v-24" fill={C.bg} stroke={C.lineHi} />
          <path d="M0 13 a12 4 0 0 0 24 0" fill="none" stroke={C.line} />
          <circle cx={19} cy={22} r={1.6} fill={C.teal} className="animate-led" style={{ animationDelay: `${i * 0.7}s` }} />
        </g>
      ))}

      {/* ---------- dashboard ---------- */}
      <Box x={400} y={230} w={180} h={172} accent />
      <rect x={400} y={230} width={180} height={18} rx={6} fill={C.bg} opacity={0.6} />
      <Label x={410} y={242} color={C.strong}>LIVE DASHBOARD</Label>
      <Led x={568} y={239} r={2} ping />
      {/* line chart */}
      <defs>
        <clipPath id="hero-chart-clip">
          <rect x={410} y={256} width={160} height={58} />
        </clipPath>
        <linearGradient id="hero-chart-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={C.teal} stopOpacity={0.3} />
          <stop offset="1" stopColor={C.teal} stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={410} y={256} width={160} height={58} fill={C.bg} />
      {[270, 285, 300].map((y) => (
        <line key={y} x1={410} x2={570} y1={y} y2={y} stroke={C.line} strokeDasharray="2 3" />
      ))}
      <g clipPath="url(#hero-chart-clip)">
        <g>
          <path
            d="M410 300 L430 292 L450 296 L470 280 L490 286 L510 270 L530 278 L550 266 L570 274 L590 300 L610 292 L630 296 L650 280 L670 286 L690 270 L710 278 L730 266 L750 274 L770 300 V314 H410 Z"
            fill="url(#hero-chart-fill)"
          />
          <path
            d="M410 300 L430 292 L450 296 L470 280 L490 286 L510 270 L530 278 L550 266 L570 274 L590 300 L610 292 L630 296 L650 280 L670 286 L690 270 L710 278 L730 266 L750 274 L770 300"
            fill="none"
            stroke={C.teal}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {!reduced ? <animateTransform attributeName="transform" type="translate" values="0 0;-180 0" dur="9s" repeatCount="indefinite" /> : null}
        </g>
      </g>
      {/* gauge */}
      <path d="M418 382 A 28 28 0 0 1 474 382" fill="none" stroke={C.line} strokeWidth={6} strokeLinecap="round" />
      <path d="M418 382 A 28 28 0 0 1 462 360" fill="none" stroke={C.teal} strokeWidth={6} strokeLinecap="round" />
      <g>
        <line x1={446} y1={382} x2={446} y2={360} stroke={C.strong} strokeWidth={1.6} strokeLinecap="round" />
        {!reduced ? <animateTransform attributeName="transform" type="rotate" values="-60 446 382;35 446 382;10 446 382;-60 446 382" dur="8s" repeatCount="indefinite" /> : null}
      </g>
      <circle cx={446} cy={382} r={3} fill={C.strong} />
      {/* bars */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={492 + i * 12}
          y={340}
          width={7}
          height={44}
          rx={1.5}
          fill={i === 4 ? C.crimson : C.teal}
          opacity={0.85}
          className="animate-bar"
          style={{ animationDelay: `${i * 0.25}s`, animationDuration: `${2 + (i % 3) * 0.6}s` }}
        />
      ))}
      <line x1={488} x2={570} y1={384} y2={384} stroke={C.lineHi} />

      {/* ---------- operator ---------- */}
      <rect x={430} y={432} width={120} height={30} rx={6} fill={C.panel} stroke={C.crimson} strokeOpacity={0.7} />
      <Led x={446} y={447} color={C.crimson} blink />
      <Label x={458} y={450} color={C.strong}>OPERATOR ACTION</Label>

      {/* tag */}
      <Label x={20} y={460}>ILLUSTRATIVE — NOT A LIVE FEED</Label>
    </svg>
  );
}
