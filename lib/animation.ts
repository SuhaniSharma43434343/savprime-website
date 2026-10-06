import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ─── Scroll Sections Progress Boundaries ────────────────────────────────────
export const SCENE_SECTIONS = {
  ORIGIN:         { start: 0.00, end: 0.12, label: '01 — ORIGIN' },
  SOURCE:         { start: 0.12, end: 0.20, label: '02 — SOURCE' },
  CLINKER:        { start: 0.20, end: 0.29, label: '03 — CLINKER' },
  CEMENT:         { start: 0.29, end: 0.38, label: '04 — CEMENT' },
  BAUXITE:        { start: 0.38, end: 0.48, label: '05 — BAUXITE' },
  PREPARATION:    { start: 0.48, end: 0.56, label: '06 — PREPARATION' },
  PORT:           { start: 0.56, end: 0.68, label: '07 — PORT' },
  OCEAN:          { start: 0.68, end: 0.78, label: '08 — OCEAN' },
  DESTINATION:    { start: 0.78, end: 0.85, label: '09 — DESTINATION' },
  IMPACT:         { start: 0.85, end: 0.92, label: '10 — IMPACT' },
  GLOBAL_NETWORK: { start: 0.92, end: 0.97, label: '11 — NETWORK' },
  CTA:            { start: 0.97, end: 1.00, label: '' },
}

export type SectionName = keyof typeof SCENE_SECTIONS

export interface CameraKeyframe {
  position: [number, number, number]
  lookAt: [number, number, number]
  fov: number
  fogColor: string
  lightColor: string
  lightIntensity: number
}

// ─── Cinematic Camera Keyframes (Continuous Journey Arc) ─────────────────
// Camera follows a smooth narrative arc from origin → source → material →
// transformation → preparation → port → ocean → destination → impact → global
// Each keyframe naturally flows into the next with consistent motion direction.

export const CAMERA_PATHS: Record<SectionName, CameraKeyframe> = {
  ORIGIN: {
    position: [-1.2, 0.6, 3.0],
    lookAt: [0.7, 0.15, -0.3],
    fov: 50,
    fogColor: '#050508',
    lightColor: '#c9a962',
    lightIntensity: 2.2,
  },
  SOURCE: {
    position: [0.3, 0.8, 2.6],
    lookAt: [0.5, 0.35, -1.6],
    fov: 52,
    fogColor: '#0a0806',
    lightColor: '#d6a86c',
    lightIntensity: 2.4,
  },
  CLINKER: {
    position: [1.0, 0.7, 2.2],
    lookAt: [0.2, 0.35, 0.2],
    fov: 46,
    fogColor: '#120a05',
    lightColor: '#ff9d42',
    lightIntensity: 2.8,
  },
  CEMENT: {
    position: [0.4, 0.9, 1.8],
    lookAt: [-0.1, 0.05, -0.3],
    fov: 50,
    fogColor: '#090a0c',
    lightColor: '#b8c0cc',
    lightIntensity: 2.0,
  },
  BAUXITE: {
    position: [-0.6, 0.75, 2.4],
    lookAt: [0.7, 0.1, -0.6],
    fov: 48,
    fogColor: '#0f0705',
    lightColor: '#e07a5f',
    lightIntensity: 2.5,
  },
  PREPARATION: {
    position: [0.0, 1.2, 2.2],
    lookAt: [0.4, 0.15, -1.4],
    fov: 52,
    fogColor: '#08090c',
    lightColor: '#c9a962',
    lightIntensity: 2.1,
  },
  PORT: {
    position: [0.35, 0.9, 7.5],
    lookAt: [0.05, -0.35, -0.5],
    fov: 50,
    fogColor: '#06070a',
    lightColor: '#ded8ce',
    lightIntensity: 2.3,
  },
  OCEAN: {
    position: [-0.8, 1.6, 2.4],
    lookAt: [1.0, -0.2, -3.2],
    fov: 56,
    fogColor: '#030712',
    lightColor: '#6da0e8',
    lightIntensity: 2.6,
  },
  DESTINATION: {
    position: [-0.5, 1.1, 4.2],
    lookAt: [0.5, -0.05, 0.5],
    fov: 50,
    fogColor: '#060a0f',
    lightColor: '#c9a962',
    lightIntensity: 2.2,
  },
  IMPACT: {
    position: [0.2, 2.0, 3.5],
    lookAt: [0, 0.1, 0],
    fov: 46,
    fogColor: '#08080c',
    lightColor: '#dfd2b5',
    lightIntensity: 2.4,
  },
  GLOBAL_NETWORK: {
    position: [0, 2.8, 5.5],
    lookAt: [0, 0, 0],
    fov: 58,
    fogColor: '#050508',
    lightColor: '#c9a962',
    lightIntensity: 2.0,
  },
  CTA: {
    position: [0, 2.5, 4.0],
    lookAt: [0, 0, 0],
    fov: 54,
    fogColor: '#050508',
    lightColor: '#c9a962',
    lightIntensity: 2.0,
  },
}

// Ordered control points with their timeline progress centers
const CONTROL_KEYS = Object.keys(SCENE_SECTIONS) as SectionName[]
const KEYFRAME_DATA = CONTROL_KEYS.map((k) => {
  const sec = SCENE_SECTIONS[k]
  // Keyframe peak position centered inside section
  const t = (sec.start + sec.end) / 2
  return { key: k, t, kf: CAMERA_PATHS[k] }
})

// Ensure start and end bounds cover 0.0 and 1.0 exactly
KEYFRAME_DATA[0].t = 0.0
KEYFRAME_DATA[KEYFRAME_DATA.length - 1].t = 1.0

// ─── Time-Parameterized Catmull-Rom Cubic Hermite Spline ────────────────────
function hermiteInterpolate(p0: number, p1: number, m0: number, m1: number, s: number): number {
  const s2 = s * s
  const s3 = s2 * s
  const h00 = 2 * s3 - 3 * s2 + 1
  const h10 = s3 - 2 * s2 + s
  const h01 = -2 * s3 + 3 * s2
  const h11 = s3 - s2
  return h00 * p0 + h10 * m0 + h01 * p1 + h11 * m1
}

function getSegmentData(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress))
  let idx = 0
  for (let i = 0; i < KEYFRAME_DATA.length - 1; i++) {
    if (clamped <= KEYFRAME_DATA[i + 1].t) {
      idx = i
      break
    }
  }

  const i0 = Math.max(0, idx - 1)
  const i1 = idx
  const i2 = Math.min(KEYFRAME_DATA.length - 1, idx + 1)
  const i3 = Math.min(KEYFRAME_DATA.length - 1, idx + 2)

  const k0 = KEYFRAME_DATA[i0]
  const k1 = KEYFRAME_DATA[i1]
  const k2 = KEYFRAME_DATA[i2]
  const k3 = KEYFRAME_DATA[i3]

  const span = Math.max(0.0001, k2.t - k1.t)
  const s = Math.max(0, Math.min(1, (clamped - k1.t) / span))

  return { k0, k1, k2, k3, span, s }
}

export function getSplineCameraFrame(progress: number) {
  const { k0, k1, k2, k3, span, s } = getSegmentData(progress)

  // Tangents for position
  const posTarget = new THREE.Vector3()
  for (let c = 0; c < 3; c++) {
    const p0 = k0.kf.position[c]
    const p1 = k1.kf.position[c]
    const p2 = k2.kf.position[c]
    const p3 = k3.kf.position[c]

    const m0 = 0.5 * (p2 - p0) * (span / Math.max(0.0001, k2.t - k0.t))
    const m1 = 0.5 * (p3 - p1) * (span / Math.max(0.0001, k3.t - k1.t))

    const val = hermiteInterpolate(p1, p2, m0, m1, s)
    if (c === 0) posTarget.x = val
    if (c === 1) posTarget.y = val
    if (c === 2) posTarget.z = val
  }

  // Tangents for lookAt
  const lookTarget = new THREE.Vector3()
  for (let c = 0; c < 3; c++) {
    const p0 = k0.kf.lookAt[c]
    const p1 = k1.kf.lookAt[c]
    const p2 = k2.kf.lookAt[c]
    const p3 = k3.kf.lookAt[c]

    const m0 = 0.5 * (p2 - p0) * (span / Math.max(0.0001, k2.t - k0.t))
    const m1 = 0.5 * (p3 - p1) * (span / Math.max(0.0001, k3.t - k1.t))

    const val = hermiteInterpolate(p1, p2, m0, m1, s)
    if (c === 0) lookTarget.x = val
    if (c === 1) lookTarget.y = val
    if (c === 2) lookTarget.z = val
  }

  // FOV interpolation
  const fov0 = k0.kf.fov
  const fov1 = k1.kf.fov
  const fov2 = k2.kf.fov
  const fov3 = k3.kf.fov
  const mFov0 = 0.5 * (fov2 - fov0) * (span / Math.max(0.0001, k2.t - k0.t))
  const mFov1 = 0.5 * (fov3 - fov1) * (span / Math.max(0.0001, k3.t - k1.t))
  const fov = hermiteInterpolate(fov1, fov2, mFov0, mFov1, s)

  // Color interpolation for atmospheric lighting
  const color1 = new THREE.Color(k1.kf.fogColor)
  const color2 = new THREE.Color(k2.kf.fogColor)
  const fogColor = new THREE.Color().lerpColors(color1, color2, s)

  const lightC1 = new THREE.Color(k1.kf.lightColor)
  const lightC2 = new THREE.Color(k2.kf.lightColor)
  const lightColor = new THREE.Color().lerpColors(lightC1, lightC2, s)

  const lightIntensity = THREE.MathUtils.lerp(k1.kf.lightIntensity, k2.kf.lightIntensity, s)

  return {
    position: posTarget,
    lookAt: lookTarget,
    fov,
    fogColor,
    lightColor,
    lightIntensity,
  }
}

// ─── Smooth Scene Envelope for Zero Pop-in ──────────────────────────────────
export function calculateSceneEnvelope(
  scrollProgress: number,
  start: number,
  end: number,
  overlap: number = 0.035
): number {
  const fadeInStart = Math.max(0, start - overlap)
  const fadeInEnd = start + overlap * 0.7
  const fadeOutStart = end - overlap * 0.7
  const fadeOutEnd = Math.min(1, end + overlap)

  if (scrollProgress < fadeInStart || scrollProgress > fadeOutEnd) return 0
  if (scrollProgress < fadeInEnd) {
    const t = (scrollProgress - fadeInStart) / (fadeInEnd - fadeInStart)
    return t * t * (3 - 2 * t) // smoothstep ease-in
  }
  if (scrollProgress > fadeOutStart) {
    const t = (fadeOutEnd - scrollProgress) / (fadeOutEnd - fadeOutStart)
    return t * t * (3 - 2 * t) // smoothstep ease-out
  }
  return 1.0
}

export function getCurrentSection(progress: number): SectionName {
  for (const [name, section] of Object.entries(SCENE_SECTIONS)) {
    if (progress >= section.start && progress < section.end) {
      return name as SectionName
    }
  }
  return 'CTA'
}

export function getSectionProgress(progress: number, section: SectionName): number {
  const s = SCENE_SECTIONS[section]
  return Math.max(0, Math.min(1, (progress - s.start) / (s.end - s.start)))
}

export const ROUTE_COLORS = {
  geological: '#8B4513',
  material: '#A0522D',
  warehouse: '#c9a962',
  port: '#4682B4',
  shipping: '#1E90FF',
  road: '#D2B48C',
  network: '#c9a962',
}
