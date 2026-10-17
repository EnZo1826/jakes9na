import { prefersReducedMotion } from '../hooks/useReducedMotion';

interface NavigatorConnection {
  saveData?: boolean;
}

type NavigatorWithConnection = Navigator & {
  connection?: NavigatorConnection;
};

function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}

/**
 * Gate for whether the (future) 3D Engineering Core may mount at all.
 * The hero's static SVG/CSS fallback is a complete, finished design on its
 * own — this only controls whether the lazy 3D enhancement layers on top.
 * Per the plan: skip 3D if the user prefers reduced motion, if there is no
 * WebGL, on low-core-count devices, or when the browser signals save-data.
 */
export function canRunEngineeringCore(): boolean {
  if (typeof window === 'undefined') return false;
  if (prefersReducedMotion()) return false;
  if (!hasWebGL()) return false;

  const nav = window.navigator as NavigatorWithConnection;
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return false;
  if (nav.connection?.saveData) return false;

  return true;
}
