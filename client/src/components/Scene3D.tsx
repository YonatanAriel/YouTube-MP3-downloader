import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleSwarm() {
  const ref = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  
  const sphere = useMemo(() => {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 8 + Math.random() * 4;
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (ref.current) {
      ref.current.rotation.x = timeRef.current * 0.05;
      ref.current.rotation.y = timeRef.current * 0.075;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#8b5cf6"
          size={0.06}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>
    </group>
  );
}

function FloatingTorus() {
  const ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (ref.current) {
      ref.current.rotation.x = timeRef.current * 0.1;
      ref.current.rotation.y = timeRef.current * 0.15;
      ref.current.position.y = Math.sin(timeRef.current * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={[3, 1, -2]}>
      <torusGeometry args={[1.5, 0.4, 16, 100]} />
      <meshPhysicalMaterial
        color="#a855f7"
        roughness={0.1}
        metalness={0.1}
        transmission={0.6}
        thickness={1.2}
        clearcoat={1}
      />
    </mesh>
  );
}

function AmbientGlow() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} color="#ec4899" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
    </>
  );
}

export default function Scene3D() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'radial-gradient(circle at center, #0f0c1b 0%, #050209 100%)', pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <AmbientGlow />
        <ParticleSwarm />
        <FloatingTorus />
      </Canvas>
    </div>
  );
}
