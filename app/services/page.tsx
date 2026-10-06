'use client'

import { useState, useRef, useEffect } from 'react'
import Service3DExperience from '@/components/services/Service3DExperience'
import { SERVICE_ORDER } from '@/lib/serviceCameraConfig'
import VoyageSimulator from '@/components/services/VoyageSimulator'

const SERVICE_META: Record<string, {
  num: string
  title: string
  subtitle: string
  description: string
  tags: string[]
}> = {
  FREIGHT: {
    num: '01',
    title: 'Freight Transportation',
    subtitle: 'Handymax & Supramax Bulk Ocean Chartering',
    description: 'Dedicated berths, weather routing, and global bulk carrier dispatch across 40+ trade lanes.',
    tags: ['Handymax 38K DWT', 'Supramax 58K DWT', 'Weather Routing', 'Dedicated Berths'],
  },
  WAREHOUSING: {
    num: '02',
    title: 'Warehousing & Distribution',
    subtitle: 'Dry Bonded Silos & Strategic Stockpiling',
    description: 'Covered yards, dry bonded silos, and regional stockpiling hubs across the Arabian Gulf and East Africa.',
    tags: ['Dry Bonded Silos', 'Covered Yards', 'Regional Hubs', 'Inventory Mgmt'],
  },
  CUSTOMS: {
    num: '03',
    title: 'Customs Clearance',
    subtitle: 'Tariff Mitigation & Compliance Certification',
    description: 'Priority berthing documentation, SGS & Bureau Veritas assay certification, and full regulatory compliance.',
    tags: ['SGS Certified', 'Bureau Veritas', 'Tariff Mitigation', 'Priority Berthing'],
  },
  SUPPLY_CHAIN: {
    num: '04',
    title: 'Supply Chain Management',
    subtitle: 'End-to-End Multimodal Logistics',
    description: 'Continuous vessel telemetry, index hedging, and full-visibility multimodal logistics from origin to destination.',
    tags: ['Vessel Telemetry', 'Index Hedging', 'Full Visibility', 'Multimodal'],
  },
  LAST_MILE: {
    num: '05',
    title: 'Last-Mile Delivery',
    subtitle: 'Sub-48h Pneumatic Discharge Protocol',
    description: 'Direct discharge into cement grinding mills and megaproject foundations with guaranteed 2,400 T/hr throughput.',
    tags: ['Pneumatic Unloader', 'Grinding Mills', 'Megaprojects', '2,400 T/hr'],
  },
}

export default function ServicesPage() {
  const [currentProgress, setCurrentProgress] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const target = { current: 0 }
    const onScroll = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      // Progress relative to viewport height
      const total = rect.height - window.innerHeight
      const scrolled = -rect.top
      target.current = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    let raf = 0
    const tick = () => {
      setCurrentProgress((p) => {
        const next = p + (target.current - p) * 0.08
        return Math.abs(next - target.current) < 0.0005 ? target.current : next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Determine active service from scroll progress
  const segSize = 1 / SERVICE_ORDER.length
  const rawIdx = currentProgress / segSize
  const idx = Math.min(SERVICE_ORDER.length - 1, Math.max(0, Math.floor(rawIdx)))
  const activeService = SERVICE_ORDER[idx]

  const meta = SERVICE_META[activeService]

  return (
    <section ref={sectionRef} className="relative w-full" style={{ background: '#070709', minHeight: '500vh' }}>
      {/* 3D Canvas — fixed, single shared environment */}
      <Service3DExperience scrollProgress={currentProgress} activeService={activeService} />

      {/* Sticky UI overlay */}
      <div className="sticky top-0 h-screen flex flex-col justify-between pointer-events-none">
        {/* Top: service identity */}
        <div className="pt-10 md:pt-14 px-8 md:px-12 lg:px-20">
          <span
            className="font-mono text-[9px] tracking-[0.4em] uppercase block mb-2 transition-all duration-700"
            style={{ color: 'rgba(201,169,98,0.4)' }}
          >
            SAV PRIME — SERVICES
          </span>
          <h2
            key={activeService}
            className="font-['Playfair_Display'] text-white leading-[0.92] transition-all duration-700"
            style={{ fontSize: 'clamp(2rem, 3.8vw, 3.8rem)', letterSpacing: '-0.02em' }}
          >
            {meta.title.split(' ').map((word, i, arr) =>
              i === arr.length - 1 && arr.length > 1 ? (
                <span key={i} style={{ color: '#c9a962' }}>{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h2>
          <p
            key={activeService + '-sub'}
            className="text-white/30 text-sm font-light max-w-lg mt-3.5 leading-relaxed transition-all duration-700"
          >
            {meta.description}
          </p>
        </div>

        {/* Right-side service tags */}
        <div className="absolute top-1/2 -translate-y-1/2 right-8 md:right-12 lg:right-20 hidden md:flex flex-col gap-2 items-end">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] tracking-[0.15em] uppercase transition-all duration-700 px-2 py-1"
              style={{ color: 'rgba(201,169,98,0.35)', borderRight: '1px solid rgba(201,169,98,0.15)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom: service number + scroll hint */}
        <div className="pb-10 md:pb-14 px-8 md:px-12 lg:px-20 flex items-end justify-between">
          <div>
            <span
              key={activeService + '-num'}
              className="font-mono text-5xl md:text-6xl transition-all duration-700"
              style={{ color: 'rgba(201,169,98,0.12)', lineHeight: 1 }}
            >
              {meta.num}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="font-mono text-[8px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.12)' }}>
              {meta.subtitle}
            </span>
            <span className="font-mono text-[8px] tracking-wider" style={{ color: 'rgba(201,169,98,0.2)' }}>
              Scroll to explore
            </span>
          </div>
        </div>
      </div>

      {/* Floating service detail popup */}
      <div
        className="hidden lg:block fixed z-20 pointer-events-none"
        style={{ bottom: '48px', right: '24px', maxWidth: '260px' }}
        key={activeService + '-popup'}
      >
        <div
          className="px-5 py-4"
          style={{
            background: 'rgba(8,8,10,0.92)',
            border: '1px solid rgba(201,169,98,0.12)',
            backdropFilter: 'blur(20px)',
            animation: 'servicePopupIn 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Service number */}
          <span
            className="font-mono text-[9px] tracking-[0.3em] uppercase block mb-2"
            style={{ color: 'rgba(201,169,98,0.45)' }}
          >
            {meta.num} // {activeService.replace('_', ' ')}
          </span>

          {/* Title */}
          <h3
            className="font-['Playfair_Display'] text-white leading-[1.1] mb-2"
            style={{ fontSize: 'clamp(0.95rem, 1.1vw, 1.15rem)', letterSpacing: '-0.01em' }}
          >
            {meta.title}
          </h3>

          {/* Description */}
          <p
            className="text-white/40 text-[11px] font-light leading-relaxed mb-3"
            style={{ lineHeight: '1.6' }}
          >
            {meta.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-mono text-[8px] tracking-[0.15em] uppercase px-1.5 py-0.5"
                style={{
                  color: 'rgba(201,169,98,0.4)',
                  border: '1px solid rgba(201,169,98,0.08)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Popup entrance keyframes injected once */}
      <style jsx global>{`
        @keyframes servicePopupIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Right panel: service selector + voyage simulator */}
      <div className="hidden lg:block fixed top-0 right-0 h-screen overflow-y-auto pointer-events-auto" style={{ width: '380px', borderLeft: '1px solid rgba(201,169,98,0.07)', background: 'rgba(7,7,9,0.85)', backdropFilter: 'blur(24px)' }}>
        <VoyageSimulator activeService={activeService} />
      </div>

      {/* Bottom scroll spacer for last service */}
      <div className="h-[100vh]" />
    </section>
  )
}
