import { lazy, Suspense, useState } from 'react';
import { canRunEngineeringCore } from './capability';

// Lazy + code-split: the R3F scene (three + @react-three/fiber) lives in
// its own chunk and is never part of the initial JS bundle.
const EngineeringCore = lazy(() => import('./EngineeringCore'));

/**
 * Mount point for the 3D "Engineering Core". The hero (CommandCenter)
 * already renders a complete, polished static SVG/CSS fallback regardless
 * of what happens here — this component only decides whether to
 * additionally lazy-load the 3D enhancement on top of it.
 *
 * This app is a client-only SPA (no SSR), so it's safe to read
 * capability synchronously via a lazy useState initializer rather than an
 * effect — there is no server-rendered markup to mismatch against.
 */
export default function EngineeringCoreMount() {
  const [capable] = useState(canRunEngineeringCore);

  if (!capable) return null;

  return (
    <div id="engineering-core-mount" aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Suspense fallback={null}>
        <EngineeringCore />
      </Suspense>
    </div>
  );
}
