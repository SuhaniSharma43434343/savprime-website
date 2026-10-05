'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getCurrentSection } from '@/lib/animation'

const PRODUCTS_NAV = [
  { name: 'Cement', slug: 'cement' },
  { name: 'Logistics', slug: 'logistics' },
  { name: 'Oil', slug: 'oil' },
  { name: 'Stone', slug: 'stone' },
] as const

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [currentSection, setCurrentSection] = useState('ORIGIN')
  const [productsOpen, setProductsOpen] = useState(false)
  const pathname = usePathname()
  const productsRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0
      setCurrentSection(getCurrentSection(Math.min(1, Math.max(0, progress))))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setProductsOpen(false)
      }
    }
    if (productsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [productsOpen])

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
        scrolled ? 'bg-black/50 backdrop-blur-lg' : ''
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-8 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center no-underline group">
            <span className="text-white text-sm font-medium tracking-[0.25em] uppercase transition-colors duration-300 group-hover:text-white">
              SAV<span className="text-brand-gold">.</span>Prime
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'About', href: '/about' },
              { name: 'Services', href: '/services' },
              { name: 'Industries', href: '/industries' },
              { name: 'Network', href: '/network' },
              { name: 'Contact', href: '/contact' },
            ].map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-300 no-underline relative py-1 ${
                    isActive ? 'text-brand-gold font-medium' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-gold/70" />
                  )}
                </Link>
              )
            })}

            {/* Products dropdown */}
            <div
              ref={productsRef}
              className="relative"
              onMouseEnter={() => {
                if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
                setProductsOpen(true)
              }}
              onMouseLeave={() => {
                hoverTimeout.current = setTimeout(() => setProductsOpen(false), 150)
              }}
            >
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-300 no-underline relative py-1 ${
                  productsOpen ? 'text-brand-gold font-medium' : 'text-white/50 hover:text-white'
                }`}
              >
                Products
                {productsOpen && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-gold/70" />
                )}
              </button>

              {productsOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-5 bg-white rounded-sm shadow-2xl min-w-[200px] py-2 z-[60]"
                  onMouseEnter={() => {
                    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
                  }}
                  onMouseLeave={() => {
                    hoverTimeout.current = setTimeout(() => setProductsOpen(false), 150)
                  }}
                >
                  {PRODUCTS_NAV.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/products#${product.slug}`}
                      className="block px-7 py-3.5 text-sm text-gray-700 tracking-wide no-underline hover:text-[#c9a962] hover:bg-[#faf8f2] transition-all duration-200"
                      onClick={() => setProductsOpen(false)}
                    >
                      {product.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
