// Scene configuration — maps each scene to its real GLB assets
// When a real asset loads, procedural fallbacks are suppressed
// Only lightweight effects (particles, route line, fog) are always allowed

import { SectionName } from './animation'
export type { SectionName }

export interface SceneConfig {
  glbs: string[]           // GLB paths — lazy-loaded when scene activates
  shadows: boolean         // enable shadow maps?
  particleCount: number    // particle budget
  preloadScenes: SectionName[] // preload neighboring scenes
}

export const SCENE_CONFIGS: Record<SectionName, SceneConfig> = {
  ORIGIN: {
    glbs: [],
    shadows: false,
    particleCount: 50,
    preloadScenes: ['SOURCE'],
  },
  SOURCE: {
    glbs: ['/models/source.glb'],
    shadows: false,
    particleCount: 80,
    preloadScenes: ['CLINKER'],
  },
  CLINKER: {
    glbs: ['/models/clinker.glb'],
    shadows: true,
    particleCount: 0,
    preloadScenes: ['CEMENT'],
  },
  CEMENT: {
    glbs: ['/models/cement.glb'],
    shadows: false,
    particleCount: 0,
    preloadScenes: ['BAUXITE', 'PORT'],
  },
  BAUXITE: {
    glbs: ['/models/bauxite.glb'],
    shadows: false,
    particleCount: 0,
    preloadScenes: ['PREPARATION', 'PORT'],
  },
  PREPARATION: {
    glbs: ['/models/warehouse.glb'],
    shadows: false,
    particleCount: 0,
    preloadScenes: ['PORT', 'OCEAN'],
  },
  PORT: {
    glbs: [
      '/models/cargo_ship.glb',
      '/models/hero_prop_-_harbour_crane.glb',
    ],
    shadows: false,
    particleCount: 0,
    preloadScenes: ['OCEAN'],
  },
  OCEAN: {
    glbs: ['/models/ocean.glb', '/models/cargo_ship.glb'],
    shadows: false,
    particleCount: 30,
    preloadScenes: ['DESTINATION'],
  },
  DESTINATION: {
    glbs: ['/models/truck_toyota_corsa_b.glb'],
    shadows: false,
    particleCount: 0,
    preloadScenes: ['IMPACT'],
  },
  IMPACT: {
    glbs: [],
    shadows: false,
    particleCount: 0,
    preloadScenes: ['GLOBAL_NETWORK'],
  },
  GLOBAL_NETWORK: {
    glbs: ['/models/earth__astroriah.glb'],
    shadows: false,
    particleCount: 0,
    preloadScenes: ['CTA'],
  },
  CTA: {
    glbs: [],
    shadows: false,
    particleCount: 0,
    preloadScenes: [],
  },
}
