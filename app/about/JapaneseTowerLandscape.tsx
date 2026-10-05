'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Japanese Tenshu (castle tower) ───────────────────────────────────
// Brief: ishigaki stone base, plastered storeys, flying tiled eaves.
// Self-contained — no external ThreeUI dependency required.

function Tenshu({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const tileRefs = useRef<(THREE.Mesh | null)[]>([])

  const tileGeom = useMemo(() => new THREE.BoxGeometry(0.12, 0.06, 0.28), [])
  const tileMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2a3a5c',
    roughness: 0.55,
    metalness: 0.2,
  }), [])
  const plasterMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f5f0e8',
    roughness: 0.92,
    metalness: 0.0,
  }), [])
  const stoneMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4a4a4a',
    roughness: 0.95,
    metalness: 0.05,
  }), [])
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3d2817',
    roughness: 0.7,
    metalness: 0.05,
  }), [])
  const roofMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a2a4a',
    roughness: 0.4,
    metalness: 0.3,
  }), [])

  // Build a row of flying tiled eaves
  const EaveRow = ({ y, width, depth }: { y: number; width: number; depth: number }) => {
    const tiles = useMemo(() => {
      const count = Math.floor(width / 0.12)
      const arr: { x: number; z: number }[] = []
      for (let i = 0; i < count; i++) {
        const x = -width / 2 + 0.06 + i * 0.12
        // Curve outwards at the edges
        const edgeFactor = Math.abs(i / count - 0.5) * 2
        const z = depth / 2 + edgeFactor * 0.18
        arr.push({ x, z })
      }
      return arr
    }, [width, depth])

    return (
      <group position={[0, y, 0]}>
        {tiles.map(({ x, z }, i) => (
          <mesh
            key={i}
            ref={(el) => { tileRefs.current[i] = el }}
            position={[x, 0, z]}
            geometry={tileGeom}
            material={tileMat}
            castShadow
          />
        ))}
      </group>
    )
  }

  // One plastered storey with windows
  function Storey({ y, w, h, d }: { y: number; w: number; h: number; d: number }) {
    return (
      <group position={[0, y, 0]}>
        {/* Walls */}
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <primitive object={plasterMat.clone()} attach="material" />
          <meshStandardMaterial color="#f5f0e8" roughness={0.92} metalness={0} />
        </mesh>
        {/* Window mullions (4 per face) */}
        {[-1, 1].flatMap(side =>
          [-1, 1].map(frontBack => (
            <mesh key={`${side}${frontBack}`} position={[side * w * 0.5, 0, frontBack * d * 0.5]} rotation={[0, frontBack > 0 ? 0 : Math.PI, 0]}>
              <planeGeometry args={[w * 0.7, h * 0.6]} />
              <meshBasicMaterial color="#2a1f18" transparent opacity={0.6} />
            </mesh>
          ))
        )}
      </group>
    )
  }

  return (
    <group ref={groupRef} position={[0, -0.3, -0.8]} scale={0.9}>
      {/* ── Ishigaki stone base ── */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.6, 2.0]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.95} metalness={0.05} />
        </mesh>
        {/* Stone texture rows */}
        {Array.from({ length: 4 }).map((_, row) => (
          <mesh key={row} position={[0, 0.08 + row * 0.13, 1.01]}>
            <planeGeometry args={[2.35, 0.1]} />
            <meshStandardMaterial color="#555" roughness={0.95} transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      {/* ── Storey 1 (widest) ── */}
      <Storey y={0.75} w={1.9} h={0.7} d={1.4} />
      <EaveRow y={1.12} width={2.1} depth={1.6} />

      {/* ── Storey 2 ── */}
      <Storey y={1.45} w={1.5} h={0.65} d={1.1} />
      <EaveRow y={1.80} width={1.7} depth={1.3} />

      {/* ── Storey 3 ── */}
      <Storey y={2.10} w={1.1} h={0.6} d={0.85} />
      <EaveRow y={2.42} width={1.3} depth={1.05} />

      {/* ── Top roof (tiles curve inwards) ── */}
      <mesh position={[0, 2.82, 0]} castShadow>
        <coneGeometry args={[0.75, 0.5, 4]} />
        <meshStandardMaterial color="#1a2a4a" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* ── Golden finial (shin) ── */}
      <mesh position={[0, 3.15, 0]}>
        <cylinderGeometry args={[0.03, 0.06, 0.4, 8]} />
        <meshStandardMaterial color="#c9a962" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* ── Stone base capping (shōtō-zuka style corner stones) ── */}
      {[[-1.2, 0.65, -0.9], [1.2, 0.65, -0.9], [-1.2, 0.65, 0.9], [1.2, 0.65, 0.9]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#5a5a5a" roughness={0.9} metalness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

// ─── About Scene wrapper ──────────────────────────────────────────────

export default function JapaneseTowerLandscape() {
  return (
    <div className="shader-frame" style={{ width: '100%', height: '100%' }}>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.2, 5.5], fov: 42, near: 0.1, far: 80 }}
      >
        <ambientLight intensity={0.5} color="#1a1a2e" />
        <directionalLight position={[5, 7, 4]} intensity={1.6} color="#ffe4c4" castShadow
          shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />
        <pointLight color="#c9a962" intensity={0.6} position={[-3, 2, -1]} />
        <fog attach="fog" args={['#080808', 4, 20]} />
        <Tenshu scrollProgress={0.5} />
      </Canvas>
    </div>
  )
}
