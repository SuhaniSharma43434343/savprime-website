'use client'

import { useState, useRef, useEffect } from 'react'
import { getCurrentSection } from '@/lib/animation'
import type { SectionName } from '@/lib/animation'
import Hero from '@/components/Hero'
import ThreeExperience from '@/components/ThreeExperience'
import JourneyUI from '@/components/JourneyUI'
import DebugIndicator from '@/components/DebugIndicator'
import CinematicLoader from '@/components/CinematicLoader'

export default function Home() {
  const [currentProgress, setCurrentProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  // Ref so the RAF tick always reads the latest target value
  const targetRef = useRef(0)

  useEffect(() => {
    // ── Native browser scroll → update targetRef ──
    const handleScroll = () => {
      targetRef.current = (() => {
        const docHeight = document.documentElement.scrollHeight
        const viewport = window.innerHeight
        const scrollable = docHeight - viewport
        return scrollable > 0 ? window.scrollY / scrollable : 0
      })()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // ── Smooth interpolation loop ──
    let rafId = 0
    const tick = () => {
      setCurrentProgress(prev => {
        const target = targetRef.current
        const next = prev + (target - prev) * 0.14
        return Math.abs(next - target) < 0.0001 ? target : next
      })
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    handleScroll() // initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const currentSection = getCurrentSection(currentProgress)

  return (
    <>
      {/* Real Three.js Asset Preloader & Shutter Reveal */}
      {loading && <CinematicLoader onComplete={() => setLoading(false)} />}

      {/* ─── HERO — first 100vh ─────────────────────────────────── */}
      <section className="hero-section">
        <Hero scrollProgress={currentProgress} />
      </section>

      {/* ─── JOURNEY — 1100vh tall, sticky 3D viewport inside ───── */}
      <section id="journey" className="journey-section">
        <div className="journey-sticky">
          {/* 3D Canvas — pointer-events none so it never blocks scroll */}
          <div className="canvas-wrapper">
            <ThreeExperience scrollProgress={currentProgress} />
          </div>
          {/* Scene labels overlay */}
          <JourneyUI scrollProgress={currentProgress} />
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="text-center px-6 max-w-4xl mx-auto">
          <h2 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[0.95] mb-6">
            YOUR MARKET.<br />
            <span className="text-brand-gold">OUR NETWORK.</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg mb-12 max-w-xl mx-auto font-light leading-relaxed">
            We move the materials that move the world.
          </p>
          <button className="cta-button">Let&apos;s Connect</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-white/30 text-xs tracking-widest uppercase">
              &copy; 2025 SAV Prime
            </span>
            <div className="flex gap-8">
              {['Privacy', 'Terms', 'Contact'].map((l) => (
                <a key={l} href="#" className="text-white/30 hover:text-white/60 text-xs tracking-wider uppercase transition-colors duration-500 no-underline">
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Debug Panel */}
      <DebugIndicator scrollProgress={currentProgress} currentSection={currentSection} />
    </>
  )
}
