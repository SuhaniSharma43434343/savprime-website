'use client'

import { useState, useEffect } from 'react'

export default function Hero({ scrollProgress }: { scrollProgress: number }) {
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      setVisible(window.scrollY < window.innerHeight)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const opacity = scrolled ? 0 : 1 - scrollProgress * 4

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 transition-opacity duration-700"
      style={{ opacity: Math.max(0, Math.min(1, opacity)) }}
    >
      <div className="mb-6">
        <span className="section-label block mb-8">SAV PRIME — MATERIAL JOURNEY</span>
      </div>

      <h1 className="hero-title text-white max-w-5xl mx-auto mb-8"
          style={{ fontSize: 'clamp(3.5rem, 9vw, 9rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}>
        MOVING<br />
        MATERIALS<span className="text-brand-gold">.</span>
      </h1>

      <p className="text-white/30 text-sm md:text-base font-light tracking-wider uppercase mb-12 max-w-md mx-auto">
        Connecting markets through global supply chains
      </p>

      <div className="flex flex-col items-center gap-4">
        <div
          className="w-px h-16 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-px bg-brand-gold/50 absolute top-0"
            style={{
              height: '100%',
              animation: 'scrollLine 2s ease-in-out infinite',
            }}
          />
        </div>
        <span className="text-white/25 text-[10px] tracking-[0.3em] uppercase">
          Scroll to explore
        </span>
      </div>
    </div>
  )
}
