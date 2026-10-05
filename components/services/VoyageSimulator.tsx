'use client'

import { useState, useCallback } from 'react'

/* ─── DATA ──────────────────────────────────────────────────────────────── */

const SERVICES = [
  { id: 'FREIGHT', num: '01', title: 'Freight Transportation', subtitle: 'Handymax & Supramax Chartering', tags: ['Bulk Ocean', 'Dedicated Berths', 'Weather Routing'] },
  { id: 'WAREHOUSING', num: '02', title: 'Warehousing & Distribution', subtitle: 'Strategic Regional Stockpiling', tags: ['Dry Bonded Silos', 'Covered Yards', 'Regional Hubs'] },
  { id: 'CUSTOMS', num: '03', title: 'Customs Clearance', subtitle: 'Compliance & Certification', tags: ['Tariff Mitigation', 'Priority Berthing', 'SGS & BV Cert'] },
  { id: 'SUPPLY_CHAIN', num: '04', title: 'Supply Chain Management', subtitle: 'End-to-End Multimodal Logistics', tags: ['Index Hedging', 'Vessel Telemetry', 'Full Visibility'] },
  { id: 'LAST_MILE', num: '05', title: 'Last-Mile Delivery', subtitle: 'Sub-48h Discharge Protocol', tags: ['Pneumatic Unloader', 'Grinding Mills', 'Megaprojects'] },
]

const COMMODITIES = ['Clinker', 'Grey Cement 52.5N', 'Crude/Fuel Oil', 'Bauxite & Industrial Minerals']
const ORIGINS = ['UAE — Jebel Ali / Fujairah', 'Vietnam — Cam Pha', 'Oman — Salalah', 'India — Mundra']
const DESTINATIONS = ['Southeast Asia', 'East Africa', 'Indian Subcontinent', 'Arabian Gulf']

const ROUTE_DATA: Record<string, Record<string, { days: number; nm: number }>> = {
  'UAE — Jebel Ali / Fujairah': {
    'Southeast Asia': { days: 18, nm: 4200 },
    'East Africa': { days: 22, nm: 5100 },
    'Indian Subcontinent': { days: 8, nm: 1800 },
    'Arabian Gulf': { days: 3, nm: 450 },
  },
  'Vietnam — Cam Pha': {
    'Southeast Asia': { days: 3, nm: 600 },
    'East Africa': { days: 28, nm: 7200 },
    'Indian Subcontinent': { days: 15, nm: 3400 },
    'Arabian Gulf': { days: 20, nm: 5000 },
  },
  'Oman — Salalah': {
    'Southeast Asia': { days: 16, nm: 3800 },
    'East Africa': { days: 10, nm: 2400 },
    'Indian Subcontinent': { days: 7, nm: 1600 },
    'Arabian Gulf': { days: 5, nm: 1200 },
  },
  'India — Mundra': {
    'Southeast Asia': { days: 12, nm: 2800 },
    'East Africa': { days: 18, nm: 4200 },
    'Indian Subcontinent': { days: 2, nm: 300 },
    'Arabian Gulf': { days: 6, nm: 1400 },
  },
}

function getVessel(vol: number) {
  if (vol <= 38000) return { name: 'Handymax 38K DWT', eff: 92 }
  if (vol <= 58000) return { name: 'Supramax 58K DWT', eff: 88 }
  return { name: 'Ultramax 64K DWT', eff: 85 }
}

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */

export default function VoyageSimulator({
  activeService,
  onServiceChange,
}: {
  activeService: string
  onServiceChange?: (service: string) => void
}) {
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [commodity, setCommodity] = useState(COMMODITIES[0])
  const [origin, setOrigin] = useState(ORIGINS[0])
  const [destination, setDestination] = useState(DESTINATIONS[0])
  const [volume, setVolume] = useState(35000)

  const route = ROUTE_DATA[origin]?.[destination] || { days: 15, nm: 3500 }
  const vessel = getVessel(volume)

  const svc = SERVICES.find(s => s.id === activeService) ?? SERVICES[0]

  return (
    <div className="w-full px-6 md:px-8 py-10 lg:py-14 flex flex-col gap-8">
      {/* Service info */}
      <div>
        <span className="font-mono text-[9px] tracking-[0.35em] uppercase block mb-3" style={{ color: 'rgba(201,169,98,0.4)' }}>
          {svc.num} / {svc.subtitle}
        </span>
        <h3 className="font-['Playfair_Display'] text-white leading-[0.95]"
          style={{ fontSize: 'clamp(1.2rem, 1.4vw, 1.5rem)', letterSpacing: '-0.01em' }}>
          {svc.title}
        </h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          {svc.tags.map((tag) => (
            <span key={tag} className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: 'rgba(201,169,98,0.38)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px" style={{ background: 'linear-gradient(90deg, rgba(201,169,98,0.2), transparent)' }} />

      {/* Voyage Simulator heading */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] tracking-[0.25em] uppercase" style={{ color: 'rgba(201,169,98,0.45)' }}>
          Voyage Simulator
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(201,169,98,0.08)' }} />
        <span className="font-mono text-[8px] tracking-wider" style={{ color: 'rgba(255,255,255,0.1)' }}>
          Live Calculation
        </span>
      </div>

      {/* Commodity selector */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Commodity</label>
        <div className="flex flex-wrap gap-1.5">
          {COMMODITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCommodity(c)}
              className="font-mono text-[10px] px-2.5 py-1.5 border transition-all duration-300"
              style={{
                borderColor: commodity === c ? 'rgba(201,169,98,0.4)' : 'rgba(255,255,255,0.06)',
                color: commodity === c ? '#c9a962' : 'rgba(255,255,255,0.25)',
                background: commodity === c ? 'rgba(201,169,98,0.04)' : 'transparent',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Route */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Origin</label>
          <select value={origin} onChange={(e) => setOrigin(e.target.value)}
            className="bg-transparent border text-white text-xs px-3 py-2 font-mono focus:outline-none focus:border-[#c9a962]/30 transition-colors appearance-none cursor-pointer"
            style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 10 10\'%3E%3Cpath d=\'M1.5 3.5l3 3 3-3\' fill=\'none\' stroke=\'%238c8c8c\' stroke-width=\'1.2\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
            {ORIGINS.map(o => <option key={o} value={o} style={{ background: '#0a0a0a' }}>{o}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Destination</label>
          <select value={destination} onChange={(e) => setDestination(e.target.value)}
            className="bg-transparent border text-white text-xs px-3 py-2 font-mono focus:outline-none focus:border-[#c9a962]/30 transition-colors appearance-none cursor-pointer"
            style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 10 10\'%3E%3Cpath d=\'M1.5 3.5l3 3 3-3\' fill=\'none\' stroke=\'%238c8c8c\' stroke-width=\'1.2\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
            {DESTINATIONS.map(d => <option key={d} value={d} style={{ background: '#0a0a0a' }}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Volume slider */}
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-baseline">
          <label className="font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Cargo Volume</label>
          <span className="font-mono text-xs tabular-nums" style={{ color: '#c9a962' }}>
            {volume.toLocaleString()} MT
          </span>
        </div>
        <input type="range" min={15000} max={65000} step={1000} value={volume} onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full h-[2px] appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(90deg, #c9a962 0%, #c9a962 ${((volume - 15000) / 50000) * 100}%, rgba(255,255,255,0.06) ${((volume - 15000) / 50000) * 100}%)`,
            accentColor: '#c9a962',
          }} />
        <div className="flex justify-between">
          <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.08)' }}>15,000 MT</span>
          <span className="font-mono text-[8px]" style={{ color: 'rgba(255,255,255,0.08)' }}>65,000 MT</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-1.5">
        <Metric label="Vessel Class" value={vessel.name} />
        <Metric label="Est. Transit" value={`${route.days} days`} />
        <Metric label="Nautical Miles" value={route.nm.toLocaleString()} />
        <Metric label="Moisture Tol." value="< 0.18%" />
        <Metric label="Discharge" value="2,400 T/hr" highlight />
        <Metric label="Efficiency" value={`${vessel.eff}%`} />
      </div>

      {/* CTA */}
      <button
        onClick={() => setInquiryOpen(true)}
        className="group relative w-full py-3.5 px-6 border text-center transition-all duration-600 overflow-hidden mt-1"
        style={{ borderColor: 'rgba(201,169,98,0.25)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,169,98,0.55)'; e.currentTarget.style.background = 'rgba(201,169,98,0.04)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(201,169,98,0.25)'; e.currentTarget.style.background = 'transparent' }}
      >
        <span className="relative z-10 font-['Inter'] font-medium text-[10px] tracking-[0.2em] uppercase" style={{ color: '#c9a962' }}>
          Request Voyage Quotation &amp; SLA Dossier
        </span>
      </button>

      {/* Drawer */}
      {inquiryOpen && (
        <InquiryDrawer
          onClose={() => setInquiryOpen(false)}
          commodity={commodity} origin={origin} destination={destination}
          volume={volume} vessel={vessel.name} routeDays={route.days} routeNm={route.nm}
        />
      )}
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="px-3 py-2.5 transition-all duration-500" style={{
      border: `1px solid ${highlight ? 'rgba(201,169,98,0.18)' : 'rgba(255,255,255,0.04)'}`,
      background: highlight ? 'rgba(201,169,98,0.02)' : 'transparent',
    }}>
      <span className="font-mono text-[7px] tracking-[0.15em] uppercase block mb-1" style={{ color: 'rgba(255,255,255,0.16)' }}>
        {label}
      </span>
      <span className="font-mono text-[11px] block" style={{ color: highlight ? '#c9a962' : 'rgba(255,255,255,0.7)' }}>
        {value}
      </span>
    </div>
  )
}

function InquiryDrawer({ onClose, commodity, origin, destination, volume, vessel, routeDays, routeNm }: {
  onClose: () => void; commodity: string; origin: string; destination: string;
  volume: number; vessel: string; routeDays: number; routeNm: number
}) {
  const [form, setForm] = useState({ name: '', email: '', company: '', notes: '' })
  const [sent, setSent] = useState(false)
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))
  const submit = () => {
    if (!form.name || !form.email) return
    setSent(true)
    setTimeout(() => { onClose(); setSent(false); setForm({ name: '', email: '', company: '', notes: '' }) }, 2800)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(7,7,9,0.94)', backdropFilter: 'blur(28px)' }} onClick={onClose}>
      <div className="w-full max-w-xl border border-white/10 max-h-[85vh] overflow-y-auto" style={{ background: '#0a0a0e' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div>
            <span className="font-mono text-[8px] tracking-[0.3em] uppercase block mb-1.5" style={{ color: 'rgba(201,169,98,0.4)' }}>Inquiry Dossier</span>
            <h3 className="font-['Playfair_Display'] text-xl text-white">Voyage Quotation Request</h3>
          </div>
          <button onClick={onClose} className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>ESC</button>
        </div>
        <div className="px-6 py-4" style={{ background: 'rgba(201,169,98,0.01)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
            {[['Commodity', commodity], ['Origin', origin], ['Destination', destination], ['Volume', `${volume.toLocaleString()} MT`], ['Vessel', vessel], ['Transit', `${routeDays}d / ${routeNm.toLocaleString()} NM`]].map(([k, v]) => (
              <div key={k}>
                <span className="font-mono text-[7px] tracking-wider uppercase block" style={{ color: 'rgba(255,255,255,0.14)' }}>{k}</span>
                <span className="font-mono text-[10px] text-white/50 block mt-0.5 leading-snug">{v}</span>
              </div>
            ))}
          </div>
        </div>
        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); submit() }} className="px-6 py-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *" value={form.name} onChange={set} field="name" placeholder="Your name" />
              <Field label="Email *" value={form.email} onChange={set} field="email" placeholder="you@co.com" type="email" />
            </div>
            <Field label="Company" value={form.company} onChange={set} field="company" placeholder="Company name" />
            <Field label="Notes" value={form.notes} onChange={set} field="notes" placeholder="Requirements…" textarea />
            <button type="submit" disabled={!form.name || !form.email}
              className="w-full py-3 border text-center transition-all duration-500 disabled:opacity-10 disabled:cursor-not-allowed"
              style={{ borderColor: 'rgba(201,169,98,0.25)' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = 'rgba(201,169,98,0.04)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
              <span className="font-['Inter'] font-medium text-[10px] tracking-[0.18em] uppercase" style={{ color: '#c9a962' }}>Submit Inquiry</span>
            </button>
          </form>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="w-9 h-9 mx-auto mb-3.5 border flex items-center justify-center" style={{ borderColor: 'rgba(201,169,98,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ color: '#c9a962' }}><path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p className="font-['Playfair_Display'] text-lg text-white mb-1">Inquiry Received</p>
            <p className="text-white/30 text-xs font-light">Our logistics team will respond within 2 business hours.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, field, placeholder, type = 'text', textarea }: {
  label: string; value: string; onChange: (k: string, v: string) => void; field: string; placeholder: string; type?: string; textarea?: boolean
}) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.18)' }}>{label}</label>
      <Tag value={value} onChange={(e) => onChange(field, e.target.value)} placeholder={placeholder} type={type}
        rows={textarea ? 3 : undefined}
        className="bg-transparent border text-white text-xs px-3 py-2 font-mono focus:outline-none focus:border-[#c9a962]/30 transition-colors resize-none"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}
