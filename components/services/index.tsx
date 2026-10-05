'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import ServiceScenes3D from './ServiceScenes3D'
import VoyageSimulator from './VoyageSimulator'

const SERVICE_LABELS: Record<string, { title: string; subtitle: string }> = {
  FREIGHT: { title: 'Freight Transportation', subtitle: 'Bulk Ocean Chartering' },
  WAREHOUSING: { title: 'Warehousing & Distribution', subtitle: 'Strategic Stockpiling' },
  CUSTOMS: { title: 'Customs Clearance', subtitle: 'Compliance & Certification' },
  SUPPLY_CHAIN: { title: 'Supply Chain Management', subtitle: 'End-to-End Multimodal' },
  LAST_MILE: { title: 'Last-Mile Delivery', subtitle: 'Sub-48h Discharge Protocol' },
}

export default function ServicesSection() {
  const [activeService, setActiveService] = useState('FREIGHT')

  return (
    <section
      id="services"
      className="relative w-full"
      style={{ background: '#070709' }}
    >
      {/* Mobile: stacked */}
      <div className="lg:hidden">
        <div className="w-full relative" style={{ height: '50vh' }}>
          <MobileCanvas activeService={activeService} />
          <MobileOverlay activeService={activeService} />
        </div>
        <div className="border-t" style={{ borderColor: 'rgba(201,169,98,0.1)' }}>
          <VoyageSimulator activeService={activeService} onServiceChange={setActiveService} />
        </div>
      </div>

      {/* Desktop: split-screen */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:min-h-screen">

        {/* LEFT — sticky 3D canvas */}
        <div className="sticky top-0 h-screen relative overflow-hidden">
          <Canvas
            dpr={[1, 2]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              toneMapping: 1,
              toneMappingExposure: 1.05,
            }}
            camera={{ position: [0, 0.35, 5.0], fov: 46, near: 0.1, far: 80 }}
            style={{ background: '#070709' }}
          >
            <Suspense fallback={null}>
              <ServiceScenes3D activeService={activeService} />
            </Suspense>
          </Canvas>

          {/* Top-left service identity — editorial, minimal */}
          <div className="absolute top-10 left-10 z-10">
            <span className="font-mono text-[9px] tracking-[0.35em] uppercase block mb-2" style={{ color: 'rgba(201,169,98,0.35)' }}>
              {activeService.replace('_', ' ')}
            </span>
            <h3 className="font-['Playfair_Display'] text-white leading-[0.95]" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.8rem)', letterSpacing: '-0.01em' }}>
              {SERVICE_LABELS[activeService]?.title}
            </h3>
            <p className="text-white/25 text-[11px] tracking-wider uppercase mt-1">
              {SERVICE_LABELS[activeService]?.subtitle}
            </p>
          </div>

          {/* Bottom-left telemetry hint */}
          <div className="absolute bottom-10 left-10 z-10">
            <span className="font-mono text-[9px] tracking-[0.25em] uppercase block" style={{ color: 'rgba(201,169,98,0.25)' }}>
              Interactive 3D View
            </span>
            <span className="font-mono text-[9px] block mt-0.5" style={{ color: 'rgba(255,255,255,0.12)' }}>
              Move cursor to orbit
            </span>
          </div>

          {/* Decorative frame corners */}
          <CornerMark className="absolute top-8 right-8" />
          <CornerMark flip className="absolute bottom-8 left-8" />

          {/* Gradient fade at edges for depth */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(7,7,9,0.4) 100%)'
          }} />
        </div>

        {/* RIGHT — scrollable console */}
        <div className="relative" style={{ borderLeft: '1px solid rgba(201,169,98,0.08)' }}>
          <VoyageSimulator activeService={activeService} onServiceChange={setActiveService} />
        </div>
      </div>
    </section>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function MobileCanvas({ activeService }: { activeService: string }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: 1,
        toneMappingExposure: 1.05,
      }}
      camera={{ position: [0, 0.35, 5.0], fov: 46, near: 0.1, far: 80 }}
      style={{ background: '#070709' }}
    >
      <Suspense fallback={null}>
        <ServiceScenes3D activeService={activeService} />
      </Suspense>
    </Canvas>
  )
}

function MobileOverlay({ activeService }: { activeService: string }) {
  return (
    <div className="absolute top-5 left-5 z-10">
      <span className="font-mono text-[9px] tracking-[0.3em] uppercase block" style={{ color: 'rgba(201,169,98,0.35)' }}>
        {SERVICE_LABELS[activeService]?.title}
      </span>
    </div>
  )
}

function CornerMark({ className, flip }: { className?: string; flip?: boolean }) {
  const s = flip ? 'border-b border-l' : 'border-t border-r'
  return <div className={`absolute w-5 h-5 ${s} ${className || ''}`} style={{ borderColor: 'rgba(201,169,98,0.15)' }} />
}
