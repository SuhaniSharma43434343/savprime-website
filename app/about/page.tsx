'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────
   Hook — page-level scroll progress 0 → 1
   Uses requestAnimationFrame so the value updates at display refresh
   without jank from React's event batching.
   ─────────────────────────────────────────────────────────────── */
function useScrollProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const calc = () => {
      const doc = document.documentElement.scrollHeight - window.innerHeight
      setP(doc > 0 ? Math.min(1, Math.max(0, window.scrollY / doc)) : 0)
    }
    calc()
    let raf = 0
    const tick = () => { calc(); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return p
}

/* ─────────────────────────────────────────────────────────────────
   Easing
   ─────────────────────────────────────────────────────────────── */
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2
}

/* ─────────────────────────────────────────────────────────────────
   SVG line — fixed viewport overlay.
   A single spline drawn in 0-100 viewBox units. The line draws
   itself via stroke-dashoffset as scrollProgress increases.

   The path weaves through the content:
     · hero center → mission left → route center → global right → values center → CTA
   ─────────────────────────────────────────────────────────────── */
const LINE_D = [
  'M 50 4',
  'L 50 20',
  'C 50 28, 28 30, 26 40',
  'L 24 54',
  'C 22 62, 42 64, 58 64',
  'L 74 64',
  'C 84 64, 88 72, 84 82',
  'L 80 90',
  'C 76 96, 56 96, 50 96',
  'L 50 99',
].join(' ')

function JourneyLine({ progress }: { progress: number }) {
  const pathRef = useRef<SVGPathElement>(null)
  const [len, setLen] = useState(1000)
  const [dot, setDot] = useState({ x: 50, y: 4 })

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength())
  }, [])

  // Line fully drawn at scroll 85%
  const draw = easeInOut(Math.min(1, progress / 0.85))

  // Position of the traveling dot
  useEffect(() => {
    if (pathRef.current && len > 0) {
      const pt = pathRef.current.getPointAtLength(Math.min(len * draw, len))
      setDot({ x: pt.x, y: pt.y })
    }
  }, [draw, len])

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* soft glow layer */}
      <path
        d={LINE_D}
        fill="none"
        stroke="rgba(201,169,98,0.06)"
        strokeWidth="0.55"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
      {/* main line */}
      <path
        ref={pathRef}
        d={LINE_D}
        fill="none"
        stroke="rgba(201,169,98,0.3)"
        strokeWidth="0.14"
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
      />
      {/* traveling dot */}
      {draw > 0.01 && (
        <circle cx={dot.x} cy={dot.y} r="0.7" fill="#c9a962">
          <animate attributeName="opacity" values="0.55;1;0.55" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Mineral fragment — displaced icosahedron, warm-gold, slowly
   rotating. Appears in the "Where It Begins" section on the right.
   ─────────────────────────────────────────────────────────────── */
function MineralFragment({ alpha }: { alpha: number }) {
  const ref = useRef<THREE.Mesh>(null)

  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 2)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
      const l = Math.sqrt(x * x + y * y + z * z) || 1
      const n = 1 + (Math.random() - 0.5) * 0.3
      p.setXYZ(i, (x / l) * n, (y / l) * n, (z / l) * n)
    }
    g.computeVertexNormals()
    return g
  }, [])

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c9a962',
    roughness: 0.8,
    metalness: 0.15,
  }), [])

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.12
      ref.current.rotation.x += dt * 0.05
    }
  })

  return (
    <mesh ref={ref} geometry={geo} material={mat} position={[1.4, 0, -1]} scale={0.55} />
  )
}

/* ─────────────────────────────────────────────────────────────────
   Wireframe globe — appears in the "Global Scale" section.
   Low-poly sphere + quadratic arc routes + port markers.
   ─────────────────────────────────────────────────────────────── */
function WireframeGlobe({ alpha }: { alpha: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.04
  })

  const arcs = useMemo(() => {
    const R = 2.5
    return [
      { a: [1.5, 0.5, 1.5] as [number, number, number], b: [-1.5, -0.5, -1.2] as [number, number, number] },
      { a: [-1.8, 1.0, -0.8] as [number, number, number], b: [1.2, -1.0, 1.5] as [number, number, number] },
      { a: [0.5, 2.2, 0.3] as [number, number, number], b: [-1.0, -1.8, -0.5] as [number, number, number] },
    ].map(({ a, b }) => {
      const s = new THREE.Vector3(...a)
      const e = new THREE.Vector3(...b)
      const mid = s.clone().add(e).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.12)
      return new THREE.BufferGeometry().setFromPoints(
        new THREE.QuadraticBezierCurve3(s, mid, e).getPoints(48)
      )
    })
  }, [])

  const ports = useMemo(() => [
    [1.5, 0.5, 1.5],
    [-1.5, -0.5, -1.2],
    [-1.8, 1.0, -0.8],
    [1.2, -1.0, 1.5],
    [0.5, 2.2, 0.3],
    [-1.0, -1.8, -0.5],
  ] as [number, number, number][], [])

  return (
    <group ref={groupRef} position={[-1.3, 0, -1.8]} visible={alpha > 0.01}>
      {/* wireframe sphere */}
      <mesh>
        <sphereGeometry args={[2.5, 28, 28]} />
        <meshBasicMaterial color="#0d2137" wireframe transparent opacity={alpha * 0.35} />
      </mesh>
      {/* subtle fill */}
      <mesh>
        <sphereGeometry args={[2.45, 28, 28]} />
        <meshBasicMaterial color="#1a3a5c" transparent opacity={alpha * 0.06} />
      </mesh>
      {/* route arcs */}
      {arcs.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial color="#c9a962" transparent opacity={alpha * 0.5} />
        </line>
      ))}
      {/* port markers */}
      {ports.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#c9a962" transparent opacity={alpha * 0.85} />
        </mesh>
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Background scene — decides which 3D objects are visible based on
   scroll progress. Both objects share the same fixed camera so only
   one is visible at a time.
   ─────────────────────────────────────────────────────────────── */
function BackgroundScene({ progress }: { progress: number }) {
  // Mineral: visible 10%-38%, peak at 24%
  const mineralRaw = progress < 0.1 ? 0
    : progress > 0.38 ? 0
    : progress < 0.24 ? (progress - 0.1) / 0.14
    : 1 - (progress - 0.24) / 0.14
  const mineralAlpha = Math.max(0, Math.min(1, mineralRaw))

  // Globe: visible 50%-88%, peak at 69%
  const globeRaw = progress < 0.5 ? 0
    : progress > 0.88 ? 0
    : progress < 0.69 ? (progress - 0.5) / 0.19
    : 1 - (progress - 0.69) / 0.19
  const globeAlpha = Math.max(0, Math.min(1, globeRaw))

  return (
    <>
      <MineralFragment alpha={mineralAlpha} />
      <WireframeGlobe alpha={globeAlpha} />
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Reveal — fades + slides a section into view based on progress.
   Directly driven by scroll (no CSS transition — the 60fps RAF
   already smooths the value).
   ─────────────────────────────────────────────────────────────── */
function Reveal({
  children,
  progress,
  start,
  end,
}: {
  children: React.ReactNode
  progress: number
  start: number
  end: number
}) {
  const raw = progress < start ? 0 : progress > end ? 1 : (progress - start) / (end - start)
  const t = raw < 0.5 ? 2 * raw * raw : 1 - ((-2 * raw + 2) ** 2) / 2
  return (
    <div style={{ opacity: t, transform: `translateY(${(1 - t) * 24}px)` }}>
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Content data (factual, from savprime.co)
   ─────────────────────────────────────────────────────────────── */
const ROUTE_WAYPOINTS = ['SOURCE', 'PORT', 'OCEAN', 'DESTINATION']

const VALUES = [
  { num: '01', title: 'TRUST', text: 'Decades of reliable performance across volatile markets.' },
  { num: '02', title: 'PRECISION', text: 'Every tonne tracked, every deadline met, every route optimised.' },
  { num: '03', title: 'SCALE', text: 'Infrastructure that moves millions of tonnes across continents.' },
]

/* ─────────────────────────────────────────────────────────────────
   Page
   ─────────────────────────────────────────────────────────────── */
export default function AboutPage() {
  const progress = useScrollProgress()

  return (
    <main className="relative w-full bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Fixed SVG line overlay */}
      <JourneyLine progress={progress} />

      {/* Fixed 3D canvas — behind HTML content, above page background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          camera={{ position: [0, 0, 6], fov: 50 }}
        >
          <ambientLight intensity={0.4} color="#1a1a2e" />
          <pointLight color="#c9a962" intensity={0.8} position={[3, 2, 3]} distance={12} />
          <BackgroundScene progress={progress} />
        </Canvas>
      </div>

      {/* Sections */}
      <div className="relative" style={{ zIndex: 10 }}>
        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
            <Reveal progress={progress} start={0} end={0.08}>
              <span className="section-label block mb-6">SAV PRIME — ABOUT</span>
              <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.03em] max-w-3xl">
                Moving materials<br />
                across markets.<br />
                <span className="text-brand-gold">With precision.</span>
              </h1>
              <p className="text-white/40 text-sm md:text-base font-light tracking-wider uppercase mt-8 max-w-lg">
                Global supply chain solutions built on trust, speed, and scale.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── WHERE IT BEGINS ─────────────────────────────────── */}
        <section className="relative py-32 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <Reveal progress={progress} start={0.1} end={0.18}>
                <span className="section-label block mb-6">WHERE IT BEGINS</span>
                <h2 className="hero-title text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.03em]">
                  Every journey<br />starts with a<br />single source.
                </h2>
              </Reveal>
              <Reveal progress={progress} start={0.15} end={0.23}>
                <p className="text-white/50 text-base md:text-lg leading-relaxed font-light">
                  Materials are extracted from geological formations — the raw beginning of every supply chain.
                  From the first excavation to the last delivery, every tonne carries the mark of its origin.
                  SAV Prime works at every point along that path.
                </p>
                <p className="text-white/30 text-base md:text-lg leading-relaxed font-light mt-6">
                  The same discipline that built centuries-old supply routes now powers modern industrial flows.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── THE ROUTE ───────────────────────────────────────── */}
        <section className="relative py-32 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 w-full">
            <Reveal progress={progress} start={0.3} end={0.38}>
              <span className="section-label block mb-16">THE ROUTE</span>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0">
                {ROUTE_WAYPOINTS.map((wp, i) => (
                  <div key={wp} className="flex-1 flex flex-col items-center text-center">
                    <span className="text-brand-gold/30 font-mono text-xs tracking-[0.3em] mb-3">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="hero-title text-2xl md:text-3xl tracking-[-0.02em] text-white/90">
                      {wp}
                    </span>
                    {i < ROUTE_WAYPOINTS.length - 1 && (
                      <div
                        className="hidden md:block w-full h-px mt-6"
                        style={{ background: 'linear-gradient(90deg, rgba(201,169,98,0.4), rgba(201,169,98,0.05))' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── GLOBAL SCALE ────────────────────────────────────── */}
        <section className="relative py-32 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <Reveal progress={progress} start={0.5} end={0.58}>
                <span className="section-label block mb-6">GLOBAL SCALE</span>
                <h2 className="hero-title text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-0.03em]">
                  One journey.<br />A <span className="text-brand-gold">global</span> network.
                </h2>
                <p className="text-white/50 text-base md:text-lg leading-relaxed font-light mt-6 max-w-lg">
                  The route you have followed is one of thousands. SAV Prime operates across continents,
                  time zones, and regulatory environments — delivering materials at scale.
                </p>
              </Reveal>
              <Reveal progress={progress} start={0.55} end={0.63}>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '15+', label: 'Countries' },
                    { value: '30+', label: 'Ports' },
                    { value: '2M+', label: 'Tonnes / year' },
                    { value: '24/7', label: 'Coverage' },
                  ].map((s) => (
                    <div key={s.label} className="border border-white/5 p-6">
                      <div className="hero-title text-3xl md:text-4xl text-brand-gold">{s.value}</div>
                      <div className="text-white/30 text-xs uppercase tracking-[0.2em] mt-2">{s.label}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── WHAT WE STAND FOR ───────────────────────────────── */}
        <section className="relative py-32 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
            <Reveal progress={progress} start={0.74} end={0.82}>
              <span className="section-label block mb-20">WHAT WE STAND FOR</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {VALUES.map((v) => (
                  <div key={v.num}>
                    <div className="h-px w-12 mb-8" style={{ background: 'rgba(201,169,98,0.4)' }} />
                    <span className="text-brand-gold/40 font-mono text-xs tracking-[0.3em]">{v.num}</span>
                    <h3 className="hero-title text-3xl md:text-4xl mt-3 mb-5 tracking-[-0.02em]">{v.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed font-light">{v.text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CLOSING CTA ─────────────────────────────────────── */}
        <section className="relative py-32 flex items-center justify-center">
          <Reveal progress={progress} start={0.92} end={1}>
            <div className="text-center px-6 max-w-4xl mx-auto">
              <h2 className="hero-title text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.03em]">
                YOUR MARKET.<br />
                <span className="text-brand-gold">OUR NETWORK.</span>
              </h2>
              <p className="text-white/40 text-base md:text-lg font-light mt-8 max-w-xl mx-auto leading-relaxed">
                Let&apos;s connect your materials to the markets that need them.
              </p>
              <a href="/contact" className="cta-button inline-block mt-12 no-underline">
                Let&apos;s Connect
              </a>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  )
}
