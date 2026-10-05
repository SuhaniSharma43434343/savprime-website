'use client'

import { useEffect, useRef } from 'react'

export default function AmbientGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth / 2)
    let height = (canvas.height = window.innerHeight / 2)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth / 2
      height = canvas.height = window.innerHeight / 2
    }
    window.addEventListener('resize', handleResize)

    const render = () => {
      const imgData = ctx.createImageData(width, height)
      const buffer = new Uint32Array(imgData.data.buffer)
      const len = buffer.length
      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.08) {
          // Subtle warm/slate mineral noise speckle
          buffer[i] = 0x08ffffff
        }
      }
      ctx.putImageData(imgData, 0, 0)
      animId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40 z-[1] mix-blend-screen w-full h-full"
    />
  )
}
