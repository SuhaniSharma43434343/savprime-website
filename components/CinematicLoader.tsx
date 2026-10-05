'use client'

import { useState, useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'

interface CinematicLoaderProps {
  onComplete?: () => void
}

export default function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const { active, progress: realProgress, item, loaded, total } = useProgress()

  const [displayProgress, setDisplayProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const targetRef = useRef(0)

  // Clean filename extractor for currently loading 3D asset
  const currentAsset = item
    ? item.split('/').pop()?.split('?')[0] || item
    : 'Initializing 3D runtime...'

  useEffect(() => {
    // If three.js is actively loading, track its real progress;
    // ensure it reaches 100 once done or if cache makes it instant
    targetRef.current = Math.max(targetRef.current, realProgress)
  }, [realProgress])

  // Continuous smooth interpolation loop for the percentage counter
  useEffect(() => {
    let rafId: number
    let current = 0
    let startTime = performance.now()

    const tick = () => {
      const elapsed = performance.now() - startTime
      // Minimum smooth duration (at least 800ms) so fast connections don't jarringly flash
      const simulatedTarget = Math.min(100, (elapsed / 900) * 100)
      const target = Math.max(targetRef.current, simulatedTarget)

      // Lerp towards target
      current += (target - current) * 0.12

      if (current >= 99.5 && (!active || realProgress >= 100 || elapsed > 3000)) {
        current = 100
        setDisplayProgress(100)

        // Trigger cinematic shutter opening sequence
        setTimeout(() => {
          setIsExiting(true)
          setTimeout(() => {
            setIsFinished(true)
            onComplete?.()
          }, 950) // Match shutter transition duration
        }, 200)

        return
      }

      setDisplayProgress(Math.floor(current))
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    // Safety fallback: auto-unlock after 6s in case network stalls on large GLB
    const safetyTimer = setTimeout(() => {
      setDisplayProgress(100)
      setIsExiting(true)
      setTimeout(() => {
        setIsFinished(true)
        onComplete?.()
      }, 950)
    }, 6000)

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(safetyTimer)
    }
  }, [active, realProgress, onComplete])

  if (isFinished) return null

  const formattedPercent = String(displayProgress).padStart(3, '0')

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden select-none">
      {/* ─── DUAL-CURTAIN SHUTTER PANELS ─── */}
      {/* Top Shutter Gate */}
      <div
        className={`fixed top-0 left-0 w-full h-[50vh] bg-[#060608] border-b border-brand-gold/30 transition-transform duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(201, 169, 98, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(201, 169, 98, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Bottom Shutter Gate */}
      <div
        className={`fixed bottom-0 left-0 w-full h-[50vh] bg-[#060608] border-t border-brand-gold/30 transition-transform duration-1000 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(201, 169, 98, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(201, 169, 98, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* ─── FOREGROUND HUD TELEMETRY CONTENT ─── */}
      <div
        className={`fixed inset-0 z-[10000] flex flex-col justify-between p-6 sm:p-10 md:p-14 transition-all duration-700 ${
          isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Top Header Telemetry */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-white/40 tracking-[0.25em] uppercase">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold" />
            </span>
            <span className="text-white/80 font-medium">SAV PRIME ENGINE INIT</span>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <span className="text-white/20">|</span>
            <span>DUBAI HQ &bull; 25.1972° N, 55.2744° E</span>
          </div>
        </div>

        {/* Centerpiece: Brand Mark + Real Asset Ticker + Laser Progress */}
        <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full px-4">
          {/* Animated Reticle Crosshair */}
          <div className="relative w-12 h-12 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 border border-brand-gold/30 rounded-full animate-spin [animation-duration:12s]" />
            <div className="absolute inset-2 border border-dashed border-white/20 rounded-full" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold shadow-[0_0_8px_#c9a962]" />
            <div className="absolute top-0 bottom-0 w-[1px] bg-brand-gold/40" />
            <div className="absolute left-0 right-0 h-[1px] bg-brand-gold/40" />
          </div>

          {/* Brand Wordmark */}
          <h1 className="text-2xl sm:text-3xl font-display tracking-[0.3em] uppercase text-white font-normal mb-2">
            SAV<span className="text-brand-gold">.</span>PRIME
          </h1>
          <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.35em] text-white/40 uppercase mb-8">
            GLOBAL COMMODITY &bull; MARITIME ARTERY
          </p>

          {/* 3-Digit Monospace Percentage Counter */}
          <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-light text-white tracking-tight mb-4 flex items-baseline">
            <span>{formattedPercent}</span>
            <span className="text-brand-gold text-2xl sm:text-3xl font-normal ml-1">%</span>
          </div>

          {/* Laser Progress Rail */}
          <div className="w-full max-w-md relative mb-5">
            {/* Background Rail */}
            <div className="w-full h-[2px] bg-white/[0.08] relative rounded-full overflow-hidden">
              {/* Active Golden Bar */}
              <div
                className="h-full bg-gradient-to-r from-brand-gold/40 via-brand-gold to-white transition-all duration-100 ease-out shadow-[0_0_12px_#c9a962]"
                style={{ width: `${displayProgress}%` }}
              />
            </div>

            {/* Leading Spark Point */}
            <div
              className="absolute -top-[3px] w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#c9a962] transition-all duration-100 ease-out"
              style={{ left: `calc(${displayProgress}% - 4px)` }}
            />
          </div>

          {/* Real Asset Loading Telemetry Details */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-md text-[10px] font-mono text-white/40 tracking-wider">
            <span className="text-brand-gold/80 truncate max-w-[260px]">
              &gt; {currentAsset}
            </span>
            <span className="text-white/60 mt-1 sm:mt-0">
              {total > 0 ? `ASSET [${loaded}/${total}]` : 'COMPILING SHADERS'}
            </span>
          </div>
        </div>

        {/* Bottom Footer Diagnostics */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/30 tracking-[0.25em] uppercase border-t border-white/[0.06] pt-4">
          <span className="hidden sm:inline-block">
            3D GLTF ASSET PIPELINE &bull; THREE.JS R160
          </span>
          <span className="text-brand-gold/60">
            {displayProgress === 100 ? 'SYSTEM READY // UNLOCKING' : 'CALIBRATING SCENE ASSETS...'}
          </span>
          <span className="hidden md:inline-block">
            DESKTOP &bull; 60FPS TARGET
          </span>
        </div>
      </div>
    </div>
  )
}
