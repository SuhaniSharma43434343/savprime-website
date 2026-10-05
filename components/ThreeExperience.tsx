'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { getSplineCameraFrame } from '@/lib/animation'
import { SceneController } from './SceneManager'

// ─── Cinematic Camera Rig with Catmull-Rom Splines & Mouse Inertia ──────────

function CinematicCameraRig({ scrollProgress }: { scrollProgress: number }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const { viewport } = useThree()
  const aspectCorrection = useRef(1.0)
  const currentPos = useRef(new THREE.Vector3(-0.6, 0.45, 2.8))
  const currentLookAt = useRef(new THREE.Vector3(0.75, 0.18, -0.25))
  const currentFov = useRef(52)
  const previousPosX = useRef(-0.6)

  // Adjust camera distance when viewport aspect ratio differs from 16:9
  useEffect(() => {
    const handleResize = () => {
      const baseAspect = 16 / 9
      const currentAspect = window.innerWidth / window.innerHeight
      if (currentAspect > baseAspect) {
        const baseHalfFov = (52 / 2) * (Math.PI / 180)
        const targetHalfFov = Math.atan(currentAspect * Math.tan(baseHalfFov))
        const ratio = Math.tan(baseHalfFov) / Math.tan(targetHalfFov)
        aspectCorrection.current = Math.max(0.35, Math.min(1.2, ratio))
      } else {
        aspectCorrection.current = 1.0
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useFrame((state, delta) => {
    if (!cameraRef.current) return
    const camera = cameraRef.current

    // Clamp delta to prevent sudden leaps if tab was unfocused
    const safeDelta = Math.min(0.06, Math.max(0.001, delta))

    // 1. Evaluate Catmull-Rom continuous spline at current scroll progress
    const frame = getSplineCameraFrame(scrollProgress)

    // 2. Subtle organic mouse parallax & ambient breathing float
    const pointer = state.pointer // [-1 to 1] normalized by R3F
    const time = state.clock.elapsedTime

    const mouseOffsetX = pointer.x * 0.18
    const mouseOffsetY = pointer.y * 0.12

    const breathingX = Math.sin(time * 0.45) * 0.025
    const breathingY = Math.cos(time * 0.35) * 0.02

    const targetPos = frame.position.clone().multiplyScalar(aspectCorrection.current).add(
      new THREE.Vector3(mouseOffsetX + breathingX, mouseOffsetY + breathingY, 0)
    )

    const targetLookAt = frame.lookAt.clone().add(
      new THREE.Vector3(mouseOffsetX * 0.4, mouseOffsetY * 0.4, 0)
    )

    // 3. Frame-Rate Independent Damping (THREE.MathUtils.damp)
    // Damping factor of 4.5 gives responsive yet silky, cinematic drone inertia
    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, targetPos.x, 4.5, safeDelta)
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, targetPos.y, 4.5, safeDelta)
    currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, targetPos.z, 4.5, safeDelta)
    camera.position.copy(currentPos.current)

    currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, targetLookAt.x, 4.5, safeDelta)
    currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, targetLookAt.y, 4.5, safeDelta)
    currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, targetLookAt.z, 4.5, safeDelta)
    camera.lookAt(currentLookAt.current)

    // 4. Subtle drone banking / roll on horizontal translation
    const velX = (currentPos.current.x - previousPosX.current) / safeDelta
    previousPosX.current = currentPos.current.x
    const targetRoll = -THREE.MathUtils.clamp(velX * 0.015, -0.04, 0.04)
    camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, targetRoll, 4.0, safeDelta)

    // 5. Smooth FOV Breathing
    currentFov.current = THREE.MathUtils.damp(currentFov.current, frame.fov, 3.5, safeDelta)
    if (Math.abs(camera.fov - currentFov.current) > 0.01) {
      camera.fov = currentFov.current
      camera.updateProjectionMatrix()
    }

    // 6. Atmospheric Scene Fog & Background Transition
    const scene = state.scene
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      scene.fog.color.lerp(frame.fogColor, 0.08)
    }
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[-0.6, 0.45, 2.8]}
      fov={52}
      near={0.1}
      far={120}
    />
  )
}

// ─── Adaptive Cinematic Scene Lights ────────────────────────────────────────

function AdaptiveCinematicLights({ scrollProgress }: { scrollProgress: number }) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null)
  const fillLightRef = useRef<THREE.DirectionalLight>(null)

  useFrame((_, delta) => {
    const safeDelta = Math.min(0.06, delta)
    const frame = getSplineCameraFrame(scrollProgress)

    if (keyLightRef.current) {
      keyLightRef.current.color.lerp(frame.lightColor, 0.08)
      keyLightRef.current.intensity = THREE.MathUtils.damp(
        keyLightRef.current.intensity,
        frame.lightIntensity,
        3.5,
        safeDelta
      )
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} color="#151722" />
      {/* Key Directional Light */}
      <directionalLight
        ref={keyLightRef}
        position={[6, 7, 5]}
        intensity={2.2}
        color="#c9a962"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      {/* Fill Light for subtle shadow depth */}
      <directionalLight
        ref={fillLightRef}
        position={[-4, 3, -3]}
        intensity={0.8}
        color="#54719c"
      />
      {/* Rim light for industrial metallic edge definition */}
      <directionalLight
        position={[0, -2, -6]}
        intensity={1.2}
        color="#ffffff"
      />
    </>
  )
}

// ─── Export ThreeExperience ──────────────────────────────────────────────────

export default function ThreeExperience({ scrollProgress }: { scrollProgress: number }) {
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
        camera={{ position: [-0.6, 0.45, 2.8], fov: 52, near: 0.1, far: 120 }}
      >
        <CinematicCameraRig scrollProgress={scrollProgress} />
        <SceneController scrollProgress={scrollProgress} />
        <AdaptiveCinematicLights scrollProgress={scrollProgress} />
        <ContactShadows
          position={[0, -0.5, 0]}
          scale={16}
          blur={2.8}
          opacity={0.15}
          far={6}
        />
        <fog attach="fog" args={['#050508', 3, 38]} />
      </Canvas>
    </div>
  )
}
