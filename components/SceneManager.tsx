'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { getCurrentSection, SCENE_SECTIONS, calculateSceneEnvelope } from '@/lib/animation'
import type { SectionName } from '@/lib/animation'
import { SCENE_CONFIGS } from '@/lib/sceneConfig'

// ─── Lazy GLB loader ────────────────────────────────────────────────
// useGLTF is a React hook — it MUST be called at the top level of a
// component, not inside useEffect. Each scene component calls this
// directly. When the scene unmounts, drei's internal cache keeps the
// model so re-entry is instant.

export function useLazyGLB(src: string) {
  // Top-level hook call — valid
  const result = useGLTF(src)
  return { scene: result.scene, animations: result.animations }
}

// Preload a model without rendering it (call from SceneController)
export function preloadGLB(src: string) {
  try { useGLTF.preload(src) } catch { /* already loading or loaded */ }
}

// Helper to center and normalize any raw GLB around origin
function AutoCenteredModel({ object, targetSize = 2.0 }: { object: THREE.Object3D; targetSize?: number }) {
  const cloned = useMemo(() => {
    const clone = object.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1.0
    const s = targetSize / maxDim
    clone.position.sub(center) // center at 0, 0, 0
    
    const wrapper = new THREE.Group()
    wrapper.scale.setScalar(s)
    wrapper.add(clone)
    return wrapper
  }, [object, targetSize])

  return <primitive object={cloned} />
}

// Bottom-aligned model: lowest Y point sits at Y = 0 (perfect for cranes, machinery, buildings)
function GroundAlignedModel({
  object,
  targetHeight,
}: {
  object: THREE.Object3D
  targetHeight: number
}) {
  const cloned = useMemo(() => {
    const clone = object.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const s = targetHeight / (size.y || 1.0)
    // Center along X and Z, set base (min.y) to Y = 0
    clone.position.x = -center.x
    clone.position.y = -box.min.y
    clone.position.z = -center.z

    const wrapper = new THREE.Group()
    wrapper.scale.setScalar(s)
    wrapper.add(clone)
    return wrapper
  }, [object, targetHeight])

  return <primitive object={cloned} />
}

// Waterline-aligned model: positions cargo ship hull realistically in water
function ShipModel({
  object,
  targetLength = 3.8,
  waterlineRatio = 0.45,
}: {
  object: THREE.Object3D
  targetLength?: number
  waterlineRatio?: number
}) {
  const cloned = useMemo(() => {
    const clone = object.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const s = targetLength / (size.x || 1.0)
    // Center along X and Z, place waterline at local Y = 0
    const waterlineY = box.min.y + size.y * waterlineRatio
    clone.position.x = -center.x
    clone.position.y = -waterlineY
    clone.position.z = -center.z

    const wrapper = new THREE.Group()
    wrapper.scale.setScalar(s)
    wrapper.add(clone)
    return wrapper
  }, [object, targetLength, waterlineRatio])

  return <primitive object={cloned} />
}

// ─── Shared lightweight helpers ──────────────────────────────────────

function GroundPlane({ opacity = 0.35 }: { opacity?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <circleGeometry args={[20, 48]} />
      <meshStandardMaterial color="#111111" roughness={0.95} metalness={0.0} transparent opacity={opacity} />
    </mesh>
  )
}

function AmbientParticles({ count, opacity, color, range }: {
  count: number; opacity: number; color: string; range: number
}) {
  const pointsRef = useRef<THREE.Points>(null)
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * range
      pos[i * 3 + 1] = Math.random() * 3
      pos[i * 3 + 2] = (Math.random() - 0.5) * range
    }
    return [pos]
  }, [count, range])

  useFrame(() => {
    if (pointsRef.current) pointsRef.current.rotation.y += 0.0006
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.018} transparent opacity={opacity} sizeAttenuation depthWrite={false} />
    </points>
  )
}

// ─── Scene components ────────────────────────────────────────────────

function OriginScene({ progress }: { progress: number }) {
  const alpha = progress
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y = state.clock.elapsedTime * 0.04
  })

  return (
    <group visible={alpha > 0.01}>
      {/* Large close-up mineral crystal */}
      <mesh ref={meshRef} position={[0.8, 0.2, -0.3]} castShadow receiveShadow>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.3} metalness={0.65} flatShading transparent opacity={alpha * 0.92} />
      </mesh>
      {[[-1.0, -0.05, 0.5], [1.4, -0.1, -0.6], [0.2, -0.15, 1.2]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <octahedronGeometry args={[0.18 + i * 0.06, 0]} />
          <meshStandardMaterial color={['#4a4a5a', '#5a5a6a', '#3a3a4a'][i]} roughness={0.25} metalness={0.75} flatShading transparent opacity={alpha * 0.65} />
        </mesh>
      ))}
      <points visible={alpha > 0.3}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={50}
            array={(() => { const a = new Float32Array(150); for (let i = 0; i < 50; i++) { a[i*3]=(Math.random()-.5)*4; a[i*3+1]=Math.random()*1.5; a[i*3+2]=(Math.random()-.5)*4; } return a })()}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#c9a962" size={0.015} transparent opacity={alpha * 0.18} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  )
}

function SourceScene({ progress }: { progress: number }) {
  const alpha = progress
  const groupRef = useRef<THREE.Group>(null)
  const { scene: sourceGLB } = useLazyGLB('/models/source.glb')

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.06
    }
  })

  return (
    <group visible={alpha > 0.01}>
      {/* 3D Geological Source Model */}
      {sourceGLB ? (
        <group ref={groupRef} position={[0.5, 0.2, -1.8]} scale={2.6} rotation={[0, -0.4, 0]}>
          <primitive object={sourceGLB.clone()} />
        </group>
      ) : (
        /* Fallback terrain form */
        <mesh position={[0.5, -0.5, -2]}>
          <boxGeometry args={[4, 2, 2]} />
          <meshStandardMaterial color="#2a1f18" roughness={0.9} transparent opacity={alpha * 0.7} />
        </mesh>
      )}

      {/* Atmospheric ground base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.48, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshBasicMaterial color="#0d0805" transparent opacity={alpha * 0.35} />
      </mesh>
      {alpha > 0.2 && <AmbientParticles count={80} opacity={alpha * 0.25} color="#c9a962" range={8} />}
    </group>
  )
}

function ClinkerScene({ progress }: { progress: number }) {
  // REAL ASSET: clinker.glb
  const alpha = progress
  const groupRef = useRef<THREE.Group>(null)
  const { scene: glbScene } = useLazyGLB('/models/clinker.glb')

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.05
    }
  })

  return (
    <group visible={alpha > 0.01} ref={groupRef} position={[0.2, 0.35, 0.2]}>
      {glbScene ? (
        <AutoCenteredModel object={glbScene} targetSize={1.8} />
      ) : (
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1.0, 1]} />
          <meshStandardMaterial color="#2a2a2e" roughness={0.7} metalness={0.2} flatShading transparent opacity={alpha * 0.6} />
        </mesh>
      )}
    </group>
  )
}

function CementScene({ progress }: { progress: number }) {
  // REAL ASSET: cement.glb
  const alpha = progress
  const groupRef = useRef<THREE.Group>(null)
  const { scene: glbScene } = useLazyGLB('/models/cement.glb')

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.04) * 0.03
  })

  return (
    <group visible={alpha > 0.01} ref={groupRef} position={[0, -0.1, -0.8]} >
      {glbScene ? (
        <group position={[0, 0.1, 0]} scale={0.9}>
          <primitive object={glbScene.clone()} />
        </group>
      ) : (
        /* Single placeholder while GLB loads */
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1.0, 1]} />
          <meshStandardMaterial color="#d4ccc4" roughness={0.5} metalness={0.3} flatShading transparent opacity={alpha * 0.5} />
        </mesh>
      )}
    </group>
  )
}

function BauxiteScene({ progress }: { progress: number }) {
  // REAL ASSET: bauxite.glb
  const alpha = progress
  const groupRef = useRef<THREE.Group>(null)
  const { scene: glbScene } = useLazyGLB('/models/bauxite.glb')

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.025
  })

  return (
    <group visible={alpha > 0.01} ref={groupRef} position={[0.0, -0.05, -0.4]} >
      {glbScene ? (
        <group position={[0, 0.05, 0]} scale={0.85}>
          <primitive object={glbScene.clone()} />
        </group>
      ) : (
        <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1.1, 1]} />
          <meshStandardMaterial color="#a0522d" roughness={0.65} metalness={0.12} flatShading transparent opacity={alpha * 0.5} />
        </mesh>
      )}
    </group>
  )
}

function PreparationScene({ progress }: { progress: number }) {
  // REAL ASSET: warehouse.glb
  const alpha = progress
  const { scene } = useLazyGLB('/models/warehouse.glb')

  return (
    <group >
      <GroundPlane opacity={alpha * 0.4} />
      {scene ? (
        <group position={[0.3, -0.2, -2.2]} scale={0.85}>
          <primitive object={scene.clone()} />
        </group>
      ) : (
        <mesh position={[0.3, 0.1, -2.2]} castShadow>
          <boxGeometry args={[6, 2.5, 3.5]} />
          <meshStandardMaterial color="#444444" roughness={0.8} transparent opacity={alpha * 0.3} />
        </mesh>
      )}
    </group>
  )
}

function PortScene({ progress, prewarm = false }: { progress: number; prewarm?: boolean }) {
  // REAL ASSETS: cargo_ship.glb + hero_prop_-_harbour_crane.glb
  const alpha = progress
  const { scene: shipScene } = useLazyGLB('/models/cargo_ship.glb')
  const { scene: craneScene } = useLazyGLB('/models/hero_prop_-_harbour_crane.glb')

  // Early WebGL GPU pre-warming: compile shaders & buffers while invisible
  if (prewarm && alpha <= 0.001) {
    return (
      <group visible={false}>
        {craneScene && <primitive object={craneScene} />}
        {shipScene && <primitive object={shipScene} />}
      </group>
    )
  }

  return (
    <group visible={alpha > 0.01} position={[0, 0.35, 0]}>
      {/* Sleek quayside wharf concrete deck */}
      <mesh position={[-0.4, -0.55, 0.4]} receiveShadow>
        <boxGeometry args={[14, 0.22, 4.6]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.88} metalness={0.12} transparent opacity={alpha * 0.95} />
      </mesh>

      {/* Quayside crane steel runway tracks */}
      <mesh position={[-0.4, -0.435, -0.1]}>
        <boxGeometry args={[13.8, 0.012, 0.08]} />
        <meshStandardMaterial color="#3d404a" roughness={0.3} metalness={0.85} transparent opacity={alpha * 0.9} />
      </mesh>
      <mesh position={[-0.4, -0.435, -0.7]}>
        <boxGeometry args={[13.8, 0.012, 0.08]} />
        <meshStandardMaterial color="#3d404a" roughness={0.3} metalness={0.85} transparent opacity={alpha * 0.9} />
      </mesh>

      {/* Berth edge gold hazard caution stripe */}
      <mesh position={[-0.4, -0.435, -1.86]}>
        <boxGeometry args={[13.8, 0.012, 0.12]} />
        <meshBasicMaterial color="#c9a962" transparent opacity={alpha * 0.85} />
      </mesh>

      {/* Cast steel mooring bollards along the quay wall */}
      {[-4.5, -2.5, -0.5, 1.5, 3.5, 5.5].map((x, i) => (
        <group key={i} position={[x, -0.38, -1.78]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.048, 0.12, 12]} />
            <meshStandardMaterial color="#22242a" roughness={0.4} metalness={0.8} transparent opacity={alpha * 0.9} />
          </mesh>
          <mesh position={[0, 0.065, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.03, 12]} />
            <meshStandardMaterial color="#2e313a" roughness={0.3} metalness={0.85} transparent opacity={alpha * 0.9} />
          </mesh>
        </group>
      ))}

      {/* Nocturnal harbor water — placed only behind the quay wall at water level, dark & non-intrusive */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, -4.5]} receiveShadow>
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial color="#07090e" roughness={0.2} metalness={0.65} transparent opacity={alpha * 0.6} />
      </mesh>

      {/* Harbour crane — stands proud on dock rails, bottom-aligned, boom extending towards vessel */}
      {craneScene && (
        <group position={[-0.85, -0.44, -0.4]} rotation={[0, 0.35, 0]}>
          <GroundAlignedModel object={craneScene} targetHeight={1.2} />
        </group>
      )}

      {/* Cargo ship — berthed alongside the quay wall in harbor water */}
      {shipScene && (
        <group position={[0.95, -0.60, -1.85]} rotation={[0, 0.02, 0]}>
          <ShipModel object={shipScene} targetLength={2.5} waterlineRatio={0.45} />
        </group>
      )}

      {/* Industrial high-power terminal lighting */}
      <ambientLight color="#181a22" intensity={0.8} />
      <pointLight color="#ffe8cc" intensity={2.4} position={[-2.2, 4.2, 1.2]} distance={20} />
      <directionalLight color="#ffffff" intensity={1.1} position={[4.0, 3.5, -4.0]} />
      <pointLight color="#c9a962" intensity={0.9} position={[0.8, 1.5, -0.8]} distance={12} />
    </group>
  )
}

function OceanScene({ progress }: { progress: number }) {
  // REAL ASSETS: ocean.glb + cargo_ship.glb
  const alpha = progress
  const oceanGroupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const { scene: shipScene } = useLazyGLB('/models/cargo_ship.glb')
  const { scene: oceanGLB, animations: oceanAnims } = useLazyGLB('/models/ocean.glb')

  useEffect(() => {
    if (oceanGLB && oceanAnims && oceanAnims.length > 0) {
      const mixer = new THREE.AnimationMixer(oceanGLB)
      const action = mixer.clipAction(oceanAnims[0])
      action.play()
      mixerRef.current = mixer
    }
    return () => {
      mixerRef.current?.stopAllAction()
      mixerRef.current = null
    }
  }, [oceanGLB, oceanAnims])

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta * 0.75)
    } else if (oceanGroupRef.current) {
      oceanGroupRef.current.position.y = -0.48 + Math.sin(state.clock.elapsedTime * 0.4) * 0.03
    }
  })

  return (
    <group visible={alpha > 0.01} position={[0, 0, 0]}>
      {/* 1. Underlying continuous dark ocean plane to ensure 100% full screen coverage edge-to-edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, -5]} receiveShadow>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color="#0c1826" roughness={0.15} metalness={0.65} transparent opacity={alpha * 0.95} />
      </mesh>

      {/* 2. 3D Animated Ocean Mesh (ocean.glb is already oriented along X-Z in its internal root node) */}
      {oceanGLB && (
        <group
          ref={oceanGroupRef}
          position={[0, -0.38, -6]}
          rotation={[0, 0, 0]}
          scale={[12.0, 1.2, 12.0]}
        >
          <primitive object={oceanGLB} />
        </group>
      )}

      {/* Atmospheric horizon glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -55]}>
        <planeGeometry args={[160, 8]} />
        <meshBasicMaterial color="#1a3a5c" transparent opacity={alpha * 0.35} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -50]}>
        <planeGeometry args={[140, 4]} />
        <meshBasicMaterial color="#2a5080" transparent opacity={alpha * 0.2} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Cargo ship sailing across the vast ocean surface */}
      {shipScene && (
        <group position={[0.6, -0.12, -2.6]} rotation={[0, 0.08, 0]}>
          <ShipModel object={shipScene} targetLength={3.2} waterlineRatio={0.45} />
        </group>
      )}

      {/* Atmospheric light for water highlights */}
      <pointLight color="#7ab4e6" intensity={2.0} position={[0, 5, -5]} distance={30} />
      <directionalLight color="#ffffff" intensity={1.8} position={[6, 9, 4]} />

      {/* Wake trail */}
      <points visible={alpha > 0.1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={40}
            array={(() => { const a = new Float32Array(120); for (let i = 0; i < 40; i++) { a[i*3]=0.6-(i*0.14)+(Math.random()-.5)*.3; a[i*3+1]=-0.38+Math.random()*.03; a[i*3+2]=-2.6-i*0.2+(Math.random()-.5)*.2; } return a })()}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#7ab4e6" size={0.035} transparent opacity={alpha * 0.35} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  )
}

function DestinationScene({ progress }: { progress: number }) {
  // REAL ASSET: truck — scaled properly to natural road proportions
  const alpha = progress
  const { scene: truckScene } = useLazyGLB('/models/truck_toyota_corsa_b.glb')

  return (
    <group visible={alpha > 0.01}>
      <GroundPlane opacity={alpha * 0.4} />
      {/* Road Highway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.2, -0.46, 0]} receiveShadow>
        <planeGeometry args={[4.2, 24]} />
        <meshStandardMaterial color="#1e1e22" roughness={0.92} transparent opacity={alpha * 0.88} />
      </mesh>
      {/* Highway lane borders */}
      {[[-1.8, -0.45, 0], [2.2, -0.45, 0]].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x[0], x[1], 0]}>
          <planeGeometry args={[0.08, 24]} />
          <meshBasicMaterial color="#c9a962" transparent opacity={alpha * 0.4} />
        </mesh>
      ))}
      {/* Road centerline dash markings */}
      {[-8, -5, -2, 1, 4, 7, 10].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0.2, -0.448, z]}>
          <planeGeometry args={[0.08, 1.4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={alpha * 0.4} />
        </mesh>
      ))}

      {/* REAL truck — normalized size so it does not overwhelm screen */}
      {truckScene && (
        <group position={[0.5, -0.25, 0.4]} rotation={[0, 0.1, 0]}>
          <AutoCenteredModel object={truckScene} targetSize={0.9} />
        </group>
      )}

      {/* Street / transit headlight atmosphere */}
      <pointLight color="#ffe4b5" intensity={1.5} position={[0.5, 0.8, 1.2]} distance={10} />
      <directionalLight color="#ffffff" intensity={1.2} position={[-3, 5, 4]} />
    </group>
  )
}

function ImpactScene({ progress }: { progress: number }) {
  const alpha = progress
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.02
  })

  return (
    <group visible={alpha > 0.01} ref={groupRef} position={[0, -0.05, -0.3]} >
      <GroundPlane opacity={alpha * 0.5} />
      {[
        { pos: [-1.2, -0.05, -0.3], size: [1.1, 0.45, 0.8], c: '#8B6914' },
        { pos: [-1.2, 0.15, -0.3], size: [1.1, 0.4, 0.8], c: '#9B7924' },
        { pos: [0.6, -0.12, -0.4], size: [0.6, 1.3, 0.6], c: '#666666' },
        { pos: [1.2, -0.08, 0.4], size: [0.7, 0.45, 0.5], c: '#777777' },
        { pos: [0.0, -0.12, -1.2], size: [1.8, 0.3, 1.0], c: '#555555' },
      ].map((item, i) => (
        <mesh key={i} position={item.pos as [number, number, number]} castShadow receiveShadow>
          <boxGeometry args={item.size as [number, number, number]} />
          <meshStandardMaterial color={item.c} roughness={0.85} transparent opacity={alpha * 0.75} />
        </mesh>
      ))}
      <ambientLight color="#8899bb" intensity={1.0} />
      <pointLight color="#c9a962" intensity={1.2} position={[0, 2.5, 0]} distance={10} />
    </group>
  )
}

function GlobalNetworkScene({ progress }: { progress: number }) {
  // REAL ASSET: earth__astroriah.glb
  const alpha = progress
  const globeRef = useRef<THREE.Group>(null)
  const { scene: earthGLB } = useLazyGLB('/models/earth__astroriah.glb')

  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.04
  })

  return (
    <group visible={alpha > 0.01}>
      {/* Atmospheric glow */}
      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial color="#1a3a5c" transparent opacity={alpha * 0.1} side={THREE.BackSide} />
      </mesh>
      {/* ONLY real earth asset */}
      <group ref={globeRef}>
        {earthGLB ? (
          <group scale={2.5}>
            <primitive object={earthGLB.clone()} />
          </group>
        ) : (
          /* Placeholder while GLB loads */
          <mesh>
            <sphereGeometry args={[2.8, 36, 36]} />
            <meshStandardMaterial color="#0d2137" roughness={0.5} metalness={0.35} transparent opacity={alpha * 0.5} />
          </mesh>
        )}
      </group>
      {/* Trade routes — always visible */}
      {[
        [[2.2, 1.8, 1.2], [-1.8, -1.2, -2.0]],
        [[-2.2, 0.6, -1.2], [2.0, -0.6, 1.4]],
        [[0.6, 2.6, -0.6], [-1.2, -1.8, 0.6]],
        [[-2.0, -0.9, 1.8], [1.4, 1.4, -1.2]],
        [[-0.5, 2.0, 1.5], [1.0, -1.5, -0.8]],
      ].map(([start, end], i) => {
        const mid = new THREE.Vector3(
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2 + 1.5,
          (start[2] + end[2]) / 2
        )
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(...start), mid, new THREE.Vector3(...end)
        )
        const pts = Array.from({ length: 60 }, (_, j) => curve.getPoint(j / 59))
        const posArr = new Float32Array(pts.length * 3)
        pts.forEach((p, idx) => { posArr[idx*3]=p.x; posArr[idx*3+1]=p.y; posArr[idx*3+2]=p.z })
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={60} array={posArr} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color="#c9a962" transparent opacity={alpha * 0.4} />
          </line>
        )
      })}
    </group>
  )
}

// ─── Scene map ───────────────────────────────────────────────────────

const SCENE_MAP: Record<string, React.FC<{ progress: number }>> = {
  ORIGIN: OriginScene,
  SOURCE: SourceScene,
  CLINKER: ClinkerScene,
  CEMENT: CementScene,
  BAUXITE: BauxiteScene,
  PREPARATION: PreparationScene,
  PORT: PortScene,
  OCEAN: OceanScene,
  DESTINATION: DestinationScene,
  IMPACT: ImpactScene,
  GLOBAL_NETWORK: GlobalNetworkScene,
}

// ─── SceneController — single scene at a time ──────────────────────

function SceneController({ scrollProgress }: { scrollProgress: number }) {
  const sectionEntries = Object.entries(SCENE_SECTIONS) as [SectionName, typeof SCENE_SECTIONS[SectionName]][]

  // Pick the scene whose window contains scrollProgress
  let activeName: SectionName = 'ORIGIN'
  for (const [name, sec] of sectionEntries) {
    if (name === 'CTA') continue
    if (scrollProgress >= sec.start) activeName = name
  }
  const lastNonCTA = sectionEntries.filter(([n]) => n !== 'CTA').pop()?.[0] as SectionName
  if (scrollProgress >= 1.0 && lastNonCTA) activeName = lastNonCTA

  // Preload current + next scene GLBs
  const activeIdx = sectionEntries.findIndex(([name]) => name === activeName)
  const lookAhead = sectionEntries.slice(activeIdx, activeIdx + 4)

  useEffect(() => {
    // Immediately preload maritime models on mount so they are cached before user reaches Stage 3
    preloadGLB('/models/cargo_ship.glb')
    preloadGLB('/models/hero_prop_-_harbour_crane.glb')
  }, [])

  useEffect(() => {
    lookAhead.forEach(([name]) => {
      if (name !== 'CTA') {
        SCENE_CONFIGS[name as SectionName]?.glbs.forEach(preloadGLB)
      }
    })
  }, [lookAhead])

  const SceneComp = SCENE_MAP[activeName]
  const activeSec = SCENE_SECTIONS[activeName]
  const alpha = calculateSceneEnvelope(scrollProgress, activeSec.start, activeSec.end, 0.035)

  // Early WebGL GPU prewarming: mount PortScene with visible=false while user scrolls previous stages
  // This completely eliminates any mounting delay or frame drop when reaching PORT!
  const shouldPrewarmPort = scrollProgress >= 0.36 && scrollProgress < SCENE_SECTIONS.PORT.start

  return (
    <>
      {SceneComp && <SceneComp progress={alpha} />}
      {shouldPrewarmPort && <PortScene progress={0} prewarm={true} />}
    </>
  )
}

// ─── Route Line — visible journey path connecting all scenes ───────────
// ─── Route Line — continuous journey path through all scenes ───────────
// One smooth spline connecting every scene, with subtle traveling glow.

function RouteLine({ scrollProgress }: { scrollProgress: number }) {
  // Clean waypoints aligned with the camera's journey arc
  const waypoints = useMemo(() => {
    const sceneOrder = Object.keys(SCENE_SECTIONS).filter((n) => n !== 'CTA') as SectionName[]
    return sceneOrder.map((name) => {
      const sec = SCENE_SECTIONS[name]
      const t = (sec.start + sec.end) / 2
      // Smooth sinusoidal arc across the journey
      return new THREE.Vector3(
        Math.sin(t * Math.PI * 1.6) * 0.7 + (t - 0.5) * 0.6,
        0.15 + Math.sin(t * Math.PI * 1.2) * 0.55,
        t * -9.0 + 0.5
      )
    })
  }, [])

  const { curve, linePoints } = useMemo(() => {
    if (waypoints.length < 2) return { curve: null as THREE.CatmullRomCurve3 | null, linePoints: [] as THREE.Vector3[] }
    const catmull = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.5)
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 400; i++) pts.push(catmull.getPoint(i / 400))
    return { curve: catmull, linePoints: pts }
  }, [waypoints])

  const linePositions = useMemo(() => {
    if (linePoints.length === 0) return null
    const arr = new Float32Array(linePoints.length * 3)
    linePoints.forEach((p, idx) => {
      arr[idx * 3] = p.x; arr[idx * 3 + 1] = p.y; arr[idx * 3 + 2] = p.z
    })
    return arr
  }, [linePoints])

  const travelerPos = useMemo(() => {
    if (!curve) return new THREE.Vector3()
    return curve.getPoint(Math.min(1, Math.max(0, scrollProgress)))
  }, [curve, scrollProgress])

  if (!linePositions) return null

  return (
    <group >
      {/* Main journey path — thin, refined */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePoints.length} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#c9a962" transparent opacity={0.25} depthTest={false} />
      </line>

      {/* Softer outer glow layer */}
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePoints.length} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#c9a962" transparent opacity={0.08} depthTest={false} />
      </line>

      {/* Traveling marker — subtle dot with faint halo */}
      <mesh position={travelerPos}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial color="#ffd97a" transparent opacity={0.85} depthTest={false} />
      </mesh>
      <mesh position={travelerPos}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial color="#c9a962" transparent opacity={0.1} depthTest={false} />
      </mesh>

      {/* Waypoint nodes — small, uniform, meaningful */}
      {waypoints.map((pos, i) => {
        const sceneOrder = Object.keys(SCENE_SECTIONS).filter((n) => n !== 'CTA') as SectionName[]
        const sec = SCENE_SECTIONS[sceneOrder[i]]
        const t = (sec.start + sec.end) / 2
        // Fade nodes near edges
        const fadeIn = Math.min(1, (scrollProgress - sec.start) / 0.04)
        const fadeOut = Math.min(1, (sec.end - scrollProgress) / 0.04)
        const opacity = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut))) * 0.45

        return (
          <group key={i} position={pos}>
            <mesh>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#c9a962" transparent opacity={opacity} depthTest={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// ─── Lighting ────────────────────────────────────────────────────────

function CinematicLights() {
  return (
    <group >
      <ambientLight color="#1a1a2e" intensity={0.55} />
      <hemisphereLight color="#4a6fa5" groundColor="#1a0a00" intensity={0.35} />
      <directionalLight color="#ffe4c4" intensity={1.6} position={[8, 10, 6]} castShadow={true}
        shadow-mapSize={[1024, 1024]} shadow-camera-far={50}
        shadow-camera-left={-12} shadow-camera-right={12}
        shadow-camera-top={12} shadow-camera-bottom={-12} />
      <pointLight color="#c9a962" intensity={0.9} position={[-3, 4, -2]} />
      <pointLight color="#4a6fa5" intensity={0.5} position={[5, -1, -6]} />
      <pointLight color="#2d2d44" intensity={0.35} position={[0, -3, 3]} />
    </group>
  )
}

// ─── Exports ─────────────────────────────────────────────────────────

export { SceneController, RouteLine, CinematicLights }
