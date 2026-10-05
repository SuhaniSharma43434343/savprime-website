import Link from 'next/link'

export default function InnerFooter() {
  return (
    <footer className="relative z-20 border-t border-white/[0.07] bg-brand-darker py-16 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/25 to-transparent" />
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white text-base font-medium tracking-[0.25em] uppercase">
              SAV<span className="text-brand-gold">.</span>Prime
            </span>
          </div>
          <p className="text-white/40 text-xs tracking-wider max-w-sm font-light">
            Global material trading and integrated freight choreography across the world&apos;s industrial corridors.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 text-[11px] uppercase tracking-[0.2em]">
          <Link href="/about" className="text-white/50 hover:text-white transition-colors duration-300">About</Link>
          <Link href="/products" className="text-white/50 hover:text-white transition-colors duration-300">Products</Link>
          <Link href="/services" className="text-white/50 hover:text-white transition-colors duration-300">Services</Link>
          <Link href="/industries" className="text-white/50 hover:text-white transition-colors duration-300">Industries</Link>
          <Link href="/network" className="text-white/50 hover:text-white transition-colors duration-300">Network</Link>
          <Link href="/contact" className="text-brand-gold hover:text-white transition-colors duration-300">Contact</Link>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto mt-12 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-white/30">
        <span>&copy; {new Date().getFullYear()} SAV Prime General Trading L.L.C. All rights reserved.</span>
        <span>Boulevard Plaza Tower 1 &bull; Downtown Dubai</span>
      </div>
    </footer>
  )
}
