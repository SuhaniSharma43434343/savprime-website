'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ProductSlug } from '@/components/ProductsDropdown'
import { PRODUCTS, PRODUCT_DATA } from '@/components/ProductsDropdown'

const SLUG_TO_NAME: Record<ProductSlug, string> = Object.fromEntries(
  PRODUCTS.map((p) => [p.slug, p.name])
) as Record<ProductSlug, string>

export default function ProductsPage() {
  const [activeSlug, setActiveSlug] = useState<ProductSlug>('cement')
  const [transitioning, setTransitioning] = useState(false)
  const [displaySlug, setDisplaySlug] = useState<ProductSlug>('cement')
  const rafRef = useRef<number>()

  // Observe the hash on first load and on hashchange
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && hash in PRODUCT_DATA) {
        setActiveSlug(hash as ProductSlug)
      }
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [])

  const switchTo = useCallback((slug: ProductSlug) => {
    if (slug === activeSlug && displaySlug === slug) return
    setTransitioning(true)
    setDisplaySlug(slug)
    setActiveSlug(slug)
    if (window.location.hash !== `#${slug}`) {
      window.history.replaceState(null, '', `#${slug}`)
    }
  }, [activeSlug, displaySlug])

  // Reset transition flag after animation completes
  useEffect(() => {
    if (transitioning) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          setTransitioning(false)
        })
      })
      return () => cancelAnimationFrame(rafRef.current!)
    }
  }, [transitioning, displaySlug])

  const current = PRODUCT_DATA[displaySlug as ProductSlug]
  const nextSlug = PRODUCTS[(PRODUCTS.findIndex((p) => p.slug === displaySlug) + 1) % PRODUCTS.length].slug
  const prevSlug = PRODUCTS[(PRODUCTS.findIndex((p) => p.slug === displaySlug) - 1 + PRODUCTS.length) % PRODUCTS.length].slug

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* ─── Background visuals ─────────────────────────────── */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: current.visualGradient,
          opacity: transitioning ? 0 : 1,
        }}
      />
      {/* subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ─── Navbar-level products navigation ───────────────── */}
      <nav
        className="fixed top-0 left-0 w-full z-50 transition-all duration-700"
        style={{ backdropFilter: 'blur(12px)', background: 'rgba(10,10,10,0.6)' }}
      >
        <div className="max-w-[1440px] mx-auto px-8 md:px-12 lg:px-16">
          <div className="flex items-center justify-between h-20">
            <span className="text-white text-sm font-medium tracking-[0.25em] uppercase">
              SAV<span className="text-brand-gold">.</span>Prime
            </span>
            <div className="flex items-center gap-1">
              {PRODUCTS.map((product) => (
                <button
                  key={product.slug}
                  onClick={() => switchTo(product.slug)}
                  className={`px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition-all duration-500 rounded-sm ${
                    activeSlug === product.slug
                      ? 'text-brand-gold font-medium bg-white/5'
                      : 'text-white/40 hover:text-white/80'
                  }`}
                >
                  {product.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Product switcher — left rail ────────────────────── */}
      <div className="fixed left-8 md:left-12 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-5">
        {PRODUCTS.map((product) => {
          const isActive = activeSlug === product.slug
          return (
            <button
              key={product.slug}
              onClick={() => switchTo(product.slug)}
              className="group flex items-center gap-3 no-underline"
              title={product.name}
            >
              <span
                className="block h-px transition-all duration-500"
                style={{
                  width: isActive ? '32px' : '16px',
                  background: isActive ? current.accent : 'rgba(255,255,255,0.15)',
                }}
              />
              <span
                className={`text-[10px] tracking-[0.3em] uppercase transition-all duration-500 ${
                  isActive ? 'text-white opacity-100' : 'text-white/25 opacity-70 group-hover:opacity-100'
                }`}
              >
                {product.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── Main product content ───────────────────────────── */}
      <div className="relative min-h-screen flex items-center">
        <div className="max-w-[1440px] mx-auto px-8 md:px-12 lg:px-24 pt-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left column — typography */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden">
                <span
                  className="section-label block mb-6"
                  style={{
                    opacity: transitioning ? 0 : 0.6,
                    transform: transitioning ? 'translateY(-8px)' : 'translateY(0)',
                    transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {SLUG_TO_NAME[displaySlug].toUpperCase()} — SAV PRIME
                </span>
              </div>

              <div className="overflow-hidden">
                <h1
                  className="hero-title text-white leading-[0.95] tracking-[-0.03em]"
                  style={{
                    fontSize: 'clamp(3.5rem, 7.5vw, 8rem)',
                    opacity: transitioning ? 0 : 1,
                    transform: transitioning ? 'translateY(30px)' : 'translateY(0)',
                    transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.05s',
                  }}
                >
                  {PRODUCT_DATA[displaySlug].tagline.split('\n').map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </h1>
              </div>

              <div
                className="max-w-xl mt-8 md:mt-10"
                style={{
                  opacity: transitioning ? 0 : 1,
                  transform: transitioning ? 'translateY(14px)' : 'translateY(0)',
                  transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
                }}
              >
                <p className="text-white/50 text-base md:text-lg font-light leading-relaxed">
                  {current.description}
                </p>
                <p
                  className="mt-5 text-[10px] tracking-[0.3em] uppercase font-medium"
                  style={{ color: current.accent, opacity: 0.7 }}
                >
                  {current.detail}
                </p>
              </div>

              {/* CTA */}
              <div
                className="mt-10 md:mt-14"
                style={{
                  opacity: transitioning ? 0 : 1,
                  transform: transitioning ? 'translateY(12px)' : 'translateY(0)',
                  transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s',
                }}
              >
                <a href="/contact" className="cta-button inline-block no-underline">
                  Enquire about {SLUG_TO_NAME[displaySlug]}
                </a>
              </div>
            </div>

            {/* Right column — large product index number */}
            <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
              <div
                className="relative"
                style={{
                  opacity: transitioning ? 0 : 1,
                  transform: transitioning ? 'scale(0.92)' : 'scale(1)',
                  transition: 'all 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div
                  className="hero-title leading-none select-none"
                  style={{
                    fontSize: 'clamp(14rem, 28vw, 32rem)',
                    color: 'transparent',
                    WebkitTextStroke: '1px rgba(255,255,255,0.04)',
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {String(PRODUCTS.findIndex((p) => p.slug === displaySlug) + 1).padStart(2, '0')}
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    opacity: transitioning ? 0 : 0.9,
                    transition: 'opacity 0.8s ease 0.2s',
                  }}
                >
                  <span
                    className="hero-title uppercase tracking-[0.2em]"
                    style={{
                      fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                      color: current.accent,
                    }}
                  >
                    {SLUG_TO_NAME[displaySlug]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Prev / Next arrows ─────────────────────────────── */}
      <div className="fixed bottom-10 right-8 md:right-12 z-40 flex items-center gap-5">
        <button
          onClick={() => switchTo(prevSlug)}
          className="text-white/30 hover:text-white transition-colors duration-300 text-[10px] tracking-[0.3em] uppercase"
        >
          ← {SLUG_TO_NAME[prevSlug]}
        </button>
        <span className="text-white/10 text-[10px]">/</span>
        <button
          onClick={() => switchTo(nextSlug)}
          className="text-white/30 hover:text-white transition-colors duration-300 text-[10px] tracking-[0.3em] uppercase"
        >
          {SLUG_TO_NAME[nextSlug]} →
        </button>
      </div>

      {/* ─── Product indicator dots ─────────────────────────── */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5">
        {PRODUCTS.map((product) => (
          <button
            key={product.slug}
            onClick={() => switchTo(product.slug)}
            className="block rounded-full transition-all duration-500"
            style={{
              width: activeSlug === product.slug ? '20px' : '6px',
              height: '6px',
              background: activeSlug === product.slug ? current.accent : 'rgba(255,255,255,0.15)',
            }}
            title={product.name}
          />
        ))}
      </div>

    </main>
  )
}
