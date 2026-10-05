'use client'

import { useState } from 'react'

const CHAPTERS = [
  {
    index: '01',
    phase: 'GEOLOGICAL ORIGINS',
    headline: 'Sourced directly at the point of primary extraction.',
    body: 'True stability begins in the earth. SAV Prime builds direct alliances with Tier-1 quarries, mines, and calcination kilns across the Middle East, Southeast Asia, and India. Every metric ton of clinker, high-grade cement, and bauxite is calibrated for exact silica modulus and chemical equilibrium.',
    specs: [
      { k: 'Material Grade', v: 'Standard & Low-Alkali Clinker' },
      { k: 'Quality Control', v: 'Rigorous SGS / Bureau Veritas assays' },
      { k: 'Origin Hubs', v: 'UAE, Oman, Vietnam, India' },
    ],
  },
  {
    index: '02',
    phase: 'FREIGHT CHOREOGRAPHY',
    headline: 'Chartering global maritime lanes with unbroken precision.',
    body: 'Navigating maritime volatility demands more than standard shipping. We orchestrate Handymax, Supramax, and Ultramax bulk voyages, securing dedicated coastal corridors and deep-water berths to insulate clients from fluctuating global freight indices.',
    specs: [
      { k: 'Vessel Profiles', v: 'Handymax to Ultramax Bulk Carriers' },
      { k: 'Charter Model', v: 'Time-charter & Voyage Spot Optimization' },
      { k: 'Corridors', v: 'Arabian Gulf, Indian Ocean, East Africa' },
    ],
  },
  {
    index: '03',
    phase: 'LAST-MILE ASSURANCE',
    headline: 'From customs clearance to precision industrial destination.',
    body: 'Moving minerals across borders requires seamless execution on the ground. We manage customs documentation, bonded port warehousing, and coordinated multi-modal distribution straight into grinding mills, manufacturing terminals, and megaproject sites.',
    specs: [
      { k: 'Turnaround Rate', v: 'Sub-48h Berthing Discharge' },
      { k: 'Warehousing', v: 'Dry Bonded Silos & Yard Storage' },
      { k: 'Compliance', v: '100% Traceability & Regional Customs' },
    ],
  },
]

export default function EditorialFilmTimeline() {
  const [activeChapter, setActiveChapter] = useState(0)

  return (
    <div className="w-full my-20">
      <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
        {/* Navigation Selector */}
        <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-none">
          {CHAPTERS.map((ch, idx) => {
            const isActive = activeChapter === idx
            return (
              <button
                key={ch.index}
                onClick={() => setActiveChapter(idx)}
                className={`text-left p-6 transition-all duration-500 border rounded-sm relative group overflow-hidden ${
                  isActive
                    ? 'border-brand-gold/60 bg-white/[0.03]'
                    : 'border-white/[0.06] hover:border-white/20 bg-transparent'
                }`}
              >
                {/* Active left indicator line */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[2px] bg-brand-gold transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs tracking-[0.25em] text-brand-gold">
                    {ch.index}
                  </span>
                  <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase">
                    ACT {ch.index}
                  </span>
                </div>

                <div
                  className={`font-sans text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                  }`}
                >
                  {ch.phase}
                </div>
              </button>
            )
          })}
        </div>

        {/* Content Viewer with Horizontal Cinematic Shift */}
        <div className="w-full lg:w-2/3">
          <div className="p-8 sm:p-12 border border-white/[0.08] bg-[#0d0d10]/90 backdrop-blur-xl relative rounded-sm min-h-[400px] flex flex-col justify-between">
            {/* Top coordinate watermark */}
            <div className="flex justify-between items-center text-[10px] font-mono text-white/30 tracking-[0.3em] uppercase pb-6 border-b border-white/[0.06]">
              <span>SAV PRIME &bull; STRATEGY DISCLOSURE</span>
              <span>GEO-LOG 25.1972° N, 55.2744° E</span>
            </div>

            {/* Chapter Body */}
            <div className="my-8">
              <span className="font-mono text-[11px] text-brand-gold/80 tracking-[0.25em] uppercase block mb-3">
                {CHAPTERS[activeChapter].phase}
              </span>
              <h4 className="hero-title text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight mb-6">
                &ldquo;{CHAPTERS[activeChapter].headline}&rdquo;
              </h4>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed font-light max-w-2xl">
                {CHAPTERS[activeChapter].body}
              </p>
            </div>

            {/* Specs Footer */}
            <div className="pt-6 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-6">
              {CHAPTERS[activeChapter].specs.map((item, i) => (
                <div key={i} className="flex flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 mb-1">
                    {item.k}
                  </span>
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {item.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
