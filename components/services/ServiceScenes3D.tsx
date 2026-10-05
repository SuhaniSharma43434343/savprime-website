'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────
   LIGHTING — each scene gets its own rig, all bright enough
   to read the geometry clearly against the #070709 background.
   ───────────────────────────────────────────────────────────── */
const LIGHTS: Record<string, () => JSX.Element> = {
  FREIGHT: () => (
    <>
      <ambientLight intensity={0.6} color="#1a1a2e" />
      <directionalLight position={[5, 7, 4]} intensity={3.5} color="#ffe4b5" />
      <directionalLight position={[-4, 3, -3]} intensity={1.2} color="#7a90b8" />
      <pointLight position={[0, 2.5, 3]} intensity={1.4} color="#ffd97a" distance={18} />
      <pointLight position={[-3, 0.5, -2]} intensity={0.7} color="#4a6fa5" distance={14} />
      <hemisphereLight color="#3a4a6a" groundColor="#080810" intensity={0.5} />
    </>
  ),
  WAREHOUSING: () => (
    <>
      <ambientLight intensity={0.55} color="#1c1a14" />
      <directionalLight position={[5, 7, 4]} intensity={3.4} color="#ffe4b5" />
      <directionalLight position={[-3, 5, -2]} intensity={1.3} color="#c9a962" />
      <pointLight position={[0, 3.5, 0]} intensity={1.2} color="#c9a962" distance={16} />
      <pointLight position={[-2, 1.5, 3]} intensity={0.6} color="#ffd97a" distance={12} />
      <hemisphereLight color="#2a2418" groundColor="#050505" intensity={0.45} />
    </>
  ),
  CUSTOMS: () => (
    <>
      <ambientLight intensity={0.5} color="#161a24" />
      <directionalLight position={[4, 6, 4]} intensity={3.0} color="#e0f0ff" />
      <directionalLight position={[-3, 3, -2]} intensity={1.1} color="#4ac9c9" />
      <pointLight position={[0, 0.5, 0]} intensity={2.0} color="#4ac9c9" distance={10} />
      <pointLight position={[2, 3, 2]} intensity={0.9} color="#c9a962" distance={12} />
      <hemisphereLight color="#1a2838" groundColor="#0a0a14" intensity={0.4} />
    </>
  ),
  SUPPLY_CHAIN: () => (
    <>
      <ambientLight intensity={0.55} color="#121828" />
      <directionalLight position={[5, 6, 3]} intensity={3.2} color="#ffe4b5" />
      <directionalLight position={[-3, 3, -3]} intensity={1.0} color="#4a6fa5" />
      <pointLight position={[0, 0, 0]} intensity={1.6} color="#c9a962" distance={14} />
      <pointLight position={[3, 2, -2]} intensity={0.7} color="#ffd97a" distance={10} />
      <hemisphereLight color="#1a2a40" groundColor="#050510" intensity={0.45} />
    </>
  ),
  LAST_MILE: () => (
    <>
      <ambientLight intensity={0.55} color="#1c1814" />
      <directionalLight position={[5, 6, 4]} intensity={3.5} color="#ffe4b5" />
      <directionalLight position={[-3, 3, -2]} intensity={1.1} color="#c9a962" />
      <pointLight position={[1.5, 0.8, 1.5]} intensity={1.4} color="#ffd97a" distance={12} />
      <pointLight position={[3, 1.5, -1]} intensity={0.6} color="#ff9944" distance={10} />
      <hemisphereLight color="#2a2018" groundColor="#080808" intensity={0.4} />
    </>
  ),
}

/* ─────────────────────────────────────────────────────────────
   CAMERA — gentle mouse parallax, cinematic framing.
   ───────────────────────────────────────────────────────────── */
function ParallaxCamera() {
  const ref = useRef<THREE.PerspectiveCamera>(null)
  const tPos = useRef(new THREE.Vector3(0, 0.35, 5.0))
  const tLook = useRef(new THREE.Vector3(0, 0, 0))
  const prevX = useRef(0)

  useFrame((state, delta) => {
    const cam = ref.current
    if (!cam) return
    const t = state.clock.elapsedTime
    const p = state.pointer

    const px = p.x * 0.18 + Math.sin(t * 0.35) * 0.02
    const py = p.y * 0.12 + Math.cos(t * 0.3) * 0.018

    tPos.current.set(px * 0.4, 0.35 + py * 0.25, 5.0)
    tLook.current.set(px * 0.15, py * 0.1, 0)

    const d = Math.min(0.05, Math.max(0.008, delta))
    cam.position.x = THREE.MathUtils.damp(cam.position.x, tPos.current.x, 3.2, d)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, tPos.current.y, 3.2, d)
    cam.position.z = THREE.MathUtils.damp(cam.position.z, tPos.current.z, 3.2, d)
    cam.lookAt(tLook.current)

    const vx = (cam.position.x - prevX.current) / d
    prevX.current = cam.position.x
    cam.rotation.z = THREE.MathUtils.damp(cam.rotation.z, -THREE.MathUtils.clamp(vx * 0.01, -0.025, 0.025), 3.0, d)
  })

  return <perspectiveCamera ref={ref} position={[0, 0.35, 5.0]} fov={46} near={0.1} far={80} />
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */

// Visible pedestal ring that grounds each model
function PedestalRing({ radius = 1.4 }: { radius?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]}>
      <ringGeometry args={[radius * 0.3, radius, 64]} />
      <meshBasicMaterial color="#c9a962" transparent opacity={0.06} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Thin warm edge-line on the floor for cinematic grounding
function GroundLine({ length = 5, y = -1.14 }: { length?: number; y?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[length, 0.012]} />
      <meshBasicMaterial color="#c9a962" transparent opacity={0.1} />
    </mesh>
  )
}

// Shared dust particles
function Dust({ count = 50, color = '#c9a962', range = 5, opacity = 0.18 }: {
  count?: number; color?: string; range?: number; opacity?: number
}) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * range
      a[i * 3 + 1] = Math.random() * 3.5 - 0.5
      a[i * 3 + 2] = (Math.random() - 0.5) * range
    }
    return a
  }, [count, range])

  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.0004 })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.02} transparent opacity={opacity} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ─────────────────────────────────────────────────────────────
   SERVICE A — FREIGHT: Handymax bulk carrier
   ───────────────────────────────────────────────────────────── */
function FreightScene({ alpha }: { alpha: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const radarRef = useRef<THREE.Mesh>(null)
  const waterRef = useRef<THREE.Mesh>(null)
  const sweepRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.1
    if (radarRef.current) {
      radarRef.current.rotation.z = t * 0.7
      radarRef.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.03)
    }
    if (waterRef.current) {
      waterRef.current.position.y = -0.88 + Math.sin(t * 0.6) * 0.03
    }
    if (sweepRef.current) {
      sweepRef.current.rotation.z = -t * 0.5
    }
  })

  return (
    <group visible={alpha > 0.005}>
      <PedestalRing />
      <GroundLine />

      {/* Water plane */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.88, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0a1a30" roughness={0.12} metalness={0.55} transparent opacity={alpha * 0.7} />
      </mesh>

      <group ref={groupRef}>
        {/* Hull — main body */}
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[2.8, 1.0, 1.1]} />
          <meshStandardMaterial color="#1a1a26" roughness={0.3} metalness={0.8} transparent opacity={alpha * 0.95} />
        </mesh>

        {/* Hull gold stripe */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[2.85, 0.07, 1.15]} />
          <meshStandardMaterial color="#c9a962" roughness={0.25} metalness={0.7} transparent opacity={alpha * 0.92} />
        </mesh>

        {/* Bow */}
        <mesh position={[1.65, -0.04, 0]}>
          <boxGeometry args={[0.6, 0.9, 1.05]} />
          <meshStandardMaterial color="#16161f" roughness={0.3} metalness={0.8} transparent opacity={alpha * 0.95} />
        </mesh>

        {/* Bridge superstructure */}
        <mesh position={[-0.7, 0.75, 0]}>
          <boxGeometry args={[1.0, 0.8, 0.75]} />
          <meshStandardMaterial color="#242430" roughness={0.25} metalness={0.75} transparent opacity={alpha * 0.93} />
        </mesh>

        {/* Bridge windows — emissive gold */}
        <mesh position={[-0.7, 0.95, 0.38]}>
          <boxGeometry args={[0.7, 0.35, 0.02]} />
          <meshStandardMaterial color="#c9a962" roughness={0.1} metalness={0.2} emissive="#c9a962" emissiveIntensity={0.8} transparent opacity={alpha * 0.9} />
        </mesh>

        {/* Funnel */}
        <mesh position={[-1.0, 1.25, 0]}>
          <cylinderGeometry args={[0.12, 0.16, 0.55, 16]} />
          <meshStandardMaterial color="#2a2a38" roughness={0.2} metalness={0.85} transparent opacity={alpha * 0.92} />
        </mesh>

        {/* Cargo hatches */}
        {[-0.3, 0.3, 0.9].map((z, i) => (
          <mesh key={i} position={[0.1, 0.45, z]}>
            <boxGeometry args={[1.6, 0.06, 0.65]} />
            <meshStandardMaterial color="#2e2e40" roughness={0.4} metalness={0.5} transparent opacity={alpha * 0.85} />
          </mesh>
        ))}

        {/* Mast */}
        <mesh position={[-0.2, 1.6, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
          <meshStandardMaterial color="#8c8c8c" roughness={0.2} metalness={0.9} transparent opacity={alpha * 0.9} />
        </mesh>

        {/* Radar dish */}
        <mesh ref={radarRef} position={[-0.2, 1.95, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#c9a962" roughness={0.1} metalness={0.3} emissive="#c9a962" emissiveIntensity={0.6} transparent opacity={alpha * 0.85} side={THREE.DoubleSide} />
        </mesh>

        {/* Radar sweep */}
        <mesh ref={sweepRef} position={[-0.2, 1.95, 0]}>
          <ringGeometry args={[0.06, 0.9, 48, 1, 0, Math.PI * 0.55]} />
          <meshBasicMaterial color="#c9a962" transparent opacity={alpha * 0.18} side={THREE.DoubleSide} />
        </mesh>

        {/* Propeller shaft */}
        <mesh position={[2.1, -0.1, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#555560" roughness={0.2} metalness={0.9} transparent opacity={alpha * 0.85} />
        </mesh>
      </group>

      {/* Wake trail */}
      <mesh position={[2.3, -0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 3]} />
        <meshBasicMaterial color="#7ab4e6" transparent opacity={alpha * 0.06} />
      </mesh>

      <Dust count={40} opacity={alpha * 0.15} color="#c9a962" range={5} />
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────
   SERVICE B — WAREHOUSING: Slipform silos
   ───────────────────────────────────────────────────────────── */
function WarehousingScene({ alpha }: { alpha: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const levelRefs = useRef<THREE.Mesh[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.06
    levelRefs.current.forEach((m, i) => {
      if (!m) return
      const h = 0.45 + Math.sin(t * 0.7 + i * 1.3) * 0.18
      m.scale.y = Math.max(0.15, h)
      m.position.y = (h - 1) * 0.5
      const mat = m.material as THREE.MeshStandardMaterial
      if (mat && !Array.isArray(mat)) mat.opacity = alpha * 0.55 * (0.35 + h * 0.55)
    })
  })

  const silos = [
    { x: -1.6, z: -0.4, r: 0.55, h: 2.2 },
    { x: -0.4, z: -0.9, r: 0.65, h: 2.5 },
    { x: 0.8, z: -0.2, r: 0.5, h: 2.0 },
    { x: 1.7, z: -0.6, r: 0.6, h: 2.3 },
  ]

  return (
    <group ref={groupRef} visible={alpha > 0.005}>
      <PedestalRing />
      <GroundLine length={6} />

      {/* Base platform */}
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[6, 0.12, 3]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.75} metalness={0.35} transparent opacity={alpha * 0.9} />
      </mesh>

      {silos.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          {/* Cylinder body */}
          <mesh position={[0, s.h * 0.5, 0]}>
            <cylinderGeometry args={[s.r, s.r, s.h, 32]} />
            <meshStandardMaterial color="#222230" roughness={0.22} metalness={0.75} transparent opacity={alpha * 0.93} />
          </mesh>
          {/* Top rim */}
          <mesh position={[0, s.h, 0]}>
            <torusGeometry args={[s.r, 0.035, 8, 32]} />
            <meshStandardMaterial color="#c9a962" roughness={0.2} metalness={0.85} transparent opacity={alpha * 0.88} />
          </mesh>
          {/* Bottom ring */}
          <mesh position={[0, 0.02, 0]}>
            <torusGeometry args={[s.r, 0.03, 8, 32]} />
            <meshStandardMaterial color="#c9a962" roughness={0.2} metalness={0.85} transparent opacity={alpha * 0.7} />
          </mesh>
          {/* Glowing fill level */}
          <mesh
            ref={el => { if (el) levelRefs.current[i] = el }}
            position={[0, s.h * 0.5, 0]}
          >
            <cylinderGeometry args={[s.r * 0.86, s.r * 0.86, 1, 32]} />
            <meshStandardMaterial color="#c9a962" roughness={0.08} metalness={0.3} emissive="#c9a962" emissiveIntensity={0.6} transparent opacity={alpha * 0.45} />
          </mesh>
        </group>
      ))}

      {/* Connecting gantry */}
      <mesh position={[0, 1.2, -0.5]}>
        <boxGeometry args={[4.2, 0.07, 0.1]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.3} metalness={0.8} transparent opacity={alpha * 0.8} />
      </mesh>

      <Dust count={50} opacity={alpha * 0.15} color="#c9a962" range={5} />
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────
   SERVICE C — CUSTOMS: Scanner rings
   ───────────────────────────────────────────────────────────── */
function CustomsScene({ alpha }: { alpha: number }) {
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ring3 = useRef<THREE.Mesh>(null)
  const core = useRef<THREE.Mesh>(null)
  const scanBeam = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ring1.current) ring1.current.rotation.x = t * 0.55
    if (ring2.current) { ring2.current.rotation.y = t * 0.7; ring2.current.rotation.z = t * 0.25 }
    if (ring3.current) { ring3.current.rotation.x = -t * 0.45; ring3.current.rotation.z = t * 0.6 }
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 1.1) * 0.06)
    if (scanBeam.current) {
      scanBeam.current.rotation.y = t * 0.35
      const m = scanBeam.current.material as THREE.MeshBasicMaterial
      if (m && !Array.isArray(m)) m.opacity = alpha * 0.1 * (0.5 + Math.sin(t * 2.5) * 0.5)
    }
  })

  return (
    <group visible={alpha > 0.005}>
      <PedestalRing />
      <GroundLine />

      {/* Core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshStandardMaterial color="#1a2838" roughness={0.1} metalness={0.9} emissive="#4ac9c9" emissiveIntensity={0.4} transparent opacity={alpha * 0.9} />
      </mesh>

      {/* Ring 1 — horizontal */}
      <mesh ref={ring1}>
        <torusGeometry args={[0.75, 0.04, 16, 64]} />
        <meshStandardMaterial color="#c9a962" roughness={0.1} metalness={0.9} emissive="#c9a962" emissiveIntensity={0.6} transparent opacity={alpha * 0.9} />
      </mesh>
      {/* Ring 2 — vertical */}
      <mesh ref={ring2}>
        <torusGeometry args={[0.95, 0.035, 16, 64]} />
        <meshStandardMaterial color="#4ac9c9" roughness={0.1} metalness={0.9} emissive="#4ac9c9" emissiveIntensity={0.5} transparent opacity={alpha * 0.85} />
      </mesh>
      {/* Ring 3 — tilted */}
      <mesh ref={ring3}>
        <torusGeometry args={[1.15, 0.03, 16, 64]} />
        <meshStandardMaterial color="#c9a962" roughness={0.1} metalness={0.9} emissive="#c9a962" emissiveIntensity={0.4} transparent opacity={alpha * 0.7} />
      </mesh>

      {/* Scan beam */}
      <mesh ref={scanBeam}>
        <cylinderGeometry args={[1.25, 1.25, 0.12, 48]} />
        <meshBasicMaterial color="#4ac9c9" transparent opacity={alpha * 0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Compliance badges */}
      {[
        { text: 'SGS ✓', pos: [-1.5, 0.75, -0.3] },
        { text: 'BV ✓', pos: [1.4, 0.55, -0.5] },
        { text: 'ISO 9001', pos: [-1.1, -0.65, -0.4] },
      ].map((badge, i) => (
        <group key={i} position={badge.pos as [number, number, number]}>
          <mesh>
            <planeGeometry args={[0.75, 0.28]} />
            <meshBasicMaterial color="#070709" transparent opacity={alpha * 0.8} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.11} color="#4ac9c9" anchorX="center" anchorY="middle">
            {badge.text}
          </Text>
        </group>
      ))}

      <Dust count={35} opacity={alpha * 0.2} color="#4ac9c9" range={3} />
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────
   SERVICE D — SUPPLY_CHAIN: Globe with Dubai routes
   ───────────────────────────────────────────────────────────── */
function SupplyChainScene({ alpha }: { alpha: number }) {
  const globeRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (globeRef.current) globeRef.current.rotation.y += 0.0025
  })

  const dubai = latLon(25.1972, 55.2744, 2.6)
  const dests = [
    latLon(1.3521, 103.8198, 2.6),
    latLon(-1.2921, 36.8219, 2.6),
    latLon(19.076, 72.8777, 2.6),
    latLon(24.7136, 46.6753, 2.6),
    latLon(10.8231, 106.6297, 2.6),
    latLon(39.9042, 116.4074, 2.6),
  ]

  return (
    <group visible={alpha > 0.005}>
      <PedestalRing />
      <GroundLine length={7} />

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.8, 48, 48]} />
        <meshBasicMaterial color="#0a2040" transparent opacity={alpha * 0.07} side={THREE.BackSide} />
      </mesh>

      {/* Globe */}
      <group ref={globeRef}>
        {/* Solid base */}
        <mesh>
          <sphereGeometry args={[2.48, 48, 48]} />
          <meshStandardMaterial color="#0d1f38" roughness={0.5} metalness={0.35} transparent opacity={alpha * 0.65} />
        </mesh>
        {/* Wireframe overlay */}
        <mesh>
          <sphereGeometry args={[2.5, 24, 24]} />
          <meshBasicMaterial color="#c9a962" wireframe transparent opacity={alpha * 0.06} />
        </mesh>
      </group>

      {/* Latitude rings */}
      {[0, 0.35, -0.35, 0.7, -0.7].map((lat, i) => (
        <mesh key={i}>
          <ringGeometry args={[
            2.48 * Math.cos(lat * Math.PI * 0.5),
            2.48 * Math.cos(lat * Math.PI * 0.5),
            72
          ]} />
          <meshBasicMaterial color="#c9a962" transparent opacity={alpha * 0.04} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Routes */}
      {dests.map((end, i) => (
        <Arc key={i} start={dubai} end={end} alpha={alpha} index={i} />
      ))}

      {/* Dubai hub */}
      <group position={dubai}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#ffd97a" transparent opacity={alpha * 0.95} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#c9a962" transparent opacity={alpha * 0.12} />
        </mesh>
      </group>

      {/* Destinations */}
      {dests.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#4ac9c9" transparent opacity={alpha * 0.75} />
          </mesh>
        </group>
      ))}

      <Dust count={30} opacity={alpha * 0.12} color="#c9a962" range={6} />
    </group>
  )
}

function Arc({ start, end, alpha, index }: { start: THREE.Vector3; end: THREE.Vector3; alpha: number; index: number }) {
  const [opacity, setOpacity] = useState(0.3)
  const pts = useMemo(() => {
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2 + 0.7 + Math.abs(start.x + end.x) * 0.15,
      (start.z + end.z) / 2,
    )
    const curve = new THREE.QuadraticBezierCurve3(start.clone(), mid, end.clone())
    const arr = new Float32Array(50 * 3)
    for (let i = 0; i < 50; i++) {
      const p = curve.getPoint(i / 49)
      arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z
    }
    return arr
  }, [start, end])

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.4 + index * 0.25) % 1
    setOpacity(alpha * 0.4 * (0.25 + Math.sin(t * Math.PI) * 0.75))
  })

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={50} array={pts} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#c9a962" transparent opacity={opacity} />
    </line>
  )
}

function latLon(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

/* ─────────────────────────────────────────────────────────────
   SERVICE E — LAST_MILE: Gantry unloader
   ───────────────────────────────────────────────────────────── */
function LastMileScene({ alpha }: { alpha: number }) {
  const armRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (armRef.current) {
      armRef.current.rotation.z = Math.sin(t * 0.25) * 0.08
      armRef.current.rotation.x = Math.cos(t * 0.2) * 0.04
    }
    if (particlesRef.current) particlesRef.current.rotation.y = t * 0.15
  })

  return (
    <group visible={alpha > 0.005}>
      <PedestalRing />
      <GroundLine length={7} />

      {/* Industrial floor */}
      <mesh position={[0, -1.08, 0]}>
        <boxGeometry args={[8, 0.1, 4]} />
        <meshStandardMaterial color="#181820" roughness={0.65} metalness={0.5} transparent opacity={alpha * 0.9} />
      </mesh>

      {/* Base tower */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.4, 1.0, 0.4]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.3} metalness={0.82} transparent opacity={alpha * 0.92} />
      </mesh>

      {/* Gantry arm */}
      <group ref={armRef} position={[0, 0.35, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.5, 0.18, 0.22]} />
          <meshStandardMaterial color="#c9a962" roughness={0.18} metalness={0.88} transparent opacity={alpha * 0.92} />
        </mesh>
        {/* End effector */}
        <mesh position={[1.8, -0.08, 0]}>
          <boxGeometry args={[0.28, 0.38, 0.32]} />
          <meshStandardMaterial color="#8c8c8c" roughness={0.2} metalness={0.9} transparent opacity={alpha * 0.88} />
        </mesh>
        {/* Counter weight */}
        <mesh position={[-1.2, 0.05, 0]}>
          <boxGeometry args={[0.5, 0.38, 0.38]} />
          <meshStandardMaterial color="#2a2a3a" roughness={0.3} metalness={0.7} transparent opacity={alpha * 0.85} />
        </mesh>
      </group>

      {/* Conveyor */}
      <mesh position={[1.8, -0.18, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.06, 0.06, 2.5]} />
        <meshStandardMaterial color="#555560" roughness={0.2} metalness={0.9} transparent opacity={alpha * 0.85} />
      </mesh>

      {/* Destination column */}
      <mesh position={[2.3, -0.15, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 1.5, 24]} />
        <meshStandardMaterial color="#1e1e2c" roughness={0.25} metalness={0.65} transparent opacity={alpha * 0.9} />
      </mesh>
      <mesh position={[2.3, 0.65, 0]}>
        <torusGeometry args={[0.38, 0.03, 8, 32]} />
        <meshStandardMaterial color="#c9a962" roughness={0.2} metalness={0.8} transparent opacity={alpha * 0.82} />
      </mesh>

      {/* Conveyor glow */}
      <mesh position={[1.8, -0.35, 0]}>
        <planeGeometry args={[1.8, 0.08]} />
        <meshBasicMaterial color="#c9a962" transparent opacity={alpha * 0.08} />
      </mesh>

      <ParticleFlow count={35} alpha={alpha} />
      <Dust count={45} opacity={alpha * 0.14} color="#c9a962" range={4} />
    </group>
  )
}

function ParticleFlow({ count, alpha }: { count: number; alpha: number }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      a[i * 3] = 1.0 + Math.random() * 2.2
      a[i * 3 + 1] = -0.8 + Math.random() * 1.8
      a[i * 3 + 2] = (Math.random() - 0.5) * 2.0
    }
    return a
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const arr = ref.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      arr[ix] = 1.0 + ((t * 0.4 + i / count) % 1) * 2.2
      arr[ix + 1] = -0.8 + Math.sin(t * 1.8 + i * 0.7) * 0.35
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffd97a" size={0.04} transparent opacity={alpha * 0.75} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ─────────────────────────────────────────────────────────────
   SCENE MAP & MAIN EXPORT
   ───────────────────────────────────────────────────────────── */

const SCENE_MAP: Record<string, React.FC<{ alpha: number }>> = {
  FREIGHT: FreightScene,
  WAREHOUSING: WarehousingScene,
  CUSTOMS: CustomsScene,
  SUPPLY_CHAIN: SupplyChainScene,
  LAST_MILE: LastMileScene,
}

export default function Services3DCanvas({ activeService }: { activeService: string }) {
  // Clean fade-in on service change
  const [renderAlpha, setRenderAlpha] = useState(1)

  useEffect(() => {
    const start = performance.now()
    const tick = () => {
      const v = Math.min(1, (performance.now() - start) / 550)
      setRenderAlpha(v * v * (3 - 2 * v))
      if (v < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [activeService])

  const Comp = SCENE_MAP[activeService]
  const LightRig = LIGHTS[activeService]
  if (!Comp) return null

  return (
    <>
      <ParallaxCamera />
      <LightRig />
      <fog attach="fog" args={['#070709', 3.5, 22]} />
      <Backdrop />
      <Comp alpha={renderAlpha} />
    </>
  )
}

function Backdrop() {
  return (
    <mesh position={[0, 0, -7]}>
      <planeGeometry args={[16, 12]} />
      <meshBasicMaterial color="#0c0a06" transparent opacity={0.5} />
    </mesh>
  )
}
