'use client'

import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, ContactShadows } from '@react-three/drei'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import {
  SERVICE_FRAMES,
  SERVICE_ORDER,
  getServiceProgress,
} from '@/lib/serviceCameraConfig'

/* ─── Lazy-load the shared GLB ─────────────────────────────────────────── */
function useServiceModel() {
  const result = useGLTF('/models/service.glb')
  return result.scene
}

/* ─── Hermite spline helpers (same approach as animation.ts) ───────────── */
function hermite(p0: number, p1: number, m0: number, m1: number, s: number): number {
  const s2 = s * s, s3 = s2 * s
  return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * m1
}

function lerpFrame(a: typeof SERVICE_FRAMES[string], b: typeof SERVICE_FRAMES[string], t: number) {
  const s = Math.max(0, Math.min(1, t))
  const posA = new THREE.Vector3(...a.cameraPos)
  const posB = new THREE.Vector3(...b.cameraPos)
  const lookA = new THREE.Vector3(...a.lookAt)
  const lookB = new THREE.Vector3(...b.lookAt)
  const mid = new THREE.Vector3().lerpVectors(posA, posB, 0.5)
  const lift = mid.clone().normalize().multiplyScalar(0.6)
  const cp = mid.clone().add(lift)

  const span = 1
  const sSmooth = hermite(0, 1, span * 0.55, span * 0.55, s)

  const outPos = new THREE.Vector3(
    hermite(posA.x, posB.x, (posB.x - posA.x) * 0.55, (posB.x - posA.x) * 0.55, sSmooth),
    hermite(posA.y, posB.y, (posB.y - posA.y) * 0.55, (posB.y - posA.y) * 0.55, sSmooth),
    hermite(posA.z, posB.z, (posB.z - posA.z) * 0.55, (posB.z - posA.z) * 0.55, sSmooth),
  )
  const outLook = new THREE.Vector3(
    hermite(lookA.x, lookB.x, (lookB.x - lookA.x) * 0.55, (lookB.x - lookA.x) * 0.55, sSmooth),
    hermite(lookA.y, lookB.y, (lookB.y - lookA.y) * 0.55, (lookB.y - lookA.y) * 0.55, sSmooth),
    hermite(lookA.z, lookB.z, (lookB.z - lookA.z) * 0.55, (lookB.z - lookA.z) * 0.55, sSmooth),
  )
  const outFov = hermite(a.fov, b.fov, (b.fov - a.fov) * 0.55, (b.fov - a.fov) * 0.55, sSmooth)
  const outFogNear = hermite(a.fogNear, b.fogNear, (b.fogNear - a.fogNear) * 0.55, (b.fogNear - a.fogNear) * 0.55, sSmooth)
  const outFogFar = hermite(a.fogFar, b.fogFar, (b.fogFar - a.fogFar) * 0.55, (b.fogFar - a.fogFar) * 0.55, sSmooth)

  const cA = new THREE.Color(a.fogColor)
  const cB = new THREE.Color(b.fogColor)
  const outFogColor = new THREE.Color().lerpColors(cA, cB, sSmooth)

  const outKeyIntensity = hermite(a.keyLightIntensity, b.keyLightIntensity, (b.keyLightIntensity - a.keyLightIntensity) * 0.55, (b.keyLightIntensity - a.keyLightIntensity) * 0.55, sSmooth)
  const outBoost = hermite(a.emissiveBoost, b.emissiveBoost, (b.emissiveBoost - a.emissiveBoost) * 0.55, (b.emissiveBoost - a.emissiveBoost) * 0.55, sSmooth)

  return { outPos, outLook, outFov, outFogNear, outFogFar, outFogColor, outKeyIntensity, outBoost, keyLightPos: a.keyLightPos }
}

/* ─── Camera rig that smooths between service keyframes ────────────────── */
function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null)
  const pos = useRef(new THREE.Vector3(-8.5, 2.0, -1.5))
  const look = useRef(new THREE.Vector3(-12.5, 0.3, -2.0))
  const fov = useRef(52)
  const prevX = useRef(-8.5)

  useFrame((state, delta) => {
    const cam = camRef.current
    if (!cam) return
    const d = Math.min(0.06, Math.max(0.001, delta))
    const t = state.clock.elapsedTime
    const p = state.pointer

    // Determine which service segment we're in
    const segSize = 1 / SERVICE_ORDER.length
    const rawIdx = scrollProgress / segSize
    const idx = Math.min(SERVICE_ORDER.length - 2, Math.max(0, Math.floor(rawIdx)))
    const segT = rawIdx - idx

    const a = SERVICE_FRAMES[SERVICE_ORDER[idx]]
    const b = SERVICE_FRAMES[SERVICE_ORDER[idx + 1]]
    const frame = lerpFrame(a, b, segT)

    // Mouse parallax + breathing
    const mx = p.x * 0.12 + Math.sin(t * 0.35) * 0.015
    const my = p.y * 0.08 + Math.cos(t * 0.3) * 0.012

    const targetPos = frame.outPos.clone().add(new THREE.Vector3(mx, my, 0))
    const targetLook = frame.outLook.clone().add(new THREE.Vector3(mx * 0.3, my * 0.3, 0))

    pos.current.x = THREE.MathUtils.damp(pos.current.x, targetPos.x, 3.0, d)
    pos.current.y = THREE.MathUtils.damp(pos.current.y, targetPos.y, 3.0, d)
    pos.current.z = THREE.MathUtils.damp(pos.current.z, targetPos.z, 3.0, d)
    cam.position.copy(pos.current)

    look.current.x = THREE.MathUtils.damp(look.current.x, targetLook.x, 3.0, d)
    look.current.y = THREE.MathUtils.damp(look.current.y, targetLook.y, 3.0, d)
    look.current.z = THREE.MathUtils.damp(look.current.z, targetLook.z, 3.0, d)
    cam.lookAt(look.current)

    // Roll
    const vx = (pos.current.x - prevX.current) / d
    prevX.current = pos.current.x
    cam.rotation.z = THREE.MathUtils.damp(cam.rotation.z, -THREE.MathUtils.clamp(vx * 0.008, -0.02, 0.02), 3.0, d)

    // FOV
    fov.current = THREE.MathUtils.damp(fov.current, frame.outFov, 3.5, d)
    if (Math.abs(cam.fov - fov.current) > 0.05) {
      cam.fov = fov.current
      cam.updateProjectionMatrix()
    }
  })

  return <PerspectiveCamera ref={camRef} makeDefault position={[-8.5, 2.0, -1.5]} fov={52} near={0.1} far={80} />
}

/* ─── Adaptive cinematic lighting ─────────────────────────────────────── */
function AdaptiveLights({ scrollProgress }: { scrollProgress: number }) {
  const keyRef = useRef<THREE.DirectionalLight>(null)

  useFrame((_, delta) => {
    const d = Math.min(0.06, delta)
    const segSize = 1 / SERVICE_ORDER.length
    const rawIdx = scrollProgress / segSize
    const idx = Math.min(SERVICE_ORDER.length - 2, Math.max(0, Math.floor(rawIdx)))
    const segT = rawIdx - idx
    const a = SERVICE_FRAMES[SERVICE_ORDER[idx]]
    const b = SERVICE_FRAMES[SERVICE_ORDER[idx + 1]]
    const frame = lerpFrame(a, b, segT)

    if (keyRef.current) {
      keyRef.current.intensity = THREE.MathUtils.damp(keyRef.current.intensity, frame.outKeyIntensity, 3.5, d)
      keyRef.current.position.lerp(new THREE.Vector3(...frame.keyLightPos ?? a.keyLightPos), 0.05)
    }
  })

  return (
    <>
      <ambientLight intensity={0.5} color="#1a1a2e" />
      <directionalLight
        ref={keyRef}
        position={[-6, 7, 2]}
        intensity={3.2}
        color="#ffd97a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[5, 4, -4]} intensity={0.9} color="#4a6fa5" />
      <pointLight color="#c9a962" intensity={0.6} position={[0, 3, -3]} distance={18} />
      <pointLight color="#4a6fa5" intensity={0.4} position={[-5, 1, 0]} distance={14} />
      <hemisphereLight color="#2a3040" groundColor="#080808" intensity={0.35} />
    </>
  )
}

/* ─── GLB model rendered once ─────────────────────────────────────────── */
function DepotModel({ progress, serviceId }: { progress: number; serviceId: string }) {
  const scene = useServiceModel()
  const groupRef = useRef<THREE.Group>(null)

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone(true)} />
    </group>
  )
}

/* ─── Subtle volumetric dust ──────────────────────────────────────────── */
function DustParticles({ alpha }: { alpha: number }) {
  const ref = useRef<THREE.Points>(null)
  const [positions] = useMemo(() => {
    const a = new Float32Array(200 * 3)
    for (let i = 0; i < 200; i++) {
      a[i * 3] = (Math.random() - 0.5) * 18
      a[i * 3 + 1] = Math.random() * 5
      a[i * 3 + 2] = (Math.random() - 0.5) * 14
    }
    return [a]
  }, [])

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0002
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={200} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#c9a962" size={0.012} transparent opacity={alpha * 0.12} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ─── Main 3D experience ──────────────────────────────────────────────── */
export default function Services3DExperience({
  scrollProgress,
  activeService,
}: {
  scrollProgress: number
  activeService: string
}) {
  const frame = SERVICE_FRAMES[activeService] ?? SERVICE_FRAMES.FREIGHT

  return (
    <div className="fixed inset-0" style={{ zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        camera={{ position: frame.cameraPos, fov: frame.fov, near: 0.1, far: 80 }}
      >
        <Suspense fallback={null}>
          <CameraRig scrollProgress={scrollProgress} />
          <DepotModel progress={1} serviceId={activeService} />
          <AdaptiveLights scrollProgress={scrollProgress} />
          <ContactShadows position={[0, -0.5, 0]} scale={20} blur={3} opacity={0.12} far={8} />
          <fog attach="fog" args={['#0a0a0a', 2, 35]} />
          <DustParticles alpha={1} />
        </Suspense>
      </Canvas>
    </div>
  )
}
