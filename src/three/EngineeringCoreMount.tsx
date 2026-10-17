import { lazy, Suspense, useState } from 'react';
import { canRunEngineeringCore } from './capability';
import CoreFallback from './CoreFallback';
import LiveRegion from '../components/LiveRegion';

// Lazy + code-split: the R3F scene (three + @react-three/fiber) lives in
// its own chunk and is never part of the initial JS bundle.
const EngineeringCore = lazy(() => import('./EngineeringCore'));

/**
 * Hero visual. Always renders the static SVG core (a finished design on
 * its own); when the capability gate passes, the WebGL Engineering Core
 * lazy-loads and replaces it. Decorative only (aria-hidden).
 */
export default function EngineeringCoreMount() {
  const [capable] = useState(canRunEngineeringCore);

  return (
    <LiveRegion className="pointer-events-none absolute inset-0">
      {capable ? (
        <div id="engineering-core-mount" className="absolute inset-0">
          <Suspense fallback={<CoreFallback />}>
            <EngineeringCore />
          </Suspense>
        </div>
      ) : (
        <CoreFallback />
      )}
      <CoreHud />
    </LiveRegion>
  );
}

/** HUD corner brackets and labels framing the core (both modes). */
function CoreHud() {
  return (
    <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
      <g fill="none" stroke="#49D7B1" strokeOpacity="0.5" strokeWidth="1">
        <path d="M14 46 V14 H46" />
        <path d="M354 14 H386 V46" />
        <path d="M386 354 V386 H354" />
        <path d="M46 386 H14 V354" />
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="1.5" fill="#A9B7C6">
        <text x="24" y="34">ENGINEERING CORE</text>
        <text x="376" y="34" textAnchor="end" fill="#49D7B1">
          EDGE ⟷ CLOUD
        </text>
        <text x="24" y="374">FIELD · EDGE · DATA · AI</text>
      </g>
      <circle cx="372" cy="370" r="3" fill="#DA3633" className="animate-led" />
    </svg>
  );
}
