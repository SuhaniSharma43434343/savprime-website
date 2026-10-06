import { useState, useEffect } from 'react'
import { Info, X } from 'lucide-react'

const DARK = '#1D3045'
const NAV_LINKS = ['VECTRUS ENERGY', 'VECTRUS UPSTREAM', 'VECTRUS MARKETS', 'VECTRUS SYSTEMS', 'VECTRUS+']

export function Navbar({ isLight }: { isLight: boolean }) {
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const color = isLight ? DARK : '#FFFFFF'
  const alpha = (hex: string, a: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${a})`
  }

  return (
    <>
      <nav
        className="absolute top-0 left-0 right-0 z-50 pointer-events-auto"
        style={{
          padding: '16px 24px 24px',
          transition: 'color 500ms ease',
          color,
        }}
      >
        <div className="flex items-center justify-between">
          {/* Left cluster */}
          <div className="flex items-center gap-8">
            {/* Hamburger - mobile */}
            <button
              className="lg:hidden flex flex-col gap-[5px]"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-6 h-[2px] bg-current" />
              <span className="block w-6 h-[2px] bg-current" />
              <span className="block w-4 h-[2px] bg-current" />
            </button>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-8 xl:gap-10">
              {NAV_LINKS.map((link, i) => (
                <NavLink key={link} label={link} active={i === 0} delay={100 + i * 80} visible={mounted} color={color} />
              ))}
            </div>
          </div>

          {/* Right cluster */}
          <div
            className="hidden sm:flex items-center gap-4"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(-12px)',
              transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1) 500ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) 500ms',
            }}
          >
            <span className="text-xs tracking-[0.2em] uppercase font-medium">News</span>
            <span
              className="flex items-center justify-center w-5 h-5 rounded-full"
              style={{ backgroundColor: color }}
            >
              <Info size={10} color={alpha(color, 1) === 'rgba(255,255,255,1)' ? '#1D3045' : '#FFFFFF'} strokeWidth={2.5} />
            </span>
            <button
              className="hidden lg:inline-block text-xs tracking-[0.15em] uppercase font-medium ml-2"
              onClick={() => setMenuOpen(true)}
            >
              Menu
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <MobileOverlay color={color} alpha={alpha} onClose={() => setMenuOpen(false)} />
      )}
    </>
  )
}

function NavLink({ label, active, delay, visible, color }: { label: string; active: boolean; delay: number; visible: boolean; color: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), delay)
      return () => clearTimeout(t)
    }
  }, [visible, delay])
  return (
    <a
      href="#"
      className="relative text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70 transition-opacity"
      style={{
        color,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        textDecoration: 'none',
        paddingBottom: '8px',
      }}
    >
      {label}
      {active && (
        <span className="absolute left-0 -bottom-1 h-[2px] w-full" style={{ backgroundColor: color }} />
      )}
    </a>
  )
}

function MobileOverlay({ onClose }: { color: string; alpha: (h: string, a: number) => string; onClose: () => void }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setShow(true))
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100]"
      style={{
        backgroundColor: DARK,
        opacity: show ? 1 : 0,
        visibility: show ? 'visible' : 'hidden',
        transition: 'opacity 500ms cubic-bezier(0.4,0,0.2,1), visibility 500ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div
        className="h-full flex flex-col"
        style={{
          transform: show ? 'translateY(0)' : 'translateY(-32px)',
          transition: 'transform 500ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Close button */}
        <div className="flex justify-end px-6 sm:px-8 pt-8 sm:pt-12">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/30 hover:border-white transition-colors"
            aria-label="Close menu"
          >
            <X size={18} color="#FFFFFF" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12">
          {NAV_LINKS.map((link, i) => (
            <MobileNavLink key={link} label={link} active={i === 0} delay={i * 60} visible={show} onClose={onClose} />
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-8 px-8 sm:px-12 pb-10">
          <a href="#" className="text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors">News</a>
          <a href="#" className="text-xs tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </div>
  )
}

function MobileNavLink({ label, active, delay, visible, onClose }: { label: string; active: boolean; delay: number; visible: boolean; onClose: () => void }) {
  const [show, setShow] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), delay)
      return () => clearTimeout(t)
    }
  }, [visible, delay])

  return (
    <a
      href="#"
      onClick={onClose}
      className="py-3 text-2xl sm:text-3xl font-light tracking-wide uppercase transition-colors"
      style={{
        color: active ? '#FFFFFF' : hovered ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, color 0.3s ease`,
        textDecoration: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </a>
  )
}
