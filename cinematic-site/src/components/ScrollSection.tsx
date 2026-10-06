import React from 'react'

export function ScrollSection({ opacity, children, className }: {
  opacity: number; children: React.ReactNode; className?: string
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className || ''}`}
      style={{ opacity, transition: 'opacity 0.1s ease-out' }}
    >
      {children}
    </div>
  )
}
