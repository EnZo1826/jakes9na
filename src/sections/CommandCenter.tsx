import { getProfile } from '../content/loader';
import GridBackdrop from '../components/GridBackdrop';
import StatusLed from '../components/StatusLed';
import EngineeringCoreMount from '../three/EngineeringCoreMount';

/**
 * Hero section. This static SVG/CSS layout IS the real, finished content —
 * the future 3D "Engineering Core" (see src/three/) is an enhancement that
 * layers on top via EngineeringCoreMount, never a replacement this section
 * depends on.
 */
export default function CommandCenter() {
  const profile = getProfile();

  return (
    <section
      id="command-center"
      aria-labelledby="command-center-heading"
      className="relative flex min-h-[90vh] items-center overflow-hidden border-b border-line"
    >
      <GridBackdrop />
      <EngineeringCoreMount />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24">
        <div className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-teal">
          <StatusLed tone="teal" />
          <span>{profile.location}</span>
          <span className="text-line">/</span>
          <span>{profile.timezone}</span>
        </div>

        <h1 id="command-center-heading" className="text-5xl font-bold text-text-strong sm:text-7xl">
          {profile.brand}
        </h1>

        <p className="mt-4 max-w-2xl font-mono text-sm uppercase tracking-widest text-text">
          {profile.role_line}
        </p>

        <p className="mt-8 max-w-2xl text-lg text-text-strong sm:text-xl">{profile.core_message}</p>

        <div className="mt-10 inline-block border border-line bg-panel px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-crimson-text">{profile.tagline}</p>
        </div>
      </div>
    </section>
  );
}
