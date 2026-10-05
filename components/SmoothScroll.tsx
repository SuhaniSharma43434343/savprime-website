'use client'

import { useEffect, useRef } from 'react'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null)

  useEffect(() => {
    let rafId: number
    let isMounted = true

    // Dynamically import Lenis on client-side only (prevents SSR chunk mismatches)
    import('lenis').then(({ default: Lenis }) => {
      if (!isMounted) return

      const lenis = new Lenis({
        duration: 1.25,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1.2,
      })

      lenisRef.current = lenis

      function raf(time: number) {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)

      // ── Smooth anchor-link scrolling ──────────────────────────────
      const handleAnchorClick = (e: Event) => {
        const target = e.target as HTMLElement | null
        const anchor = target?.closest('a') as HTMLAnchorElement | null
        if (!anchor || anchor.target === '_blank') return

        const href = anchor.getAttribute('href')
        if (!href || !href.startsWith('#')) return

        e.preventDefault()
        const id = href.slice(1)
        const el = document.getElementById(id)
        if (el) {
          lenis.scrollTo(el, {
            offset: 0,
            duration: 1.8,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          })
        }
      }

      document.addEventListener('click', handleAnchorClick, true)
    }).catch(() => {
      // Graceful fallback to native scrolling if dynamically loading fails
    })

    return () => {
      isMounted = false
      cancelAnimationFrame(rafId)
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
    }
  }, [])

  return <>{children}</>
}
