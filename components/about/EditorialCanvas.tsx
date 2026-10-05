'use client'

import { useEffect, useRef } from 'react'
import { SCENE_SECTIONS } from '@/lib/animation'
import type { SectionName } from '@/lib/animation'

export default function EditorialCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    let mouseX = width * 0.5
    let mouseY = height * 0.5
    let targetMouseX = mouseX
    let targetMouseY = mouseY

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX
      targetMouseY = e.clientY
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    // ── Continuous journey waypoints along the left margin ──────────
    // Derived from SCENE_SECTIONS, distributed vertically
    const sceneEntries = Object.entries(SCENE_SECTIONS).filter(([n]) => n !== 'CTA') as [SectionName, typeof SCENE_SECTIONS[SectionName]][]
    const nodeCount = sceneEntries.length

    const nodes = sceneEntries.map(([name, sec], i) => {
      const t = (sec.start + sec.end) / 2
      return {
        x: width * 0.08,
        y: height * 0.08 + t * height * 0.84,
        baseX: width * 0.08,
        baseY: height * 0.08 + t * height * 0.84,
        phase: i * 0.7,
        label: sec.label,
        speed: 0.0006,
        amplitude: 8,
      }
    })

    let time = 0

    const render = () => {
      time += 1
      mouseX += (targetMouseX - mouseX) * 0.04
      mouseY += (targetMouseY - mouseY) * 0.04

      ctx.clearRect(0, 0, width, height)

      // Subtle mouse-following radial glow
      const radGrad = ctx.createRadialGradient(mouseX, mouseY, 30, mouseX, mouseY, width * 0.5)
      radGrad.addColorStop(0, 'rgba(201, 169, 98, 0.04)')
      radGrad.addColorStop(0.5, 'rgba(184, 184, 184, 0.01)')
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = radGrad
      ctx.fillRect(0, 0, width, height)

      // ── Continuous journey path connecting all nodes ───────────────
      if (nodes.length >= 2) {
        ctx.save()
        ctx.lineWidth = 1
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Outer soft glow
        ctx.strokeStyle = 'rgba(201, 169, 98, 0.06)'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(nodes[0].x, nodes[0].y)
        for (let i = 1; i < nodes.length; i++) {
          const prev = nodes[i - 1]
          const curr = nodes[i]
          const cpx = (prev.x + curr.x) / 2
          ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y)
        }
        ctx.stroke()

        // Main refined line
        ctx.strokeStyle = 'rgba(201, 169, 98, 0.18)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(nodes[0].x, nodes[0].y)
        for (let i = 1; i < nodes.length; i++) {
          const prev = nodes[i - 1]
          const curr = nodes[i]
          const cpx = (prev.x + curr.x) / 2
          ctx.bezierCurveTo(cpx, prev.y, cpx, curr.y, curr.x, curr.y)
        }
        ctx.stroke()
        ctx.restore()
      }

      // ── Nodes along the path ───────────────────────────────────────
      nodes.forEach((n, i) => {
        n.x = n.baseX + Math.sin(time * n.speed + n.phase) * n.amplitude + (mouseX - width * 0.5) * 0.015
        n.y = n.baseY + Math.cos(time * n.speed * 0.7 + n.phase) * n.amplitude + (mouseY - height * 0.5) * 0.015

        const isFirst = i === 0
        const isLast = i === nodes.length - 1

        // Node dot — larger for first/last, standard for middle
        ctx.beginPath()
        ctx.arc(n.x, n.y, isFirst || isLast ? 4 : 2.5, 0, Math.PI * 2)
        ctx.fillStyle = isFirst || isLast ? 'rgba(201, 169, 98, 0.6)' : 'rgba(201, 169, 98, 0.3)'
        ctx.fill()

        // Subtle crosshair on first/last nodes
        if (isFirst || isLast) {
          ctx.strokeStyle = 'rgba(201, 169, 98, 0.15)'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(n.x - 8, n.y)
          ctx.lineTo(n.x + 8, n.y)
          ctx.moveTo(n.x, n.y - 8)
          ctx.lineTo(n.x, n.y + 8)
          ctx.stroke()
        }

        // Label on first/last nodes only
        if (isFirst || isLast) {
          ctx.font = '9px "JetBrains Mono", monospace'
          ctx.fillStyle = 'rgba(201, 169, 98, 0.35)'
          ctx.textAlign = 'left'
          ctx.fillText(n.label, n.x + 12, n.y + 3)
        }
      })

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
    />
  )
}
