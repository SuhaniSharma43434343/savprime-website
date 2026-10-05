'use client'

import { useRef, useState } from 'react'

interface LayeredEditorialFrameProps {
  category: string
  title: string
  subtitle: string
  stats: { label: string; value: string }[]
  accentColor?: string
  patternType: 'geological' | 'maritime' | 'industrial'
  aspect?: string
}

export default function LayeredEditorialFrame({
  category,
  title,
  subtitle,
  stats,
  patternType,
  accentColor = '#c9a962',
}: LayeredEditorialFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!frameRef.current) return
    const rect = frameRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    // Gentle 2.5D tilt (max 6 degrees)
    setRotateX((-y / rect.height) * 8)
    setRotateY((x / rect.width) * 8)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
    setIsHovered(false)
  }

  return (
    <div
      ref={frameRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative group cursor-crosshair perspective-[1000px] w-full"
    >
      <div
        className="relative transition-transform duration-300 ease-out border border-white/[0.08] bg-[#0c0c0e]/80 backdrop-blur-md overflow-hidden rounded-sm p-8 sm:p-10 shadow-2xl"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${
            isHovered ? 1.015 : 1
          }, ${isHovered ? 1.015 : 1}, 1)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Decorative corner brackets (Industrial blueprint aesthetic) */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-brand-gold/60 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-brand-gold/60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-brand-gold/60 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-brand-gold/60 pointer-events-none" />

        {/* Ambient Topographical Silhouette Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          {patternType === 'geological' && (
            <svg className="w-full h-full object-cover" viewBox="0 0 400 300" fill="none">
              <path
                d="M0,220 Q70,140 160,200 T320,130 T400,180 L400,300 L0,300 Z"
                fill="url(#geoGrad)"
              />
              <path
                d="M0,190 Q90,110 180,160 T350,110 T400,140"
                stroke="#c9a962"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <defs>
                <linearGradient id="geoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#c9a962" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#050505" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          )}

          {patternType === 'maritime' && (
            <svg className="w-full h-full object-cover" viewBox="0 0 400 300" fill="none">
              <circle cx="200" cy="150" r="120" stroke="#8c8c8c" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.25" />
              <circle cx="200" cy="150" r="70" stroke="#c9a962" strokeWidth="0.8" opacity="0.35" />
              <line x1="40" y1="150" x2="360" y2="150" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
              <line x1="200" y1="20" x2="200" y2="280" stroke="#ffffff" strokeWidth="0.5" opacity="0.2" />
            </svg>
          )}

          {patternType === 'industrial' && (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(201, 169, 98, 0.15) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
          )}
        </div>

        {/* Foreground Content with Parallax translateZ */}
        <div className="relative z-10 flex flex-col justify-between h-full min-h-[260px]" style={{ transform: 'translateZ(20px)' }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-brand-gold/80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                {category}
              </span>
              <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
                SAV-SPEC &bull; 01
              </span>
            </div>

            <h3 className="hero-title text-2xl sm:text-3xl lg:text-4xl text-white font-normal mb-3 tracking-tight">
              {title}
            </h3>

            <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-lg font-light">
              {subtitle}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-white/40 mb-1">
                  {stat.label}
                </span>
                <span className="text-white text-base sm:text-lg font-normal tracking-wide">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
