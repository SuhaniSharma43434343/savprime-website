'use client'

import { useRef, useEffect, useState, useMemo } from 'react'

// ─── CHAPTER DATA DEFINITION ────────────────────────────────────────────────
interface Chapter {
  id: string
  actNumber: string
  code: string
  phase: string
  title: string
  subtitle: string
  body: string
  badge: string
  metrics: { label: string; value: string; unit: string; targetNum: number }[]
  telemetry: {
    coordinates: string
    elevation: string
    protocol: string
    status: string
  }
}

const STORY_CHAPTERS: Chapter[] = [
  {
    id: 'extraction',
    actNumber: '01',
    code: 'GEO-EXTRACT-01',
    phase: 'GEOLOGICAL EXTRACTION & ORE INTEGRITY',
    title: 'Earth-Rooted Continuity.',
    subtitle: 'Direct sourcing at the point of primary lithospheric extraction.',
    body: 'True industrial stability begins underground. SAV Prime engineers long-term provenance pacts with Tier-1 limestone quarries, gypsum reserves, and bauxite concessions across the Arabian Peninsula, Vietnam, and India. Every metric ton is sampled for strict lime saturation factor (LSF) and silica modulus before entry into global transit.',
    badge: 'STAGE 1: RAW INGESTION',
    metrics: [
      { label: 'EXTRACTION DEPTH', value: '420', unit: 'm', targetNum: 420 },
      { label: 'ORE PURITY', value: '98.6', unit: '% CaCO₃', targetNum: 98.6 },
      { label: 'PROVEN RESERVES', value: '140', unit: 'M+ MT', targetNum: 140 },
      { label: 'ASSAY ACCURACY', value: '99.8', unit: '%', targetNum: 99.8 },
    ],
    telemetry: {
      coordinates: '24.1284° N, 56.1290° E',
      elevation: '+420m SEA LEVEL',
      protocol: 'ISO 9001 / SGS CORE DRILL',
      status: 'SYSTEM ACTIVE // PROBING STRATA',
    },
  },
  {
    id: 'calcination',
    actNumber: '02',
    code: 'KILN-THERMAL-02',
    phase: 'HIGH-THERMAL CALCINATION & CHEMISTRY',
    title: 'Forged at 1,450°C.',
    subtitle: 'Transforming raw minerals into unyielding clinker nodules.',
    body: 'Inside massive 120-meter horizontal rotary kilns, raw crushed minerals undergo sustained thermal calcination exceeding 1,450°C. Through precise multi-channel burner aerodynamics and controlled satellite cooling, molten liquid phases solidify into dense, hydrophobic clinker nodules engineered to resist maritime degradation.',
    badge: 'STAGE 2: SINTERING MATRIX',
    metrics: [
      { label: 'CALCINATION TEMP', value: '1450', unit: '°C', targetNum: 1450 },
      { label: 'SILICA MODULUS', value: '2.54', unit: 'SM', targetNum: 2.54 },
      { label: 'ALUMINA MODULUS', value: '1.62', unit: 'AM', targetNum: 1.62 },
      { label: 'NODULIZING HOMOGENEITY', value: '99.4', unit: '%', targetNum: 99.4 },
    ],
    telemetry: {
      coordinates: '25.0432° N, 55.4891° E',
      elevation: '+45m INDUSTRIAL ZONE',
      protocol: 'DIN EN 197-1 STANDARDS',
      status: 'ROTARY SPEED: 3.8 RPM // THERMAL LOCK',
    },
  },
  {
    id: 'maritime',
    actNumber: '03',
    code: 'NAVAL-CORRIDOR-03',
    phase: 'MARITIME ARTERIES & FLEET CHOREOGRAPHY',
    title: 'Commanding Ocean Passages.',
    subtitle: 'Chartering Handymax and Supramax vessels with sub-48h turnaround.',
    body: 'Global maritime volatility is neutralized through proactive vessel chartering. SAV Prime deploys geared Handymax and Supramax bulk carriers along continuous Arabian Gulf, Indian Ocean, and Southeast Asian sealanes. Real-time hold humidity tracking, dynamic draft monitoring, and priority berthing eliminate demurrage penalties.',
    badge: 'STAGE 3: MARITIME LOGISTICS',
    metrics: [
      { label: 'VESSEL DEADWEIGHT', value: '58400', unit: 'DWT', targetNum: 58400 },
      { label: 'CRUISING SPEED', value: '14.2', unit: 'KNOTS', targetNum: 14.2 },
      { label: 'HOLD HUMIDITY', value: '0.18', unit: '% MAX', targetNum: 0.18 },
      { label: 'BERTHING DISCHARGE', value: '48', unit: 'HRS', targetNum: 48 },
    ],
    telemetry: {
      coordinates: '25.2769° N, 55.2962° E',
      elevation: '0.0m DEEP WATER',
      protocol: 'IMO SOLAS / IMSBC CODE',
      status: 'AUTOMATED TELEMETRY // RADAR LOCK',
    },
  },
  {
    id: 'convergence',
    actNumber: '04',
    code: 'PORT-NEXUS-04',
    phase: 'STRATEGIC NEXUS & CONTINENTAL DISCHARGE',
    title: 'The Continental Foundation.',
    subtitle: 'Pneumatic unloader discharge straight into megacity infrastructure.',
    body: 'Coordinated from our headquarters at Boulevard Plaza Tower 1 in Downtown Dubai, material discharge flows directly into automated bonded port silos and regional grinding terminals. From monumental skyscrapers and high-speed rail corridors to deepwater ports, SAV Prime supplies the indispensable backbone of modern civilizations.',
    badge: 'STAGE 4: CONTINENTAL DISCHARGE',
    metrics: [
      { label: 'UNLOAD THROUGHPUT', value: '2500', unit: 'T/HR', targetNum: 2500 },
      { label: 'CUMULATIVE BULK', value: '4.8', unit: 'M MT', targetNum: 4.8 },
      { label: 'CAPITAL LIQUIDITY', value: '150', unit: 'M+ USD', targetNum: 150 },
      { label: 'NETWORK NODES', value: '18', unit: 'PORTS', targetNum: 18 },
    ],
    telemetry: {
      coordinates: '25.1972° N, 55.2744° E',
      elevation: '+180m TOWER 1',
      protocol: 'DIRECT TERMINAL CONDUIT',
      status: 'DISCHARGE COMPLETE // FOUNDATION SET',
    },
  },
]

export default function StoryScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [targetProgress, setTargetProgress] = useState(0)

  // RAF Smooth Lerp Interpolation
  useEffect(() => {
    let rafId: number
    let currentLerped = 0

    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const totalScrollable = rect.height - windowHeight

      if (totalScrollable <= 0) return

      // Normalized progress clamped between 0 and 1
      const progress = Math.min(1, Math.max(0, -rect.top / totalScrollable))
      setTargetProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    // Smooth momentum lerp loop
    const tick = () => {
      // Lerp coefficient for heavy, buttery-smooth cinematic drag
      currentLerped += (targetProgress - currentLerped) * 0.09
      if (Math.abs(currentLerped - targetProgress) < 0.0001) {
        currentLerped = targetProgress
      }
      setScrollProgress(currentLerped)
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [targetProgress])

  // Active Chapter calculation based on 4 equal quartiles
  const activeChapterIndex = useMemo(() => {
    const rawIndex = Math.floor(scrollProgress * STORY_CHAPTERS.length)
    return Math.min(STORY_CHAPTERS.length - 1, Math.max(0, rawIndex))
  }, [scrollProgress])

  // Sub-progress inside the current active chapter (0 to 1)
  const chapterSubProgress = useMemo(() => {
    const step = 1 / STORY_CHAPTERS.length
    const currentChapterStart = activeChapterIndex * step
    return Math.min(1, Math.max(0, (scrollProgress - currentChapterStart) / step))
  }, [scrollProgress, activeChapterIndex])

  const activeChapter = STORY_CHAPTERS[activeChapterIndex]

  // Click-to-Jump navigation helper
  const handleJumpToChapter = (index: number) => {
    if (!containerRef.current) return
    const containerTop = containerRef.current.offsetTop
    const containerHeight = containerRef.current.offsetHeight
    const windowHeight = window.innerHeight
    const totalScrollable = containerHeight - windowHeight

    const step = 1 / STORY_CHAPTERS.length
    // Center of that chapter's range for solid focus
    const targetNormalized = (index + 0.35) * step
    const targetScrollY = containerTop + targetNormalized * totalScrollable

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    })
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[420vh] bg-[#070709] border-y border-white/[0.08]"
    >
      {/* ─── STICKY PINNED 100VH VIEWPORT ─── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-6 md:py-8 z-20">
        
        {/* ─── TOP SCRUB PROGRESS RAIL & ACT TELEMETRY HUD (Feature 1 & 2) ─── */}
        <div className="w-full flex flex-col gap-3 pb-4 border-b border-white/[0.08] backdrop-blur-md z-30">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Mission Identifier & Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold" />
                </span>
                <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-white font-semibold">
                  SAV TECHNICAL DOSSIER
                </span>
              </div>
              <span className="text-white/20 font-mono text-xs hidden sm:inline">|</span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-brand-gold/90 uppercase hidden sm:inline">
                {activeChapter.code}
              </span>
            </div>

            {/* Live GPS Coordinates & Real-time Scrolly Status */}
            <div className="flex items-center gap-6 font-mono text-[10px] tracking-widest text-white/40">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-white/20">COORDS:</span>
                <span className="text-white/70">{activeChapter.telemetry.coordinates}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-gold">PROGRESS:</span>
                <span className="text-white font-mono">{Math.round(scrollProgress * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Interactive Scrub Rail with Jump Steppers */}
          <div className="relative w-full flex flex-col gap-2 pt-1">
            {/* The Master Progress Bar Track */}
            <div className="relative w-full h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand-gold/60 via-brand-gold to-white transition-all duration-75 ease-out shadow-[0_0_12px_rgba(201,169,98,0.6)]"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>

            {/* Stepper Buttons (Jump Navigation) */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {STORY_CHAPTERS.map((ch, idx) => {
                const isActive = activeChapterIndex === idx
                const isPassed = scrollProgress >= (idx + 1) * 0.25

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleJumpToChapter(idx)}
                    className={`group text-left py-1.5 px-2 transition-all duration-300 border-t-2 relative ${
                      isActive
                        ? 'border-brand-gold bg-brand-gold/[0.04]'
                        : isPassed
                        ? 'border-white/30 hover:border-white/50'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-[9px] sm:text-[10px] tracking-[0.2em] transition-colors duration-200 ${
                          isActive
                            ? 'text-brand-gold font-semibold'
                            : isPassed
                            ? 'text-white/60'
                            : 'text-white/30 group-hover:text-white/50'
                        }`}
                      >
                        ACT {ch.actNumber}
                      </span>
                      <span
                        className={`hidden lg:inline font-mono text-[8px] tracking-widest uppercase transition-colors ${
                          isActive ? 'text-white/70' : 'text-white/20'
                        }`}
                      >
                        {ch.id}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ─── MAIN STAGE: CINEMATIC SPLIT SCREEN (Option A + Option D) ─── */}
        <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center py-4 min-h-0 overflow-y-auto lg:overflow-visible scrollbar-none">
          
          {/* ─────────────────────────────────────────────────────────────
              LEFT STAGE: INDUSTRIAL TECHNICAL DOSSIER BLUEPRINT (Option D)
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 h-[340px] sm:h-[400px] lg:h-[500px] w-full relative">
            <div className="relative w-full h-full border border-white/[0.12] bg-[#09090d]/90 rounded-sm p-4 sm:p-6 backdrop-blur-xl flex flex-col justify-between overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              
              {/* Technical Blueprint Grid Pattern */}
              <div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(201, 169, 98, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(201, 169, 98, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '36px 36px',
                }}
              />

              {/* Laser Scanning Line Sweeper */}
              <div
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent opacity-60 pointer-events-none shadow-[0_0_10px_#c9a962]"
                style={{
                  top: `${(chapterSubProgress * 100).toFixed(1)}%`,
                  transition: 'top 0.1s linear',
                }}
              />

              {/* Corner Engineering Reticles */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-brand-gold/70" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-brand-gold/70" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-brand-gold/70" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-brand-gold/70" />

              {/* Header Blueprint Meta */}
              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/[0.08] text-[9px] sm:text-[10px] font-mono text-white/40 tracking-[0.25em]">
                <div className="flex items-center gap-2">
                  <span className="text-brand-gold">SCHEMATIC:</span>
                  <span className="text-white/80">{activeChapter.code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-white/30">REF ELEV:</span>
                  <span className="text-brand-gold/90">{activeChapter.telemetry.elevation}</span>
                </div>
              </div>

              {/* ─── DYNAMIC SVG BLUEPRINT SCHEMATIC ─── */}
              <div className="relative z-10 flex-1 flex items-center justify-center my-2 min-h-0">
                {activeChapterIndex === 0 && (
                  /* ACT 01: GEOLOGICAL EXTRACTION & STRATA BLUEPRINT */
                  <svg className="w-full h-full max-h-[300px]" viewBox="0 0 600 320" fill="none">
                    {/* Depth measurement axes */}
                    <line x1="50" y1="20" x2="50" y2="290" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="15" y="40" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">0.0m</text>
                    <text x="15" y="120" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">-140m</text>
                    <text x="15" y="200" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">-280m</text>
                    <text x="15" y="280" fill="#c9a962" fontSize="9" fontFamily="monospace">-420m</text>

                    {/* Strata Layers */}
                    <path d="M 60 70 Q 200 85 350 65 T 580 80" stroke="#8c8c8c" strokeWidth="1.2" strokeDasharray="6 4" opacity="0.6" />
                    <path d="M 60 140 Q 180 120 340 150 T 580 135" stroke="#b8b8b8" strokeWidth="1.4" opacity="0.7" />
                    <path d="M 60 210 Q 240 235 420 200 T 580 220" stroke="#c9a962" strokeWidth="2" />

                    {/* High-Grade Bauxite & Limestone Deposit Vein */}
                    <polygon
                      points="120,210 240,195 380,225 480,205 450,250 300,265 160,245"
                      fill="rgba(201,169,98,0.12)"
                      stroke="#c9a962"
                      strokeWidth="1.5"
                    />

                    {/* Drill Probe Laser Vector (animated by subProgress) */}
                    <line
                      x1="300"
                      y1="20"
                      x2="300"
                      y2={40 + chapterSubProgress * 200}
                      stroke="#c9a962"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="300" cy={40 + chapterSubProgress * 200} r="4" fill="#ffffff" />
                    <circle cx="300" cy={40 + chapterSubProgress * 200} r="9" stroke="#c9a962" strokeWidth="1" className="animate-ping" />

                    {/* Mineral Spec Annotation Callout */}
                    <line x1="380" y1="225" x2="440" y2="170" stroke="#c9a962" strokeWidth="1" />
                    <line x1="440" y1="170" x2="550" y2="170" stroke="#c9a962" strokeWidth="1" />
                    <rect x="440" y="152" width="120" height="26" fill="#0c0c10" stroke="rgba(201,169,98,0.4)" strokeWidth="0.8" />
                    <text x="448" y="168" fill="#ffffff" fontSize="9" fontFamily="monospace">HIGH PURITY CaCO₃</text>
                  </svg>
                )}

                {activeChapterIndex === 1 && (
                  /* ACT 02: ROTARY KILN & THERMAL CALCINATION SCHEMATIC */
                  <svg className="w-full h-full max-h-[300px]" viewBox="0 0 600 320" fill="none">
                    {/* Rotary Kiln Cylinder Contour */}
                    <rect x="100" y="90" width="380" height="90" rx="6" stroke="#c9a962" strokeWidth="1.8" fill="rgba(201,169,98,0.03)" />
                    
                    {/* Rotation Axis & Angle Vector (3.5° Incline) */}
                    <line x1="80" y1="135" x2="500" y2="135" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5 5" />
                    
                    {/* Roller Tire Supports */}
                    <rect x="180" y="76" width="22" height="118" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="#0d0d12" />
                    <rect x="360" y="76" width="22" height="118" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="#0d0d12" />

                    {/* Thermal Combustion Zone (Isotherms) */}
                    <defs>
                      <radialGradient id="heatGlow" cx="70%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffb03a" stopOpacity="0.85" />
                        <stop offset="40%" stopColor="#c9a962" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#0c0c10" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect x="260" y="94" width="210" height="82" fill="url(#heatGlow)" />

                    {/* Multi-channel Flame Nozzle */}
                    <path
                      d="M 480 135 L 340 120 Q 310 135 340 150 Z"
                      fill="rgba(255, 176, 58, 0.7)"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />

                    {/* Real-time Dynamic Temperature Indicator */}
                    <line x1="370" y1="90" x2="370" y2="40" stroke="#ffb03a" strokeWidth="1" />
                    <rect x="320" y="20" width="110" height="24" fill="#0d0d12" stroke="#ffb03a" strokeWidth="0.8" />
                    <text x="330" y="36" fill="#ffb03a" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      TEMP: 1,450°C LOCK
                    </text>

                    {/* Clinker Nodulizing Particle Grid */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <circle
                        key={i}
                        cx={140 + i * 40}
                        cy={155 + Math.sin(i * 1.5 + chapterSubProgress * 5) * 6}
                        r={3.5}
                        fill="#c9a962"
                        className="animate-pulse"
                      />
                    ))}

                    <text x="110" y="215" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="monospace">
                      INCLINE: 3.5° // FEED DISCHARGE CONVEYOR 450 T/H
                    </text>
                  </svg>
                )}

                {activeChapterIndex === 2 && (
                  /* ACT 03: BULK CARRIER RADAR & SEAWAY BLUEPRINT */
                  <svg className="w-full h-full max-h-[300px]" viewBox="0 0 600 320" fill="none">
                    {/* Radar Range Rings */}
                    <circle cx="300" cy="160" r="130" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="300" cy="160" r="85" stroke="rgba(201,169,98,0.18)" strokeWidth="1" />
                    <circle cx="300" cy="160" r="40" stroke="rgba(201,169,98,0.3)" strokeWidth="1" />

                    {/* Radar Sweep Crosshair */}
                    <line x1="160" y1="160" x2="440" y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                    <line x1="300" y1="20" x2="300" y2="300" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

                    {/* Handymax/Supramax Vessel Hull Silhouette Cross-Section */}
                    <path
                      d="M 120 185 L 150 215 L 450 215 L 485 185 Z"
                      stroke="#c9a962"
                      strokeWidth="1.8"
                      fill="rgba(201,169,98,0.05)"
                    />
                    {/* Waterline */}
                    <line x1="90" y1="185" x2="510" y2="185" stroke="#8c8c8c" strokeWidth="1" strokeDasharray="6 3" />
                    <text x="95" y="178" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">DRAFT: 12.8m</text>

                    {/* 5 Distinct Cargo Holds */}
                    {[170, 230, 290, 350, 410].map((x, idx) => (
                      <g key={idx}>
                        <rect x={x - 22} y="190" width="44" height="20" stroke="rgba(201,169,98,0.4)" strokeWidth="1" fill="#0d0d12" />
                        <text x={x - 12} y="204" fill="#ffffff" fontSize="8" fontFamily="monospace">H-0{idx + 1}</text>
                      </g>
                    ))}

                    {/* Waypoint Trajectory (animated stroke-dashoffset) */}
                    <path
                      d="M 140 110 Q 250 80 340 120 T 480 95"
                      stroke="#c9a962"
                      strokeWidth="2"
                      strokeDasharray="300"
                      strokeDashoffset={300 - chapterSubProgress * 300}
                    />
                    <circle cx="140" cy="110" r="3.5" fill="#c9a962" />
                    <circle cx="480" cy="95" r="4" fill="#ffffff" className="animate-ping" />
                    
                    <text x="350" y="85" fill="#c9a962" fontSize="9" fontFamily="monospace">
                      WAYPOINT: STRAIT OF MALACCA
                    </text>
                  </svg>
                )}

                {activeChapterIndex === 3 && (
                  /* ACT 04: AUTOMATED PORT SILOS & MEGAPROJECT FOUNDATION */
                  <svg className="w-full h-full max-h-[300px]" viewBox="0 0 600 320" fill="none">
                    {/* Quayside Pier Base */}
                    <line x1="50" y1="240" x2="550" y2="240" stroke="#ffffff" strokeWidth="2" />
                    
                    {/* Storage Silo Array (3 Cylindrical High-Capacity Silos) */}
                    {[140, 220, 300].map((siloX, i) => (
                      <g key={i}>
                        <rect x={siloX - 30} y="80" width="60" height="155" rx="4" stroke="#c9a962" strokeWidth="1.6" fill="rgba(201,169,98,0.06)" />
                        <ellipse cx={siloX} cy="80" rx="30" ry="10" stroke="#c9a962" strokeWidth="1.2" fill="#0c0c10" />
                        <line x1={siloX - 25} y1={120 + i * 15} x2={siloX + 25} y2={120 + i * 15} stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="2 2" />
                        <text x={siloX - 22} y="150" fill="#ffffff" fontSize="9" fontFamily="monospace">SILO-0{i + 1}</text>
                      </g>
                    ))}

                    {/* Pneumatic Overhead Conveyor Line */}
                    <line x1="100" y1="65" x2="480" y2="65" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={110 + chapterSubProgress * 360} cy="65" r="5" fill="#c9a962" />

                    {/* Megastructure Skyline Blueprint Geometry */}
                    <rect x="380" y="110" width="40" height="128" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                    <rect x="430" y="60" width="55" height="178" stroke="#c9a962" strokeWidth="1.2" fill="rgba(201,169,98,0.04)" />
                    <polygon points="430,60 457,20 485,60" stroke="#c9a962" strokeWidth="1.2" fill="none" />
                    <line x1="457" y1="20" x2="457" y2="5" stroke="#ffffff" strokeWidth="1" />

                    {/* Foundation Tie-Beam Grid */}
                    <line x1="380" y1="240" x2="520" y2="240" stroke="#c9a962" strokeWidth="3" />
                    <text x="390" y="265" fill="#c9a962" fontSize="9" fontFamily="monospace">
                      FOUNDATION GRADE: 52.5N HIGH-EARLY
                    </text>
                  </svg>
                )}
              </div>

              {/* Real-time Telemetry Bar */}
              <div className="relative z-10 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono text-white/50">
                <span className="flex items-center gap-1.5 text-brand-gold">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
                  {activeChapter.telemetry.status}
                </span>
                <span className="text-white/30 hidden sm:inline">
                  PROTOCOL: {activeChapter.telemetry.protocol}
                </span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT STAGE: NARRATIVE EDITORIAL STORY CARDS (Option A)
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 flex flex-col justify-center min-h-[340px] relative">
            <div
              key={activeChapter.id}
              className="transition-all duration-500 ease-out flex flex-col justify-between"
            >
              {/* Badge & Step Indicator */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-1 text-[10px] font-mono tracking-[0.25em] uppercase bg-brand-gold/15 text-brand-gold border border-brand-gold/40 rounded-sm">
                  {activeChapter.badge}
                </span>
                <span className="text-white/30 font-mono text-xs">
                  0{activeChapterIndex + 1} / 04
                </span>
              </div>

              {/* Main Headline */}
              <h3 className="hero-title text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-[1.05] tracking-tight mb-3">
                {activeChapter.title}
              </h3>

              <p className="font-mono text-xs text-brand-gold/90 uppercase tracking-[0.18em] mb-4">
                {activeChapter.subtitle}
              </p>

              {/* Story Narrative Text */}
              <p className="text-white/70 text-sm sm:text-base font-light leading-relaxed mb-6">
                {activeChapter.body}
              </p>

              {/* Live Technical Metrics Grid (Animated Number Meters) */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.08]">
                {activeChapter.metrics.map((m, idx) => {
                  // Calculate dynamic simulated ticker value based on progress
                  const displayValue = m.value

                  return (
                    <div
                      key={idx}
                      className="p-3 border border-white/[0.06] bg-black/40 rounded-sm flex flex-col justify-between"
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 mb-1">
                        {m.label}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-white text-base sm:text-lg font-mono font-medium">
                          {displayValue}
                        </span>
                        <span className="font-mono text-[10px] text-brand-gold font-normal">
                          {m.unit}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          </div>

        </div>

        {/* ─── BOTTOM VIEWPORT FOOTER / SCROLL PROMPT ─── */}
        <div className="w-full pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-white/30 tracking-widest uppercase">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/60" />
            UNBROKEN INDUSTRIAL TIMELINE &bull; DUBAI TO GLOBAL PORTS
          </span>
          <span className="hidden sm:inline-block">
            CONTINUE SCROLLING TO ADVANCE DOSSIER &darr;
          </span>
        </div>

      </div>
    </div>
  )
}
