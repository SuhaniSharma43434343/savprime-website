'use client'

import { useRef, useEffect, useState } from 'react'
import { getCurrentSection, SCENE_SECTIONS } from '@/lib/animation'
import type { SectionName } from '@/lib/animation'

const SECTION_LABELS: Record<SectionName, {
  label: string
  title: string
  subtitle: string
  copy?: string
  align: 'left' | 'center' | 'right'
  showCta?: boolean
  services?: string[]
}> = {
  ORIGIN: {
    label: '01 — ORIGIN',
    title: 'EVERY JOURNEY\nSTARTS SOMEWHERE.',
    subtitle: 'A material begins as a source, long before it reaches a market.',
    align: 'center',
  },
  SOURCE: {
    label: '02 — SOURCE',
    title: 'SOURCE',
    subtitle: 'Where it begins.',
    copy: 'Materials are extracted from geological formations — the raw beginning of every supply chain.',
    align: 'left',
  },
  CLINKER: {
    label: '03 — MATERIAL',
    title: 'CLINKER',
    subtitle: 'The raw material.',
    copy: 'A key intermediary in industrial production, clinker forms the foundation of the cement journey.',
    align: 'left',
  },
  CEMENT: {
    label: '04 — TRANSFORMATION',
    title: 'CEMENT',
    subtitle: 'Transformed.',
    copy: 'From raw mineral to refined material — the transformation that makes construction possible.',
    align: 'left',
  },
  BAUXITE: {
    label: '05 — MATERIAL',
    title: 'BAUXITE',
    subtitle: 'Mineral origins.',
    copy: 'The primary ore for aluminium — a critical material in global industrial supply chains.',
    align: 'right',
  },
  PREPARATION: {
    label: '06 — PREPARATION',
    title: 'PREPARED\nFOR MOVEMENT.',
    subtitle: 'The material moves from source into the logistics chain.',
    services: ['FREIGHT', 'CUSTOMS', 'WAREHOUSING', 'DISTRIBUTION'],
    align: 'left',
  },
  PORT: {
    label: '07 — PORT',
    title: 'PORT',
    subtitle: 'Gateway to markets.',
    copy: 'Where land meets sea. The port is the critical node connecting supply chains to global routes.',
    align: 'center',
  },
  OCEAN: {
    label: '08 — OCEAN',
    title: 'MOVING MATERIALS\nACROSS MARKETS.',
    subtitle: 'The journey continues across open waters.',
    align: 'center',
  },
  DESTINATION: {
    label: '09 — DESTINATION',
    title: 'FROM SOURCE\nTO DESTINATION.',
    subtitle: 'The journey continues through the final stage of delivery.',
    align: 'right',
  },
  IMPACT: {
    label: '10 — IMPACT',
    title: 'CREATING WHAT\nMOVES THE WORLD.',
    subtitle: 'The journey ends where materials become part of something larger.',
    align: 'left',
  },
  GLOBAL_NETWORK: {
    label: '11 — NETWORK',
    title: 'ONE JOURNEY.\nA GLOBAL NETWORK.',
    subtitle: 'The single route expands into a connected global network.',
    align: 'center',
  },
  CTA: {
    label: '',
    title: 'YOUR MARKET.\nOUR NETWORK.',
    subtitle: 'We move the materials that move the world.',
    align: 'center',
    showCta: true,
  },
}

const GOLD_WORDS = ['MARKETS.', 'NETWORK.', 'JOURNEY.', 'GLOBAL']

export default function JourneyUI({ scrollProgress }: { scrollProgress: number }) {
  const [section, setSection] = useState<SectionName>('ORIGIN')
  const [displayTitle, setDisplayTitle] = useState('')
  const [displaySubtitle, setDisplaySubtitle] = useState('')
  const [displayCopy, setDisplayCopy] = useState('')
  const [displayLabel, setDisplayLabel] = useState('')
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center')
  const [showCta, setShowCta] = useState(false)
  const [services, setServices] = useState<string[]>([])

  useEffect(() => {
    const s = getCurrentSection(scrollProgress)
    setSection(s)
  }, [scrollProgress])

  useEffect(() => {
    const data = SECTION_LABELS[section]
    if (!data || !data.title) {
      setDisplayTitle('')
      setDisplaySubtitle('')
      setDisplayCopy('')
      setDisplayLabel('')
      setShowCta(false)
      setServices([])
      return
    }
    setDisplayLabel(data.label)
    setAlign(data.align)
    setShowCta(!!data.showCta)
    setServices(data.services || [])

    const t1 = setTimeout(() => setDisplayTitle(data.title), 80)
    const t2 = setTimeout(() => setDisplaySubtitle(data.subtitle), 180)
    const t3 = setTimeout(() => setDisplayCopy(data.copy || ''), 260)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [section])

  if (!displayTitle && section === 'ORIGIN') return null

  const alignClass =
    align === 'center' ? 'items-center text-center' :
    align === 'right' ? 'items-end text-right' :
    'items-start text-left'

  const isGold = (text: string) => GOLD_WORDS.some(w => text.includes(w))

  return (
    <div
      className={`fixed inset-0 z-30 flex ${alignClass} pointer-events-none`}
      style={{ padding: '0 8vw' }}
    >
      <div className="max-w-2xl py-32">
        {displayLabel && (
          <div className="section-label mb-5 md:mb-7" style={{ opacity: displayLabel ? 0.6 : 0 }}>
            {displayLabel}
          </div>
        )}

        <div className="overflow-hidden">
          <h2
            className="hero-title text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] tracking-[-0.03em]"
            style={{
              opacity: displayTitle ? 1 : 0,
              transform: displayTitle ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {displayTitle.split('\n').map((line, i, arr) => (
              <span key={i}>
                {isGold(line) ? (
                  <span className="text-brand-gold">{line}</span>
                ) : (
                  line
                )}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>
        </div>

        {displaySubtitle && (
          <div style={{
            opacity: displaySubtitle ? 1 : 0,
            transform: displaySubtitle ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
          }}>
            <p className="hero-subtitle text-xs md:text-sm text-white/60 mt-4 md:mt-6 max-w-md font-light tracking-wide">
              {displaySubtitle}
            </p>
          </div>
        )}

        {displayCopy && (
          <div style={{
            opacity: displayCopy ? 1 : 0,
            transform: displayCopy ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.25s',
          }}>
            <p className="hero-subtitle text-xs md:text-sm text-white/35 mt-3 max-w-lg font-light leading-relaxed">
              {displayCopy}
            </p>
          </div>
        )}

        {services.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-8" style={{
            opacity: services.length > 0 ? 1 : 0,
            transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
          }}>
            {services.map((svc) => (
              <span key={svc} className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-brand-gold/70 border border-brand-gold/20 px-4 py-2">
                {svc}
              </span>
            ))}
          </div>
        )}

        {showCta && (
          <div
            className="mt-10 pointer-events-auto"
            style={{
              opacity: scrollProgress > 0.97 ? 1 : 0,
              transition: 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
            }}
          >
            <button className="cta-button">Let&apos;s Connect</button>
          </div>
        )}
      </div>
    </div>
  )
}
