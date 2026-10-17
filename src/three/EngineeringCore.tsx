import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Pure decoration: this scene conveys nothing that isn't already in the
 * hero text beside it (see CommandCenter.tsx). Losing it (gate failure,
 * slow device, reduced motion) only swaps in the static SVG core.
 *
 * Composition: a lattice sphere around a glowing core, three tilted
 * orbital rings carrying field/edge nodes, spokes with data pulses
 * running between the nodes and the core, and a sparse particle shell.
 * The whole rig tilts gently toward the pointer.
 */

const TEAL = new THREE.Color('#49D7B1');
const CRIMSON = new THREE.Color('#DA3633');
const LINE = new THREE.Color('#2B3A4A');
const TEXT = new THREE.Color('#A9B7C6');

interface Orbit {
  radiusX: number;
  radiusZ: number;
  tilt: THREE.Euler;
  speed: number;
  nodes: number[];
}

const ORBITS: Orbit[] = [
  { radiusX: 3.1, radiusZ: 3.1, tilt: new THREE.Euler(1.2, 0, 0.25), speed: 0.12, nodes: [0, 0.33, 0.66] },
  { radiusX: 3.6, radiusZ: 3.0, tilt: new THREE.Euler(0.4, 0.3, -0.5), speed: -0.08, nodes: [0.1, 0.55] },
  { radiusX: 2.6, radiusZ: 2.6, tilt: new THREE.Euler(-0.9, 0.6, 0.9), speed: 0.16, nodes: [0.2, 0.5, 0.85] },
];

interface NodeRef {
  orbit: number;
  phase: number;
  accent: boolean;
}

const NODES: NodeRef[] = ORBITS.flatMap((orbit, orbitIndex) =>
  orbit.nodes.map((phase, i) => ({ orbit: orbitIndex, phase, accent: (orbitIndex + i) % 3 === 1 })),
);

const tmp = new THREE.Vector3();

function orbitPoint(orbit: Orbit, t: number, out: THREE.Vector3): THREE.Vector3 {
  const angle = t * Math.PI * 2;
  out.set(Math.cos(angle) * orbit.radiusX, 0, Math.sin(angle) * orbit.radiusZ);
  return out.applyEuler(orbit.tilt);
}

function nodePosition(node: NodeRef, time: number, out: THREE.Vector3): THREE.Vector3 {
  const orbit = ORBITS[node.orbit]!;
  return orbitPoint(orbit, node.phase + time * orbit.speed * 0.25, out);
}

function OrbitRings() {
  const geometries = useMemo(
    () =>
      ORBITS.map((orbit) => {
        const points: THREE.Vector3[] = [];
        for (let i = 0; i <= 128; i += 1) points.push(orbitPoint(orbit, i / 128, new THREE.Vector3()));
        return new THREE.BufferGeometry().setFromPoints(points);
      }),
    [],
  );

  return (
    <group>
      {geometries.map((geometry, index) => (
        <lineLoop key={index} geometry={geometry}>
          <lineBasicMaterial color={index === 1 ? TEAL : LINE} transparent opacity={index === 1 ? 0.35 : 0.9} toneMapped={false} />
        </lineLoop>
      ))}
    </group>
  );
}

function OrbitNodes() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const haloRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    const halo = haloRef.current;
    if (!mesh || !halo) return;
    const t = state.clock.elapsedTime;
    NODES.forEach((node, index) => {
      nodePosition(node, t, dummy.position);
      dummy.scale.setScalar(node.accent ? 0.13 : 0.09);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, node.accent ? CRIMSON : TEAL);
      const pulse = 1 + Math.sin(t * 2 + index) * 0.15;
      dummy.scale.setScalar((node.accent ? 0.34 : 0.26) * pulse);
      dummy.updateMatrix();
      halo.setMatrixAt(index, dummy.matrix);
      halo.setColorAt(index, node.accent ? CRIMSON : TEAL);
    });
    mesh.instanceMatrix.needsUpdate = true;
    halo.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (halo.instanceColor) halo.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, NODES.length]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={haloRef} args={[undefined, undefined, NODES.length]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** Spokes from each orbit node to the core, with pulses running along them. */
function Spokes() {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NODES.length * 6), 3));
    return geo;
  }, []);
  const pulseRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const pulses = pulseRef.current;
    NODES.forEach((node, index) => {
      nodePosition(node, t, tmp);
      attr.setXYZ(index * 2, 0, 0, 0);
      attr.setXYZ(index * 2 + 1, tmp.x, tmp.y, tmp.z);
      if (pulses) {
        // even nodes send data in, odd nodes receive data out
        const raw = (t * 0.45 + index * 0.37) % 1;
        const progress = index % 2 === 0 ? 1 - raw : raw;
        dummy.position.copy(tmp).multiplyScalar(progress);
        dummy.scale.setScalar(0.045 + Math.sin(raw * Math.PI) * 0.035);
        dummy.updateMatrix();
        pulses.setMatrixAt(index, dummy.matrix);
      }
    });
    attr.needsUpdate = true;
    if (pulses) pulses.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={TEAL} transparent opacity={0.16} toneMapped={false} />
      </lineSegments>
      <instancedMesh ref={pulseRef} args={[undefined, undefined, NODES.length]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={TEAL} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

function Lattice() {
  const ref = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.55, 2)), []);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.08;
      ref.current.rotation.x += delta * 0.03;
    }
  });
  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial color={TEAL} transparent opacity={0.22} toneMapped={false} />
    </lineSegments>
  );
}

function Core() {
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (glowRef.current) glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.06);
  });
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.42, 3]} />
        <meshBasicMaterial color={TEAL} toneMapped={false} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.1} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.25, 32, 32]} />
        <meshBasicMaterial color={TEAL} transparent opacity={0.035} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    // deterministic pseudo-random so the composition is stable per load
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < count; i += 1) {
      const r = 4.2 + rand() * 2.6;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.7;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y -= delta * 0.015;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color={TEXT} size={0.028} sizeAttenuation transparent opacity={0.55} depthWrite={false} toneMapped={false} />
    </points>
  );
}

function Rig() {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const k = Math.min(1, delta * 2.5);
    group.rotation.y += (pointer.current.x * 0.35 - group.rotation.y) * k;
    group.rotation.x += (pointer.current.y * 0.2 + 0.15 - group.rotation.x) * k;
  });

  return (
    <group ref={groupRef}>
      <Particles />
      <Lattice />
      <Core />
      <OrbitRings />
      <Spokes />
      <OrbitNodes />
    </group>
  );
}

/** Pauses the render loop while the tab is hidden or the canvas is off-screen. */
function useShouldRender(target: RefObject<HTMLDivElement>): boolean {
  const [visible, setVisible] = useState(() => (typeof document === 'undefined' ? true : document.visibilityState === 'visible'));
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const handler = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  useEffect(() => {
    const el = target.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) setInView(entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return visible && inView;
}

export default function EngineeringCoreComponent() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const run = useShouldRender(wrapRef);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={run ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        camera={{ position: [0, 0.6, 10.5], fov: 42 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Rig />
      </Canvas>
    </div>
  );
}
