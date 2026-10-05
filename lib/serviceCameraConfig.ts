import * as THREE from 'three'
import type { CameraKeyframe } from '@/lib/animation'

/* ─── Single Model: service.glb (parcel depot & sorting hall) ───────────────
   Scene bounds (from node positions): X -14→8, Y 0→4.6, Z -12→7
   Camera orbits the origin, looking inward.

   Service → Area mapping:
   1. FREIGHT          → Loading docks (x=-11, z=-2) — vans, lorries, forklifts
   2. WAREHOUSING      → Storage/sorting zone (x=3, z=2) — cages, chutes, racks
   3. CUSTOMS          → Scanner/inspection line (x=0, z=-3) — scanner arch, diverter
   4. SUPPLY_CHAIN     → Central conveyor spine (x=0, z=1) — conveyors, sorting
   5. LAST_MILE        → Dispatch bay (x=-11, z=2) — delivery vans, check-in counter
   ─────────────────────────────────────────────────────────────────────── */

export interface ServiceCameraFrame {
  cameraPos: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  fogNear: number
  fogFar: number
  fogColor: string
  keyLightPos: [number, number, number]
  keyLightColor: string
  keyLightIntensity: number
  emissiveBoost: number
}

export const SERVICE_FRAMES: Record<string, ServiceCameraFrame> = {
  FREIGHT: {
    // Looking into the left bay where delivery vans, lorries, forklifts park
    cameraPos: [-8.5, 2.0, -1.5],
    lookAt: [-12.5, 0.3, -2.0],
    fov: 52,
    fogNear: 1.5,
    fogFar: 36,
    fogColor: '#0a0a0a',
    keyLightPos: [-6, 7, 2],
    keyLightColor: '#ffd97a',
    keyLightIntensity: 3.2,
    emissiveBoost: 0.15,
  },
  WAREHOUSING: {
    // Looking into the right-side sorting/storage area
    cameraPos: [6.5, 2.8, 3.5],
    lookAt: [4.5, 0.2, 0.5],
    fov: 50,
    fogNear: 1.5,
    fogFar: 34,
    fogColor: '#0c0a06',
    keyLightPos: [7, 6, -1],
    keyLightColor: '#ffe4b5',
    keyLightIntensity: 3.0,
    emissiveBoost: 0.12,
  },
  CUSTOMS: {
    // Close-up on the scanner arch and diverter units (central inspection line)
    cameraPos: [0.5, 1.4, -3.5],
    lookAt: [0.0, 0.5, -3.5],
    fov: 44,
    fogNear: 1.0,
    fogFar: 28,
    fogColor: '#0a0e14',
    keyLightPos: [-1, 5, -3],
    keyLightColor: '#e0f0ff',
    keyLightIntensity: 3.5,
    emissiveBoost: 0.25,
  },
  SUPPLY_CHAIN: {
    // Overview along the central conveyor corridor
    cameraPos: [1.0, 3.2, -2.5],
    lookAt: [0.0, 0.1, 1.0],
    fov: 54,
    fogNear: 2.0,
    fogFar: 38,
    fogColor: '#0a0c10',
    keyLightPos: [2, 7, 1],
    keyLightColor: '#c9a962',
    keyLightIntensity: 2.8,
    emissiveBoost: 0.1,
  },
  LAST_MILE: {
    // Dispatch bay — open delivery vans and driver check-in counter
    cameraPos: [-8.5, 2.0, 3.0],
    lookAt: [-12.5, 0.3, 2.0],
    fov: 50,
    fogNear: 1.5,
    fogFar: 34,
    fogColor: '#0c0a06',
    keyLightPos: [-4, 6, 5],
    keyLightColor: '#ffe4b5',
    keyLightIntensity: 3.0,
    emissiveBoost: 0.12,
  },
}

// Order defines camera path sequence for smooth spline travel
export const SERVICE_ORDER = ['FREIGHT', 'WAREHOUSING', 'CUSTOMS', 'SUPPLY_CHAIN', 'LAST_MILE'] as const

export type ServiceId = typeof SERVICE_ORDER[number]

export function getServiceProgress(overallProgress: number, serviceId: ServiceId): number {
  const idx = SERVICE_ORDER.indexOf(serviceId)
  const segmentSize = 1 / SERVICE_ORDER.length
  const start = idx * segmentSize
  const end = (idx + 1) * segmentSize
  // Normalized 0-1 within the service's scroll window
  return Math.max(0, Math.min(1, (overallProgress - start) / segmentSize))
}
