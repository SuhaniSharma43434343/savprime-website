export default function ContactPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center px-6">
        <span className="section-label block mb-6">SAV PRIME — CONTACT</span>
        <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.03em]">
          Let&apos;s Connect
        </h1>
        <p className="text-white/40 text-base md:text-lg font-light mt-8 max-w-xl mx-auto leading-relaxed">
          Ready to move with us? Get in touch and we will respond within 24 hours.
        </p>
        <a
          href="mailto:hello@savprime.com"
          className="cta-button inline-block mt-12 no-underline"
        >
          hello@savprime.com
        </a>
        <br />
        <a
          href="/"
          className="text-white/30 hover:text-white/60 text-xs tracking-wider uppercase mt-8 inline-block no-underline transition-colors duration-500"
        >
          Back to Home
        </a>
      </div>
    </main>
  )
}
