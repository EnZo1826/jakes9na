import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Pure decoration: this scene conveys nothing that isn't already in the
 * static hero text next to it (see CommandCenter.tsx). No label, count or
 * state lives only in the 3D canvas, so losing it (gate failure, slow
 * device, reduced motion) never loses information — only atmosphere.
 */

const TEAL = new THREE.Color('#49D7B1');
const CRIMSON = new THREE.Color('#DA3633');
const LINE = new THREE.Color('#1F2A36');

const RING_COUNT = 3;
const NODES_PER_RING = 5;

interface NodeSpec {
  ring: number;
  angle: number;
  radius: number;
  height: number;
  accent: boolean;
}

function buildNodes(): NodeSpec[] {
  const nodes: NodeSpec[] = [];
  for (let ring = 0; ring < RING_COUNT; ring += 1) {
    const radius = 1.6 + ring * 1.1;
    for (let i = 0; i < NODES_PER_RING; i += 1) {
      const angle = (i / NODES_PER_RING) * Math.PI * 2 + ring * 0.6;
      nodes.push({
        ring,
        angle,
        radius,
        height: Math.sin(ring * 1.7 + i * 0.9) * 0.6,
        accent: (ring + i) % 4 === 0,
      });
    }
  }
  return nodes;
}

function nodePosition(node: NodeSpec, t: number): THREE.Vector3 {
  const speed = 0.08 - node.ring * 0.015;
  const angle = node.angle + t * speed;
  return new THREE.Vector3(Math.cos(angle) * node.radius, node.height, Math.sin(angle) * node.radius);
}

function Nodes({ nodes }: { nodes: NodeSpec[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    nodes.forEach((node, index) => {
      const position = nodePosition(node, t);
      dummy.position.copy(position);
      dummy.scale.setScalar(node.accent ? 0.11 : 0.07);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, node.accent ? CRIMSON : TEAL);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, nodes.length]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function ConnectionLines({ nodes }: { nodes: NodeSpec[] }) {
  const lineRef = useRef<THREE.LineSegments>(null);

  const pairs = useMemo(() => {
    const result: [number, number][] = [];
    for (let ring = 0; ring < RING_COUNT; ring += 1) {
      for (let i = 0; i < NODES_PER_RING; i += 1) {
        const a = ring * NODES_PER_RING + i;
        const b = ring * NODES_PER_RING + ((i + 1) % NODES_PER_RING);
        result.push([a, b]);
      }
    }
    for (let i = 0; i < NODES_PER_RING; i += 1) {
      result.push([i, NODES_PER_RING + i]);
      result.push([NODES_PER_RING + i, NODES_PER_RING * 2 + i]);
    }
    return result;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(pairs.length * 2 * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [pairs]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    pairs.forEach(([a, b], index) => {
      const pa = nodePosition(nodes[a]!, t);
      const pb = nodePosition(nodes[b]!, t);
      positionAttr.setXYZ(index * 2, pa.x, pa.y, pa.z);
      positionAttr.setXYZ(index * 2 + 1, pb.x, pb.y, pb.z);
    });
    positionAttr.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color={LINE} transparent opacity={0.5} toneMapped={false} />
    </lineSegments>
  );
}

interface Pulse {
  from: number;
  to: number;
  offset: number;
}

function DataPulses({ nodes, pulses }: { nodes: NodeSpec[]; pulses: Pulse[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    pulses.forEach((pulse, index) => {
      const progress = ((t * 0.25 + pulse.offset) % 1 + 1) % 1;
      const from = nodePosition(nodes[pulse.from]!, t);
      const to = nodePosition(nodes[pulse.to]!, t);
      const position = from.clone().lerp(to, progress);
      dummy.position.copy(position);
      const fade = Math.sin(progress * Math.PI);
      dummy.scale.setScalar(0.045 * (0.4 + fade));
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, pulses.length]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={TEAL} toneMapped={false} />
    </instancedMesh>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => buildNodes(), []);
  const pulses = useMemo<Pulse[]>(
    () => [
      { from: 0, to: 1, offset: 0 },
      { from: 5, to: 6, offset: 0.3 },
      { from: 10, to: 11, offset: 0.6 },
      { from: 0, to: 5, offset: 0.15 },
      { from: 5, to: 10, offset: 0.45 },
      { from: 2, to: 7, offset: 0.75 },
    ],
    [],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (group) group.rotation.y += delta * 0.02;
  });

  return (
    <group ref={groupRef}>
      <Nodes nodes={nodes} />
      <ConnectionLines nodes={nodes} />
      <DataPulses nodes={nodes} pulses={pulses} />
    </group>
  );
}

/** Pauses the render loop while the tab is hidden — a background tab has no
 * need to keep spending CPU/GPU on a purely decorative canvas. */
function useTabVisible(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handler = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  return visible;
}

export default function EngineeringCoreComponent() {
  const visible = useTabVisible();

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={visible ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 1.4, 7.5], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene />
    </Canvas>
  );
}
