import React, { useEffect, useRef, useState } from 'react'

export function Stagger({ visible, delay = 0, duration = 800, children }: { visible: boolean; delay?: number; duration?: number; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (visible) {
      rafRef.current = requestAnimationFrame(() => {
        const t = setTimeout(() => setShow(true), delay)
        return () => {
          clearTimeout(t)
          cancelAnimationFrame(rafRef.current)
        }
      })
    } else {
      setShow(false)
    }
    return () => {
      cancelAnimationFrame(rafRef.current)
    }
  }, [visible, delay])

  return (
    <span
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1), transform ${duration}ms cubic-bezier(0.16,1,0.3,1)`,
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  )
}
