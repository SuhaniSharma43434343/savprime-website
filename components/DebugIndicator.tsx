'use client'

import { useState, useEffect } from 'react'

interface DebugIndicatorProps {
  scrollProgress: number
  currentSection: string
}

export default function DebugIndicator({ scrollProgress, currentSection }: DebugIndicatorProps) {
  const [scrollY, setScrollY] = useState(0)
  const [docHeight, setDocHeight] = useState(0)
  const [viewHeight, setViewHeight] = useState(0)

  useEffect(() => {
    const update = () => {
      setScrollY(window.scrollY)
      setDocHeight(document.documentElement.scrollHeight)
      setViewHeight(window.innerHeight)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.88)',
        color: '#c9a962',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        padding: '12px 16px',
        borderRadius: 4,
        pointerEvents: 'none',
        lineHeight: 1.8,
        border: '1px solid rgba(201,169,98,0.25)',
        whiteSpace: 'pre',
        userSelect: 'none',
      }}
    >
{`ScrollY:      ${scrollY}px
Document:     ${docHeight}px
Viewport:     ${viewHeight}px
Progress:     ${scrollProgress.toFixed(4)}
Scene:        ${currentSection}`}
    </div>
  )
}
