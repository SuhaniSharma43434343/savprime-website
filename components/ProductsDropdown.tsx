'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export const PRODUCTS = [
  { name: 'Cement', slug: 'cement' },
  { name: 'Logistics', slug: 'logistics' },
  { name: 'Oil', slug: 'oil' },
  { name: 'Stone', slug: 'stone' },
] as const

export type ProductSlug = typeof PRODUCTS[number]['slug']

export const PRODUCT_DATA: Record<ProductSlug, {
  tagline: string
  description: string
  detail: string
  accent: string
  visualGradient: string
}> = {
  cement: {
    tagline: 'THE BACKBONE OF CONSTRUCTION.',
    description: 'Premium clinker and cement sourced from the world\'s key geological formations, delivered to markets that build infrastructure at scale.',
    detail: 'GRADE 52.5N · PORTLAND CEMENT · IRANIAN ORIGIN',
    accent: '#c9a962',
    visualGradient: 'radial-gradient(ellipse at 60% 40%, rgba(201,169,98,0.18) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(180,150,100,0.08) 0%, transparent 50%)',
  },
  logistics: {
    tagline: 'END-TO-END SUPPLY CHAIN MASTERY.',
    description: 'From port to destination, we orchestrate freight, customs, warehousing and distribution across continents and time zones.',
    detail: '15+ COUNTRIES · 30+ PORTS · 2M+ TONNES ANNUALLY',
    accent: '#54719c',
    visualGradient: 'radial-gradient(ellipse at 40% 50%, rgba(84,113,156,0.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(100,140,200,0.08) 0%, transparent 50%)',
  },
  oil: {
    tagline: 'ENERGY IN MOTION.',
    description: 'Crude and refined petroleum products moved with precision across international trade routes, reliably and at scale.',
    detail: 'CRUDE · REFINED · PETROCHEMICALS · BULK TRANSFER',
    accent: '#8B6914',
    visualGradient: 'radial-gradient(ellipse at 55% 45%, rgba(139,105,20,0.2) 0%, transparent 60%), radial-gradient(ellipse at 25% 60%, rgba(160,120,30,0.1) 0%, transparent 50%)',
  },
  stone: {
    tagline: 'NATURAL FOUNDATIONS.',
    description: 'High-grade stone and aggregates extracted from trusted origins, processed and delivered for industrial and construction applications.',
    detail: 'LIMESTONE · GRANITE · AGGREGATE · CRUSHED STONE',
    accent: '#777777',
    visualGradient: 'radial-gradient(ellipse at 50% 50%, rgba(120,120,120,0.15) 0%, transparent 60%), radial-gradient(ellipse at 35% 35%, rgba(160,160,160,0.08) 0%, transparent 50%)',
  },
}

export default function ProductsDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeProduct, setActiveProduct] = useState<ProductSlug>('cement')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div
      ref={dropdownRef}
      className="relative hidden md:block"
      onMouseEnter={() => {
        openTimeoutRef.current = setTimeout(() => setIsOpen(true), 80)
      }}
      onMouseLeave={() => {
        if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
        setIsOpen(false)
      }}
    >
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`text-[11px] uppercase tracking-[0.2em] transition-all duration-300 no-underline relative py-1 ${
          isOpen || activeProduct ? 'text-brand-gold font-medium' : 'text-white/50 hover:text-white'
        }`}
      >
        Products
        {(isOpen || activeProduct) && (
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-gold/70" />
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-5 bg-white rounded-sm shadow-2xl min-w-[220px] py-2 z-[60]"
          style={{ animation: 'fadeIn 0.25s ease-out' }}
        >
          {PRODUCTS.map((product) => (
            <Link
              key={product.slug}
              href={`/products#${product.slug}`}
              className={`block px-7 py-3.5 text-sm tracking-wide transition-all duration-300 no-underline ${
                activeProduct === product.slug
                  ? 'text-[#c9a962] font-medium bg-[#faf8f2]'
                  : 'text-gray-700 hover:text-[#c9a962] hover:bg-gray-50'
              }`}
              onClick={() => {
                setActiveProduct(product.slug)
                setIsOpen(false)
              }}
            >
              {product.name}
              {activeProduct === product.slug && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full ml-2 align-middle"
                  style={{ backgroundColor: '#c9a962' }}
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
