import { useEffect, useRef, useCallback, useState } from 'react'

const VIDEO_SRC = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4'

const LERP_TAU = 8
const SNAP = 0.002
const LRU_MAX = 24
const LEAD = 24
const WATCHDOG_MS = 60000
const FPS = 30

export type NavState = {
  isLight: boolean
  progress: number
}

export function useVideoScrub(videoRef: React.RefObject<HTMLVideoElement | null>, canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [ready, setReady] = useState(false)
  const [navState, setNavState] = useState<NavState>({ isLight: true, progress: 0 })
  const bankRef = useRef<{ ts: number; blob: Blob }[]>([])
  const lruRef = useRef<Map<number, ImageBitmap | null>>(new Map())
  const currentRef = useRef(0)
  const targetRef = useRef(0)
  const durRef = useRef(0)
  const paintedRef = useRef(false)
  const buildingRef = useRef(false)
  const rafRef = useRef<number>(0)
  const isReducedMotion = useRef(false)
  const watchdogRef = useRef<number>(0)
  const seekReadyRef = useRef<boolean>(false)

  const getProgress = useCallback(() => {
    const container = videoRef.current?.closest('.scroll-container') as HTMLElement | null
    if (!container) return 0
    const scrollable = container.offsetHeight - window.innerHeight
    if (scrollable <= 0) return 0
    return Math.max(0, Math.min(1, window.scrollY / scrollable))
  }, [videoRef])

  const binarySearch = useCallback((bank: { ts: number }[], t: number): number => {
    let lo = 0, hi = bank.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (bank[mid].ts * 1e6 < t) lo = mid + 1
      else hi = mid - 1
    }
    if (lo >= bank.length) return bank.length - 1
    if (lo > 0 && Math.abs(bank[lo].ts * 1e6 - t) > Math.abs(bank[lo - 1].ts * 1e6 - t)) return lo - 1
    return lo
  }, [])

  const warmLRU = useCallback((idx: number) => {
    const lru = lruRef.current
    const bank = bankRef.current
    if (bank.length === 0) return
    const lo = Math.max(0, idx - 1)
    const hi = Math.min(bank.length - 1, idx + 2)
    for (let i = lo; i <= hi; i++) {
      if (!lru.has(i)) lru.set(i, null)
    }
    if (lru.size > LRU_MAX) {
      const entries = Array.from(lru.keys())
      for (let i = 0; i < entries.length - LRU_MAX; i++) lru.delete(entries[i])
    }
  }, [])

  const drawFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const lru = lruRef.current
    const bank = bankRef.current
    if (idx < 0 || idx >= bank.length) return

    let bitmap = lru.get(idx)
    if (!bitmap) {
      createImageBitmap(bank[idx].blob).then(b => {
        lru.set(idx, b)
        const c = canvasRef.current
        const x = c?.getContext('2d')
        if (c && x) {
          x.clearRect(0, 0, 1920, 1080)
          x.drawImage(b, 0, 0, 1920, 1080)
        }
        if (!paintedRef.current) {
          paintedRef.current = true
          setReady(true)
        }
      }).catch(() => {})
      return
    }
    if (bitmap) {
      ctx.clearRect(0, 0, 1920, 1080)
      ctx.drawImage(bitmap, 0, 0, 1920, 1080)
    }
  }, [canvasRef])

  const buildBank = useCallback(async () => {
    if (buildingRef.current) return
    buildingRef.current = true

    watchdogRef.current = window.setTimeout(() => {
      setReady(true)
      buildingRef.current = false
    }, WATCHDOG_MS)

    try {
      const video = videoRef.current!
      const offscreen = new OffscreenCanvas(1920, 1080)
      const octx = offscreen.getContext('2d')!

      // Stage 1: load video and measure duration
      video.muted = true
      video.playsInline = true
      video.preload = 'auto'
      video.src = VIDEO_SRC

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error('video load failed'))
      })

      durRef.current = video.duration
      seekReadyRef.current = true

      const totalFrames = Math.max(1, Math.floor(durRef.current * FPS))
      const interval = durRef.current / totalFrames

      // Stage 2: seek through and capture each frame
      const bank: { ts: number; blob: Blob }[] = []
      const leadFrames: { ts: number; blob: Blob }[] = []
      let decodedCount = 0

      for (let i = 0; i < totalFrames; i++) {
        const t = i * interval
        video.currentTime = t

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked)
            resolve()
          }
          video.addEventListener('seeked', onSeeked)
        })

        octx.clearRect(0, 0, 1920, 1080)
        octx.drawImage(video, 0, 0, 1920, 1080)

        const blob = await offscreen.convertToBlob({ type: 'image/webp', quality: 0.82 })
        const entry = { ts: t, blob }

        if (i < LEAD) {
          leadFrames.push(entry)
        } else {
          bank.push(entry)
        }

        decodedCount++
      }

      // Prepend lead frames
      const fullBank = [...leadFrames, ...bank]
      bankRef.current = fullBank

      // Stage 3: paint first frame
      if (fullBank.length > 0) {
        const firstCanvas = canvasRef.current
        const fctx = firstCanvas?.getContext('2d')
        const bmp = await createImageBitmap(fullBank[0].blob)
        if (firstCanvas && fctx) {
          fctx.clearRect(0, 0, 1920, 1080)
          fctx.drawImage(bmp, 0, 0, 1920, 1080)
        }
        bmp.close()
        paintedRef.current = true
      }

      clearTimeout(watchdogRef.current)
      buildingRef.current = false
      setReady(true)
    } catch (e) {
      console.warn('bank build failed', e)
      clearTimeout(watchdogRef.current)
      buildingRef.current = false
      setReady(true)
    }
  }, [canvasRef, videoRef])

  useEffect(() => {
    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.addEventListener('resize', () => {})
    window.addEventListener('orientationchange', () => {})
    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const tick = () => {
      const dt = Math.min(0.1, 1 / 60)
      const p = getProgress()
      setNavState({ isLight: p <= 0.55, progress: p })
      if (durRef.current > 0) {
        targetRef.current = p * durRef.current
        if (isReducedMotion.current) {
          currentRef.current = targetRef.current
        } else {
          currentRef.current += (targetRef.current - currentRef.current) * (1 - Math.exp(-dt * LERP_TAU))
          if (Math.abs(targetRef.current - currentRef.current) < SNAP) {
            currentRef.current = targetRef.current
          }
        }
        const bank = bankRef.current
        const cur = currentRef.current
        if (ready && bank.length > 0) {
          const idx = binarySearch(bank, cur)
          warmLRU(idx)
          const lru = lruRef.current
          const needed = new Set([idx, idx + 1, idx - 1].filter(i => i >= 0 && i < bank.length))
          for (const [key, val] of lru) {
            if (!val && needed.has(key)) {
              createImageBitmap(bank[key].blob).then(b => {
                lru.set(key, b)
                drawFrame(key)
              }).catch(() => {})
            }
          }
          drawFrame(idx)
        } else if (!ready && video.readyState >= 2 && seekReadyRef.current) {
          if (Math.abs(video.currentTime - cur) > 0.01) {
            video.currentTime = cur
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [ready, getProgress, binarySearch, warmLRU, drawFrame, videoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const handleLoad = () => {
      if (!buildingRef.current) buildBank()
    }
    window.addEventListener('load', handleLoad)
    return () => window.removeEventListener('load', handleLoad)
  }, [buildBank, videoRef])

  return { ready, navState }
}
