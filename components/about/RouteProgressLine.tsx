'use client'

import { useEffect, useState } from 'react'
import { SCENE_SECTIONS } from '@/lib/animation'
import type { SectionName } from '@/lib/animation'

export default function RouteProgressLine() {
  const [progress, setProgress] = useState(0)
  const [currentSection, setCurrentSection] = useState<SectionName>('ORIGIN')

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable > 0) {
        const p = Math.min(1, Math.max(0, window.scrollY / scrollable))
        setProgress(p)

        // Find current section
        let active: SectionName = 'ORIGIN'
        for (const [name, section] of Object.entries(SCENE_SECTIONS)) {
          if (p >= section.start) active = name as SectionName
        }
        setCurrentSection(active)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Overall journey progress maps 0-1 across all scenes (CTA excluded)
  const sceneSpan = 1 - SCENE_SECTIONS.CTA.end
  const journeyProgress = Math.min(1, progress / sceneSpan)

  const sectionEntries = Object.entries(SCENE_SECTIONS).filter(([n]) => n !== 'CTA') as [SectionName, typeof SCENE_SECTIONS[keyof typeof SCENE_SECTIONS]][]

  return (
    <>
      {/* Top progress rail — continuous, subtle */}
      <div className="fixed top-0 left-0 w-full h-[1px] z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-brand-gold/30 via-brand-gold/70 to-brand-gold/30 transition-all duration-300 ease-out"
          style={{ width: `${journeyProgress * 100}%` }}
        />
      </div>

      {/* Vertical journey spine — left margin on desktop, continuous path */}
      <div className="hidden lg:block fixed left-10 top-0 bottom-0 pointer-events-none z-40" style={{ width: '1px' }}>
        {/* Background track */}
        <div className="absolute inset-0 bg-white/[0.03]" />

        {/* Filled progress — continuous */}
        <div
          className="absolute top-0 left-0 w-full bg-gradient-to-b from-brand-gold/50 via-brand-gold/70 to-brand-gold/50 transition-all duration-300 ease-out"
          style={{ height: `${journeyProgress * 100}%` }}
        />

        {/* Section nodes along the spine */}
        {sectionEntries.map(([name, section]) => {
          const nodeProgress = (section.start + section.end) / 2
          const isActive = name === currentSection
          const isPassed = progress >= section.end
          const nodeOpacity = isActive ? 0.9 : isPassed ? 0.5 : 0.2

          return (
            <div
              key={name}
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{ top: `${nodeProgress * 100}%` }}
            >
              <div
                className="rounded-full transition-all duration-500"
                style={{
                  width: isActive ? '7px' : '4px',
                  height: isActive ? '7px' : '4px',
                  backgroundColor: isActive ? '#ffd97a' : '#c9a962',
                  boxShadow: isActive ? '0 0 10px #c9a962, 0 0 20px rgba(201,169,98,0.3)' : 'none',
                  opacity: nodeOpacity,
                }}
              />
              {isActive && (
                <span
                  className="absolute left-5 whitespace-nowrap text-[9px] font-mono tracking-[0.2em] uppercase transition-all duration-500"
                  style={{ color: '#c9a962', opacity: 0.7 }}
                >
                  {section.label}
                </span>
              )}
            </div>
          )
        })}

        {/* Traveling glow head */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
          style={{ top: `${journeyProgress * 100}%` }}
        >
          <div
            className="rounded-full"
            style={{
              width: '9px',
              height: '9px',
              backgroundColor: '#ffd97a',
              boxShadow: '0 0 12px #c9a962, 0 0 24px rgba(201,169,98,0.4)',
            }}
          />
        </div>
      </div>
    </>
  )
}
