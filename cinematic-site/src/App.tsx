import { useRef, useMemo } from 'react'
import { useVideoScrub } from './hooks/useVideoScrub'
import { Navbar } from './components/Navbar'
import { ScrollSection } from './components/ScrollSection'
import { Stagger } from './components/Stagger'
import { ArrowRight, ArrowDown, ChevronUp } from 'lucide-react'

const DARK = '#1D3045'

function s1Opacity(p: number): number {
  if (p < 0.20) return 1
  return Math.max(0, 1 - (p - 0.20) / 0.08)
}

function s2Opacity(p: number): number {
  if (p < 0.32) return 0
  if (p < 0.40) return (p - 0.32) / 0.08
  if (p < 0.55) return 1
  return Math.max(0, 1 - (p - 0.55) / 0.08)
}

function s3Opacity(p: number): number {
  if (p < 0.67) return 0
  if (p < 0.75) return (p - 0.67) / 0.08
  return 1
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { ready, navState } = useVideoScrub(videoRef, canvasRef)

  const p = navState.progress
  const opacity1 = useMemo(() => s1Opacity(p), [p])
  const opacity2 = useMemo(() => s2Opacity(p), [p])
  const opacity3 = useMemo(() => s3Opacity(p), [p])

  const s1Visible = p < 0.28
  const s2Visible = p >= 0.32 && p < 0.63
  const s3Visible = p >= 0.67

  return (
    <div className="scroll-container relative h-[500vh]">
      {/* Sticky viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* Video background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          playsInline
          preload="auto"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260821_114821_a8ca298f-be2c-4613-a4dd-51b69e16bbde.mp4"
          style={{ objectFit: 'cover' }}
        />

        {/* Canvas overlay */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 object-cover"
          style={{ opacity: ready ? 1 : 0, transition: 'opacity 300ms' }}
        />

        {/* Content overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <Navbar isLight={navState.isLight} />

          {/* Section 1 - Hero */}
          <ScrollSection opacity={opacity1}>
            <div className="h-full flex items-center px-6 sm:px-8 md:px-20 lg:px-32">
              <div>
                <h1
                  className="font-light uppercase leading-[1.2]"
                  style={{
                    fontSize: 'clamp(2rem, 5vw, 5rem)',
                    color: DARK,
                  }}
                >
                  <Stagger visible={s1Visible} delay={0}>
                    Advancing resources for a cleaner future
                  </Stagger>
                </h1>
                <p
                  className="mt-6 text-sm tracking-[0.3em] uppercase"
                  style={{ color: '#1D304590' }}
                >
                  <Stagger visible={s1Visible} delay={150}>
                    Sustainable power with purpose
                  </Stagger>
                </p>
              </div>
            </div>
            {/* Bottom-right button */}
            <div className="absolute bottom-12 right-6 sm:right-8 md:right-12">
              <Stagger visible={s1Visible} delay={300}>
                <button
                  className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full border transition-opacity hover:opacity-70"
                  style={{ borderColor: 'rgba(29,48,69,0.5)' }}
                  aria-label="Scroll down"
                >
                  <ArrowRight size={18} color={DARK} />
                </button>
              </Stagger>
            </div>
          </ScrollSection>

          {/* Section 2 - Center */}
          <ScrollSection opacity={opacity2}>
            <div className="h-full flex items-center justify-center px-6 sm:px-8">
              <div className="max-w-[900px] text-center">
                <h2
                  className="font-extralight tracking-wide leading-[1.3] uppercase"
                  style={{
                    fontSize: 'clamp(1.5rem, 4.5vw, 4.5rem)',
                    color: DARK,
                  }}
                >
                  <Stagger visible={s2Visible} delay={0}>
                    We build lasting partnerships with vision{' '}
                    <span style={{ color: 'rgba(29,48,69,0.8)' }}>and precision</span>{' '}
                    <span style={{ color: 'rgba(29,48,69,0.5)' }}>across every frontier</span>
                  </Stagger>
                </h2>
              </div>
            </div>
            {/* Right column */}
            <div className="absolute bottom-16 right-6 sm:right-8 md:right-12 flex flex-col items-center gap-4">
              <Stagger visible={s2Visible} delay={200}>
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-full border"
                  style={{ borderColor: 'rgba(29,48,69,0.4)' }}
                >
                  <ArrowDown size={18} color={DARK} />
                </div>
              </Stagger>
              <Stagger visible={s2Visible} delay={350}>
                <div className="flex items-center gap-2 mt-4">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DARK }} />
                  <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: 'rgba(29,48,69,0.4)' }} />
                  <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: 'rgba(29,48,69,0.4)' }} />
                </div>
              </Stagger>
              <Stagger visible={s2Visible} delay={500}>
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full border mt-2"
                  style={{ borderColor: 'rgba(29,48,69,0.3)' }}
                >
                  <ChevronUp size={16} color="rgba(29,48,69,0.8)" />
                </div>
              </Stagger>
            </div>
          </ScrollSection>

          {/* Section 3 - Right aligned */}
          <ScrollSection opacity={opacity3}>
            <div className="h-full flex items-center justify-end px-6 sm:px-8 md:px-20 lg:px-32">
              <div className="max-w-2xl text-left">
                <p className="text-white/60 text-lg tracking-wide mb-4">
                  <Stagger visible={s3Visible} delay={0}>
                    Halder | Nordvik
                  </Stagger>
                </p>
                <h2
                  className="font-light text-white leading-[1.2] uppercase tracking-wide mb-8"
                  style={{ fontSize: 'clamp(2rem, 4vw, 4rem)' }}
                >
                  <Stagger visible={s3Visible} delay={0}>
                    Fueling ambition,<br />shaping tomorrow.
                  </Stagger>
                </h2>
                <div className="flex items-center gap-4">
                  <Stagger visible={s3Visible} delay={150}>
                    <span className="text-sm tracking-[0.3em] uppercase text-white/80">Contact Nordvik</span>
                  </Stagger>
                  <Stagger visible={s3Visible} delay={300}>
                    <button
                      className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-white hover:scale-110 transition-transform duration-300"
                      aria-label="Contact"
                    >
                      <ArrowRight size={16} color={DARK} />
                    </button>
                  </Stagger>
                </div>
              </div>
            </div>
          </ScrollSection>
        </div>
      </div>
    </div>
  )
}
