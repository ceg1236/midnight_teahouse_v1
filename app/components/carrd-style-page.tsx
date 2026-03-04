'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { CountdownTimer } from './countdown-timer'
import type { eventDates, eventTiers } from '../../content/event-invite.config'
import { SiteFooter } from './site-footer'

const STORAGE_KEY = 'teahouse_reservation'

type CarrdStylePageProps = {
  welcomeContent: string
  dates: readonly (typeof eventDates)[number][]
  tiers: readonly (typeof eventTiers)[number][]
  /** Unix timestamp for countdown (first event at 7pm) */
  countdownTarget: number
}

const SCROLL_DURATION = 1200
const SCROLL_OFFSET_TOP = 48

const BOOKING_NOTES: Array<string | React.ReactNode> = [
  'Doors open at 7pm and close at 11pm. Join us anytime in this window.',
  'Reservation includes unlimited tea and all other amenities.',
  'We are a phone and laptop-free space.',
  "Unfortunately, we don't offer refunds or exchanges for future events.",
  <>If you have any questions about the reservation, please <a href="mailto:midnight.teahouse.sf@gmail.com" className="text-[#FAE0B9] underline hover:underline focus:outline-none focus:underline">send us an email</a>.</>,
]

function scrollToSection(ref: React.RefObject<HTMLElement | null>) {
  const el = ref.current
  if (!el) return
  const start = window.scrollY
  const target = el.getBoundingClientRect().top + start - SCROLL_OFFSET_TOP
  const distance = target - start
  const startTime = performance.now()

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  function step(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / SCROLL_DURATION, 1)
    const eased = easeInOutCubic(progress)
    window.scrollTo(0, start + distance * eased)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

type TierSelections = Record<string, number>

function loadPersisted(
  dates: readonly { id: string }[],
  tiers: readonly { id: string }[]
): { date: string | null; selections: TierSelections; form: { name: string; email: string; notes: string } } {
  if (typeof window === 'undefined') return { date: null, selections: {}, form: { name: '', email: '', notes: '' } }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: null, selections: {}, form: { name: '', email: '', notes: '' } }
    const data = JSON.parse(raw) as {
      date?: string
      tier?: string
      quantity?: number
      selections?: TierSelections
      name?: string
      email?: string
      notes?: string
    }
    const date = data.date && dates.some((d) => d.id === data.date) ? data.date : null
    let selections: TierSelections = {}
    if (data.selections && typeof data.selections === 'object') {
      for (const [tid, q] of Object.entries(data.selections)) {
        if (tiers.some((t) => t.id === tid) && typeof q === 'number' && q >= 1 && q <= 4) {
          selections[tid] = q
        }
      }
    } else if (data.tier && tiers.some((t) => t.id === data.tier)) {
      const q = typeof data.quantity === 'number' ? Math.min(4, Math.max(1, data.quantity)) : 1
      selections[data.tier] = q
    }
    return {
      date,
      selections,
      form: {
        name: typeof data.name === 'string' ? data.name : '',
        email: typeof data.email === 'string' ? data.email : '',
        notes: typeof data.notes === 'string' ? data.notes : '',
      },
    }
  } catch {
    return { date: null, selections: {}, form: { name: '', email: '', notes: '' } }
  }
}

function savePersisted(
  date: string | null,
  selections: TierSelections,
  form: { name: string; email: string; notes: string }
) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ date, selections, ...form }))
  } catch {
    /* ignore */
  }
}

export function CarrdStylePage({ welcomeContent, dates, tiers, countdownTarget }: CarrdStylePageProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selections, setSelections] = useState<TierSelections>({})
  const [supportedPrice, setSupportedPrice] = useState(20)
  const [supportedPriceInput, setSupportedPriceInput] = useState('')
  const [showSupportedTier, setShowSupportedTier] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' })
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [expandedBlurbId, setExpandedBlurbId] = useState<string | null>(null)
  const [expandedTierDetails, setExpandedTierDetails] = useState(false)
  const [expandedPricingNote, setExpandedPricingNote] = useState(false)
  /** On mobile: true when Reserve Your Seat clicked (whole screen slides to reservation) */
  const [showReservationView, setShowReservationView] = useState(false)
  /** 1 = Choose evening, 2 = Choose ticket, 3 = Complete reservation */
  const [reservationStep, setReservationStep] = useState<1 | 2 | 3>(1)

  const joinRef = useRef<HTMLElement>(null)
  const tierRef = useRef<HTMLDivElement>(null)
  const mobileReservationPanelRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const persisted = loadPersisted(dates, tiers)
    setSelectedDate(persisted.date)
    setSelections(persisted.selections)
    setFormData(persisted.form)
    if (Object.keys(persisted.selections).some((id) => id === 'supported')) {
      setShowSupportedTier(true)
      setSupportedPriceInput('20')
    }
    setHydrated(true)
    if (persisted.date) setReservationStep(2)
  }, [dates, tiers])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window.innerWidth
    const hasTouch = 'ontouchstart' in window
    if (w < 768) setDeviceType('mobile')
    else if (hasTouch && w < 1024) setDeviceType('tablet')
    else setDeviceType('desktop')
  }, [])

  useEffect(() => {
    if (!hydrated) return
    savePersisted(selectedDate, selections, formData)
  }, [hydrated, selectedDate, selections, formData])

  useEffect(() => {
    if (showReservationView) {
      mobileReservationPanelRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [showReservationView])

  const hasSelection = Object.values(selections).some((q) => q > 0)
  const totalQuantity = Object.values(selections).reduce((s, q) => s + q, 0)
  const hasValidSupportedPrice = (() => {
    const v = parseInt(supportedPriceInput, 10)
    return !isNaN(v) && v >= 20 && v <= 40
  })()
  const totalPrice = Object.entries(selections).reduce((sum, [tierId, qty]) => {
    if (qty <= 0) return sum
    const tier = tiers.find((t) => t.id === tierId)
    const price = tierId === 'supported' ? supportedPrice : (tier?.price ?? 0)
    return sum + price * qty
  }, 0)
  const selectedDateData = dates.find((d) => d.id === selectedDate)
  const selectedDateDisplay = selectedDateData
    ? (() => {
        const parts = selectedDateData.dateTime.split(', ')
        const timePart = parts.length > 1 ? parts.slice(1).join(', ') : ''
        return timePart ? `${selectedDateData.label} ${timePart}` : selectedDateData.label
      })()
    : ''
  const handleTierClick = (tierId: string) => {
    setSelections((prev) => {
      const q = prev[tierId] ?? 0
      if (q > 0) {
        const next = { ...prev }
        delete next[tierId]
        return next
      }
      return { [tierId]: 1 }
    })
  }

  const handleQuantityChange = (tierId: string, delta: number) => {
    setSelections((prev) => {
      const q = prev[tierId] ?? 0
      if (delta === -1 && q <= 1) {
        const next = { ...prev }
        delete next[tierId]
        return next
      }
      if (delta === 1 && q >= 4) return prev
      return { [tierId]: q + delta }
    })
  }

  return (
    <div className="carrd-page flex flex-col items-center min-h-screen overflow-x-hidden pt-8">
      <Link
        href="/our-story"
        className="carrd-corner-link top-2 right-4 md:top-4 md:right-8 carrd-link carrd-link--muted text-sm whitespace-nowrap"
      >
        Our Story
      </Link>
      {/* Mobile: two-panel slide (invite | reservation) */}
      <div className="md:hidden w-full flex-1 min-h-0 overflow-x-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ width: '200%', transform: showReservationView ? 'translateX(-50%)' : 'translateX(0)' }}
        >
          <div className="w-1/2 flex-shrink-0 flex flex-col items-center px-6 py-8 gap-[1.25em] overflow-y-auto min-h-0">
            <div className="relative w-full flex flex-col items-center gap-1">
              <h1 className="carrd-font-heading carrd-font-title text-center">Midnight Teahouse</h1>
              <p className="carrd-font-subtitle text-center italic">an enchanted world hidden in San Francisco</p>
            </div>
            <div className="carrd-video-fade w-full -mx-6 py-6">
              <div className="aspect-video overflow-hidden">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src="/images/midnight_site_vid_hi_res.mp4" type="video/mp4" />
                  <source src="/images/midnight_site_vid_hi_res.mov" type="video/quicktime" />
                </video>
              </div>
            </div>
            <div className="flex justify-center py-6" style={{ transform: 'scale(1.3)' }}>
              <CountdownTimer targetTimestamp={countdownTarget} length={3} />
            </div>
            <section className="w-full flex flex-col items-center gap-10 text-center">
              <div className="flex flex-col items-center gap-[1em] w-full">
                <h2 className="carrd-font-heading text-[0.96rem] italic" style={{ letterSpacing: '-2px' }}>Crossing into Spring</h2>
                <div className="carrd-font-body text-left space-y-4 w-full max-w-[650px]">
                  {welcomeContent.split(/\n\n+/).map((para, i) => (
                    <p key={i} className="whitespace-pre-line">{para}</p>
                  ))}
                </div>
              </div>
              <div className="w-full max-w-[650px] flex flex-col items-center justify-center gap-16 text-center pt-2">
                <div className="space-y-2">
                  <p className="carrd-font-label text-[1.3125rem]">Date</p>
                  <div className="space-y-0.5">
                    <p className="carrd-font-body">March 18-20, 2026</p>
                    <p className="carrd-font-body">7-11pm</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="carrd-font-label text-[1.3125rem]">Location</p>
                  <div className="space-y-0.5">
                    <p className="carrd-font-body">SoMA, SF</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReservationStep(1)
                  setShowReservationView(true)
                }}
                className="carrd-btn px-8 py-3"
              >
                Reserve Your Seat
              </button>
            </section>
            <SiteFooter variant="main" />
          </div>
          <div className="w-1/2 flex-shrink-0 flex flex-col items-center px-6 py-4 gap-3 overflow-y-auto min-h-0">
            <div className="w-full flex flex-col items-center gap-1 shrink-0">
              <div className="flex justify-center gap-2" aria-hidden>
                {([1, 2, 3] as const).map((step) => (
                  <span key={step} className={`w-2 h-2 rounded-full transition-colors duration-300 ${reservationStep === step ? 'bg-[#FAE0B9]' : 'bg-[#D9D0BF]/40'}`} />
                ))}
              </div>
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 flex justify-start min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (reservationStep === 1) setShowReservationView(false)
                      else setReservationStep((s) => (s - 1) as 1 | 2 | 3)
                    }}
                    className="carrd-font-body text-sm text-[#D9D0BF] hover:text-[#FAEBD4] underline focus:outline-none cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
                <h2 className="carrd-font-heading carrd-font-heading-sm flex-1 text-center italic">Reservation</h2>
                <div className="flex-1 min-w-0" aria-hidden />
              </div>
            </div>
            <section className="carrd-reservation-section w-full min-w-0 overflow-x-hidden flex flex-col shrink-0">
              <div
                className="flex transition-transform duration-500 ease-in-out flex-1 min-w-0"
                style={{
                  width: '300%',
                  transform: `translateX(-${(reservationStep - 1) * (100 / 3)}%)`,
                }}
              >
                {/* Mobile reservation reuses same panel structure - content is in desktop flow below, we need inline copy */}
                <div className="flex-shrink-0 w-1/3 flex flex-col items-center gap-8 px-3 overflow-y-auto">
                  <h2 className="carrd-font-heading carrd-font-h2">1. Choose Your Evening</h2>
                  <p className="carrd-font-body text-left w-full max-w-[650px] text-sm">The teahouse is open by reservation with limited seats. Reserve a spot to gift yourself a cozy evening.</p>
                  <div className="w-full max-w-[650px] flex flex-col gap-5">
                    {dates.map((d) => {
                      const [datePart, timePart] = d.dateTime.includes(', ') ? d.dateTime.split(', ') : [d.dateTime, '']
                      const headerRest = timePart ? `${datePart} ${timePart.toUpperCase()}` : datePart
                      const musicianLine = d.musicians[0] ?? ''
                      const isSelected = selectedDate === d.id
                      return (
                        <div
                          key={d.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => { setSelectedDate(d.id); setReservationStep(2) }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDate(d.id); setReservationStep(2) } }}
                          className={`carrd-mobile-pill flex flex-row items-center justify-between gap-3 text-left w-full cursor-pointer ${isSelected ? 'carrd-mobile-pill--selected' : ''}`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="leading-tight text-[0.875rem]">
                              <span className="text-[#C4AF86] font-medium">{d.day}</span>
                              <span className="text-[#FAEBD4]/90 font-normal">, {headerRest}</span>
                            </p>
                            {d.spotifyUrl ? (
                              <a href={d.spotifyUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[0.8125rem] text-[#D9D0BF]/90 italic underline hover:text-[#FAEBD4] focus:outline-none focus:underline mt-0.5 block">
                                {musicianLine}
                              </a>
                            ) : (
                              <p className="text-[#D9D0BF]/90 text-[0.8125rem] italic mt-0.5">{musicianLine}</p>
                            )}
                          </div>
                          <span className={`carrd-mobile-pill-select shrink-0 ${isSelected ? 'carrd-mobile-pill-select--selected' : ''}`}>Select</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="flex-shrink-0 w-1/3 flex flex-col items-center gap-8 px-3 overflow-y-auto">
                  <h2 className="carrd-font-heading carrd-font-h2">2. Choose Your Ticket</h2>
                  <div className="w-full max-w-[650px] flex flex-col gap-5">
                    {tiers.filter((t) => t.id === 'community' || t.id === 'patron').map((t) => {
                      const qty = selections[t.id] ?? 0
                      const isSelected = qty > 0
                      return (
                        <div key={t.id} className={`carrd-mobile-pill flex flex-col gap-1.5 text-left w-full ${isSelected ? 'carrd-mobile-pill--selected' : ''}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="leading-tight text-[0.875rem]">
                                <span className="text-[#C4AF86] font-medium">{t.label}</span>
                                <span className="text-[#FAEBD4]/90 font-normal">, ${t.price}</span>
                              </p>
                              <p className="text-[#D9D0BF]/90 text-[0.75rem] leading-snug mt-0.5 line-clamp-2">{t.blurb}</p>
                              <button type="button" onClick={() => setExpandedTierDetails((v) => !v)} className="text-[0.75rem] text-[#D9D0BF]/80 hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer w-fit mt-1">
                                {expandedTierDetails ? 'Hide pricing details' : 'More on pricing'}
                              </button>
                            </div>
                            {qty > 0 ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button type="button" onClick={() => handleQuantityChange(t.id, -1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D0BF]/20 text-[#FAEBD4] text-sm" aria-label={`Decrease ${t.label}`}>−</button>
                                <span className="w-6 text-center text-sm tabular-nums text-[#FAEBD4]">{qty}</span>
                                <button type="button" onClick={() => handleQuantityChange(t.id, 1)} disabled={totalQuantity >= 4} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D0BF]/20 text-[#FAEBD4] text-sm disabled:opacity-40" aria-label={`Increase ${t.label}`}>+</button>
                              </div>
                            ) : (
                              <button type="button" onClick={() => handleTierClick(t.id)} className="carrd-mobile-pill-select shrink-0">Select</button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <p className="carrd-font-body text-left text-[0.8125rem]">
                      If cost is a barrier, please consider our{' '}
                      <button type="button" onClick={() => setShowSupportedTier(true)} className="underline cursor-pointer text-[#FAE0B9] focus:outline-none focus:underline">supported ticket option</button>.
                    </p>
                    {(showSupportedTier || (selections['supported'] ?? 0) > 0) && (
                      <div className={`carrd-mobile-pill flex flex-col gap-1.5 text-left w-full ${(selections['supported'] ?? 0) > 0 ? 'carrd-mobile-pill--selected' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="leading-tight text-[0.875rem]"><span className="text-[#C4AF86] font-medium">Supported</span><span className="text-[#FAEBD4]/90 font-normal">, $20+</span></p>
                            <p className="text-[#D9D0BF]/90 text-[0.75rem] leading-snug mt-0.5 line-clamp-2">{tiers.find((t) => t.id === 'supported')?.blurb}</p>
                          </div>
                          {(selections['supported'] ?? 0) > 0 ? (
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <div className="flex items-center gap-0.5 rounded-lg bg-[#FAEBD4]/5 px-2 py-1.5 border border-[#D9D0BF]/25">
                                <span className="text-[#D9D0BF] text-sm">$</span>
                                <input type="number" min={20} max={40} value={supportedPriceInput} placeholder="20–40" onChange={(e) => { const raw = e.target.value; setSupportedPriceInput(raw); const v = parseInt(raw, 10); if (!isNaN(v) && v >= 20 && v <= 40) setSupportedPrice(v); else if (raw === '') setSelections((prev) => { const n = { ...prev }; delete n.supported; return n }); }} onBlur={() => { const v = parseInt(supportedPriceInput, 10); if (!isNaN(v) && v >= 20 && v <= 40) { setSupportedPrice(v); setSupportedPriceInput(String(v)) } else if (supportedPriceInput === '') setSelections((prev) => { const n = { ...prev }; delete n.supported; return n }); else setSupportedPriceInput(String(supportedPrice)) }} className="carrd-font-body w-12 bg-transparent text-center text-[#FAEBD4] text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                              </div>
                              <span className="text-[#D9D0BF]/60 text-sm">×</span>
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => handleQuantityChange('supported', -1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D0BF]/20 text-[#FAEBD4] text-sm" aria-label="Decrease Supported">−</button>
                                <span className="w-6 text-center text-sm tabular-nums text-[#FAEBD4]">{selections['supported'] ?? 0}</span>
                                <button type="button" onClick={() => handleQuantityChange('supported', 1)} disabled={totalQuantity >= 4} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D0BF]/20 text-[#FAEBD4] text-sm disabled:opacity-40" aria-label="Increase Supported">+</button>
                              </div>
                            </div>
                          ) : (
                            <button type="button" onClick={() => { setShowSupportedTier(true); setSupportedPrice(20); setSupportedPriceInput('20'); setSelections((prev) => ({ ...prev, supported: 1 })) }} className="carrd-mobile-pill-select shrink-0">Select</button>
                          )}
                        </div>
                      </div>
                    )}
                    <button type="button" onClick={() => setExpandedPricingNote((v) => !v)} className="carrd-font-body text-[0.8125rem] text-[#D9D0BF]/80 hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer w-fit flex items-center gap-1">
                      {expandedPricingNote ? 'Hide' : 'About our pricing'}
                      <span className="text-[0.75rem] transition-transform" style={{ transform: expandedPricingNote ? 'rotate(180deg)' : 'none' }}>▾</span>
                    </button>
                    {expandedPricingNote && (
                      <p className="carrd-font-body text-left text-[0.8125rem] text-[#D9D0BF]/95">
                        Our community spans a wide range of financial situations. Our tiered pricing helps us balance the financial sustainability and accessibility of the teahouse. We invite you to choose the level that feels right for you — one that honors your own capacity, while helping us keep this space open, welcoming and alive.
                      </p>
                    )}
                  </div>
                  <button type="button" onClick={() => setReservationStep(3)} disabled={!hasSelection} className="carrd-btn px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed">Continue</button>
                </div>
                <div className="flex-shrink-0 w-1/3 flex flex-col items-center gap-8 px-3 overflow-y-auto">
                  <h2 className="carrd-font-heading carrd-font-h2">3. Complete Your Reservation</h2>
                  {selectedDate && hasSelection ? (
                    <div className="carrd-font-body rounded-lg bg-[#FAEBD4]/20 px-4 py-4 text-left w-full max-w-[650px]">
                      <div className="space-y-3">
                        <div><p className="text-sm text-[#D9D0BF]/80 uppercase tracking-wider">Date</p><p className="text-base text-[#FAEBD4]">{selectedDateData?.dateTime}</p></div>
                        <div><p className="text-sm text-[#D9D0BF]/80 uppercase tracking-wider mb-1.5">Tickets</p><div className="space-y-1">{(['supported', 'community', 'patron'] as const).filter((tid) => (selections[tid] ?? 0) > 0).map((tierId) => { const qty = selections[tierId] ?? 0; const tier = tiers.find((t) => t.id === tierId); const price = tierId === 'supported' ? supportedPrice : (tier?.price ?? 0); const label = tier?.label ?? tierId; return <p key={tierId} className="text-base text-[#FAEBD4]">{label} — ${price} × {qty} = ${price * qty}</p> })}</div></div>
                        <div className="pt-2 border-t border-[#D9D0BF]/30"><p className="text-sm text-[#D9D0BF]/80 uppercase tracking-wider">Total</p><p className="text-lg font-medium text-[#FAEBD4]">${totalPrice}</p></div>
                      </div>
                    </div>
                  ) : null}
                  <form className="w-full max-w-[650px] flex flex-col gap-4 carrd-font-body">
                    <input type="hidden" name="device_type" value={deviceType} />
                    <input type="hidden" name="date" value={selectedDate ?? ''} />
                    <label className="flex flex-col gap-1.5">Name *<input type="text" name="name" required value={formData.name} onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none focus:ring-2 focus:ring-[#FAE0B9]/30" placeholder="Your name" /></label>
                    <label className="flex flex-col gap-1.5">Email *<input type="email" name="email" required value={formData.email} onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))} className="mt-1 w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none focus:ring-2 focus:ring-[#FAE0B9]/30" placeholder="you@example.com" /></label>
                    <label className="flex flex-col gap-1.5">Notes<textarea name="notes" value={formData.notes} onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value }))} rows={2} className="mt-1 w-full resize-none rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none focus:ring-2 focus:ring-[#FAE0B9]/30" placeholder="Anything else we should know?" /></label>
                  </form>
                  <div className="w-full max-w-[650px] text-left">
                    <p className="carrd-font-body text-sm font-medium mb-1.5">A few things to note before booking:</p>
                    <ul className="carrd-font-body text-base space-y-1 list-none pl-0 leading-tight">
                      {BOOKING_NOTES.map((item, i) => (
                        <li key={i} className="flex items-center gap-2"><span className="text-[#D9D0BF] w-1.5 h-1.5 rounded-full bg-[#D9D0BF] shrink-0" aria-hidden /><span className="flex-1 text-[#D9D0BF]/95">{item}</span></li>
                      ))}
                    </ul>
                  </div>
                  {selectedDate && hasSelection && checkoutError && (
                    <p className="carrd-font-body text-sm text-red-300 w-full max-w-[650px]" role="alert">{checkoutError}</p>
                  )}
                  {selectedDate && hasSelection && (
                    <button type="button" disabled={isSubmitting} onClick={async () => {
                      if (!selectedDate || !hasSelection || !formData.name.trim() || !formData.email.trim()) return
                      setIsSubmitting(true); setCheckoutError(null)
                      try {
                        const items = Object.entries(selections).filter(([, q]) => q > 0).map(([tierId, qty]) => ({ tierId, quantity: qty, ...(tierId === 'supported' && { supportedPrice }) }))
                        const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dateId: selectedDate, items, supportedPrice: (selections['supported'] ?? 0) > 0 ? supportedPrice : undefined, name: formData.name.trim(), email: formData.email.trim(), notes: formData.notes.trim(), device: deviceType }) })
                        const data = await res.json()
                        if (!res.ok) { setCheckoutError(data.error ?? 'Something went wrong'); return }
                        if (data.url) window.location.href = data.url
                        else setCheckoutError('No checkout URL received')
                      } catch { setCheckoutError('Network error. Please try again.') }
                      finally { setIsSubmitting(false) }
                    }} className="carrd-btn px-10 py-3 disabled:opacity-70 disabled:cursor-not-allowed mt-8">
                      {isSubmitting ? 'Redirecting…' : 'Finish Booking'}
                    </button>
                  )}
                </div>
              </div>
            </section>
            <SiteFooter variant="main" />
          </div>
        </div>
      </div>
      {/* Desktop: single column */}
      <div className="hidden md:flex w-full max-w-[60rem] flex-col items-center px-12 py-12 gap-[1.25em]">
        {/* Hero: Title + Subtitle */}
        <div className="relative w-full flex flex-col items-center gap-1">
          <h1 className="carrd-font-heading carrd-font-title text-center">
            Midnight Teahouse
          </h1>
          <p className="carrd-font-subtitle text-center italic">
            an enchanted world hidden in San Francisco
          </p>
        </div>

        {/* Video */}
        <div className="carrd-video-fade w-full -mx-6 md:-mx-12 py-6">
          <div className="aspect-video overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/images/midnight_site_vid_hi_res.mp4" type="video/mp4" />
              <source src="/images/midnight_site_vid_hi_res.mov" type="video/quicktime" />
            </video>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex justify-center py-6" style={{ transform: 'scale(1.3)' }}>
          <CountdownTimer targetTimestamp={countdownTarget} length={3} />
        </div>

        {/* March Gatherings */}
        <section className="w-full flex flex-col items-center gap-10 text-center">
          <div className="flex flex-col items-center gap-[1em] w-full">
            <h2 className="carrd-font-heading text-[0.96rem] md:text-3xl italic" style={{ letterSpacing: '-2px' }}>
              Crossing into Spring
            </h2>
            <div className="carrd-font-body text-left space-y-4 w-full max-w-[650px]">
            {welcomeContent.split(/\n\n+/).map((para, i) => (
              <p key={i} className="whitespace-pre-line">
                {para}
              </p>
            ))}
            </div>
          </div>
          <div className="w-full max-w-[650px] flex flex-col md:flex-row items-center md:items-start justify-center gap-16 md:gap-28 text-center pt-2">
            <div className="space-y-2">
              <p className="carrd-font-label text-[1.3125rem]">
                Date
              </p>
              <div className="space-y-0.5">
                <p className="carrd-font-body">
                  March 18-20, 2026
                </p>
                <p className="carrd-font-body">
                  7-11pm
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="carrd-font-label text-[1.3125rem]">
                Location
              </p>
              <div className="space-y-0.5">
                <p className="carrd-font-body">
                  SoMA, SF
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setShowReservationView(true)
                joinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              } else {
                scrollToSection(joinRef)
              }
            }}
            className="carrd-btn px-8 py-3"
          >
            Reserve Your Seat
          </button>
        </section>

        <hr className="carrd-divider-solid border-0 my-8" />

        <div className="w-full flex flex-col items-center gap-1">
          {/* Step indicator */}
          <div className="flex justify-center gap-2" aria-hidden>
            {([1, 2, 3] as const).map((step) => (
              <span
                key={step}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  reservationStep === step ? 'bg-[#FAE0B9]' : 'bg-[#D9D0BF]/40'
                }`}
              />
            ))}
          </div>
          <div className="flex items-start justify-between w-full">
            <div className="flex-1 flex justify-start min-w-0">
              {(reservationStep > 1 || showReservationView) && (
                <button
                  type="button"
                  onClick={() => {
                    if (reservationStep === 1 && showReservationView) {
                      setShowReservationView(false)
                    } else if (reservationStep > 1) {
                      setReservationStep((s) => (s - 1) as 1 | 2 | 3)
                    }
                  }}
                  className="carrd-font-body text-sm text-[#D9D0BF] hover:text-[#FAEBD4] underline focus:outline-none cursor-pointer"
                >
                  ← Back
                </button>
              )}
            </div>
            <h2 className="carrd-font-heading carrd-font-heading-sm flex-1 text-center italic">
              Reservation
            </h2>
            <div className="flex-1 min-w-0" aria-hidden />
          </div>
        </div>

        {/* Reservation: three sliding panels (evening → ticket → form) */}
        <section
          ref={joinRef}
          className="carrd-reservation-section w-full min-w-0 overflow-x-hidden mt-1"
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: '300%',
              transform: `translateX(-${(reservationStep - 1) * (100 / 3)}%)`,
            }}
          >
            {/* Panel 1: Choose your evening */}
            <div className="flex-shrink-0 w-1/3 flex flex-col items-center gap-6 px-3 md:px-6">
              <h2 className="carrd-font-heading carrd-font-h2">
                1. Choose Your Evening
              </h2>
              <p className="carrd-font-body text-left w-full max-w-[650px]">
                The teahouse is open by reservation with limited seats. Reserve a spot to gift yourself a cozy evening.
              </p>
              {/* Mobile: date cards (2-line, succinct) */}
              <div className="md:hidden w-full max-w-[650px] flex flex-col gap-5">
                {dates.map((d) => {
                  const [datePart, timePart] = d.dateTime.includes(', ') ? d.dateTime.split(', ') : [d.dateTime, '']
                  const headerRest = timePart ? `${datePart} ${timePart.toUpperCase()}` : datePart
                  const musicianLine = d.musicians[0] ?? ''
                  const isSelected = selectedDate === d.id
                  return (
                    <div
                      key={d.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedDate(d.id)
                        setReservationStep(2)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedDate(d.id)
                          setReservationStep(2)
                        }
                      }}
                      className={`carrd-mobile-pill flex flex-row items-center justify-between gap-3 text-left w-full cursor-pointer ${
                        isSelected ? 'carrd-mobile-pill--selected' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="leading-tight text-[0.875rem]">
                          <span className="text-[#C4AF86] font-medium">{d.day}</span>
                          <span className="text-[#FAEBD4]/90 font-normal">, {headerRest}</span>
                        </p>
                        {d.spotifyUrl ? (
                          <a
                            href={d.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[0.8125rem] text-[#D9D0BF]/90 italic underline hover:text-[#FAEBD4] focus:outline-none focus:underline mt-0.5 block"
                          >
                            {musicianLine}
                          </a>
                        ) : (
                          <p className="text-[#D9D0BF]/90 text-[0.8125rem] italic mt-0.5">{musicianLine}</p>
                        )}
                      </div>
                      <span className={`carrd-mobile-pill-select shrink-0 ${isSelected ? 'carrd-mobile-pill-select--selected' : ''}`}>
                        Select
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Desktop: date cards */}
              <div className="hidden md:block w-full max-w-[650px] space-y-4">
                {dates.map((d) => (
                  <div
                    key={d.id}
                    className="carrd-reservation-card flex flex-col gap-2 md:grid md:grid-cols-[6rem_1fr_auto] md:grid-rows-[auto_auto] md:gap-x-4 md:gap-y-1 md:py-3 md:items-start last:border-b-0"
                  >
                    <p className="carrd-font-body carrd-accent-color font-medium text-[1.625rem]">{d.day}</p>
                    <div className="carrd-font-body carrd-accent-color min-w-0 space-y-0 text-[1.625rem]">
                      {d.musicians.map((line, i) => (
                        <p key={i} className="font-medium italic">
                          {line}
                        </p>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.id)
                        setReservationStep(2)
                      }}
                      className={`carrd-btn px-6 py-3 flex-shrink-0 row-span-2 self-start order-last md:order-none md:ml-4 ${
                        selectedDate === d.id ? 'bg-[#FAE0B9]/20' : ''
                      }`}
                    >
                      Select
                    </button>
                    <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0">
                      {d.dateTime.includes(', ') ? (
                        <>
                          {d.dateTime.split(', ')[0]}
                          <br />
                          {d.dateTime.split(', ')[1] ?? ''}
                        </>
                      ) : (
                        d.dateTime
                      )}
                    </p>
                    {d.blurb ? (
                      <div className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0">
                        {expandedBlurbId === d.id ? (
                          <>
                            <p className="carrd-table-row-2">{d.blurb}</p>
                            {d.spotifyUrl ? (
                              <a
                                href={d.spotifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block italic text-[#D9D0BF] underline hover:text-[#FAEBD4] focus:outline-none focus:underline"
                              >
                                {d.spotifyLabel}
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => setExpandedBlurbId(null)}
                              className="mt-1 block italic text-[#D9D0BF] hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer"
                            >
                              ...less
                            </button>
                          </>
                        ) : (
                          <p className="carrd-table-row-2 min-w-0 w-full">
                            {d.blurb.length > 90 ? (
                              <>
                                {d.blurb.slice(0, 90)}
                                {' '}
                                <button
                                  type="button"
                                  onClick={() => setExpandedBlurbId(d.id)}
                                  className="inline italic text-[#D9D0BF] hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer p-0 m-0 align-baseline"
                                >
                                  ...more
                                </button>
                              </>
                            ) : (
                              d.blurb
                            )}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Choose your ticket */}
            <div ref={tierRef} className="flex-shrink-0 w-1/3 flex flex-col items-center gap-6 px-3 md:px-6">
              <h2 className="carrd-font-heading carrd-font-h2">
                2. Choose Your Ticket
              </h2>
              {/* Mobile: cards first, then dropdown for pricing note */}
              <div className="md:hidden w-full max-w-[650px] flex flex-col gap-5">
                {tiers
                  .filter((t) => t.id === 'community' || t.id === 'patron')
                  .map((t) => {
                    const qty = selections[t.id] ?? 0
                    const isSelected = qty > 0
                    return (
                      <div
                        key={t.id}
                        className={`carrd-mobile-pill flex flex-col gap-1.5 text-left w-full ${isSelected ? 'carrd-mobile-pill--selected' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="leading-tight text-[0.875rem]">
                              <span className="text-[#C4AF86] font-medium">{t.label}</span>
                              <span className="text-[#FAEBD4]/90 font-normal">, ${t.price}</span>
                            </p>
                            <p className="text-[#D9D0BF]/90 text-[0.75rem] leading-snug mt-0.5 line-clamp-2">
                              {t.blurb}
                            </p>
                            <button
                              type="button"
                              onClick={() => setExpandedTierDetails((v) => !v)}
                              className="text-[0.75rem] text-[#D9D0BF]/80 hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer w-fit mt-1"
                            >
                              {expandedTierDetails ? 'Hide pricing details' : 'More on pricing'}
                            </button>
                          </div>
                          {qty > 0 ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(t.id, -1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D0BF]/20 text-[#FAEBD4] text-sm transition-colors hover:bg-[#FAE0B9]/25 active:bg-[#FAE0B9]/30"
                                aria-label={`Decrease ${t.label} quantity`}
                              >
                                −
                              </button>
                              <span className="w-6 text-center text-sm tabular-nums text-[#FAEBD4]">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(t.id, 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D0BF]/20 text-[#FAEBD4] text-sm transition-colors hover:bg-[#FAE0B9]/25 active:bg-[#FAE0B9]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D9D0BF]/20"
                                disabled={totalQuantity >= 4}
                                aria-label={`Increase ${t.label} quantity`}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTierClick(t.id)}
                              className={`carrd-mobile-pill-select shrink-0 ${isSelected ? 'carrd-mobile-pill-select--selected' : ''}`}
                            >
                              Select
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                <p className="carrd-font-body text-left text-[0.8125rem]">
                  If cost is a barrier, please consider our{' '}
                  <button
                    type="button"
                    onClick={() => setShowSupportedTier(true)}
                    className="underline hover:no-underline cursor-pointer text-[#FAE0B9] focus:outline-none focus:underline"
                  >
                    supported ticket option
                  </button>
                  .
                </p>
                {(showSupportedTier || (selections['supported'] ?? 0) > 0) && (
                  <div
                    className={`carrd-mobile-pill flex flex-col gap-1.5 text-left w-full ${(selections['supported'] ?? 0) > 0 ? 'carrd-mobile-pill--selected' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="leading-tight text-[0.875rem]">
                          <span className="text-[#C4AF86] font-medium">Supported</span>
                          <span className="text-[#FAEBD4]/90 font-normal">, $20+</span>
                        </p>
                        <p className="text-[#D9D0BF]/90 text-[0.75rem] leading-snug mt-0.5 line-clamp-2">
                          {tiers.find((t) => t.id === 'supported')?.blurb}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedTierDetails((v) => !v)}
                          className="text-[0.8125rem] text-[#D9D0BF]/80 hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer w-fit mt-1"
                        >
                          {expandedTierDetails ? 'Hide pricing details' : 'More on pricing'}
                        </button>
                      </div>
                      {(selections['supported'] ?? 0) > 0 ? (
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <div className="flex items-center gap-0.5 rounded-lg bg-[#FAEBD4]/5 px-2 py-1.5 border border-[#D9D0BF]/25">
                            <span className="text-[#D9D0BF] text-sm">$</span>
                            <input
                              type="number"
                              min={20}
                              max={40}
                              value={supportedPriceInput}
                              placeholder="20–40"
                              onChange={(e) => {
                                const raw = e.target.value
                                setSupportedPriceInput(raw)
                                const v = parseInt(raw, 10)
                                if (!isNaN(v) && v >= 20 && v <= 40) setSupportedPrice(v)
                                else if (raw === '') {
                                  setSelections((prev) => { const n = { ...prev }; delete n.supported; return n })
                                }
                              }}
                              onBlur={() => {
                                const v = parseInt(supportedPriceInput, 10)
                                if (!isNaN(v) && v >= 20 && v <= 40) {
                                  setSupportedPrice(v)
                                  setSupportedPriceInput(String(v))
                                } else if (supportedPriceInput === '') {
                                  setSelections((prev) => { const n = { ...prev }; delete n.supported; return n })
                                } else setSupportedPriceInput(String(supportedPrice))
                              }}
                              className="carrd-font-body w-12 bg-transparent text-center text-[#FAEBD4] text-sm placeholder:text-[#D9D0BF]/50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                          <span className="text-[#D9D0BF]/60 text-sm">×</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange('supported', -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D0BF]/20 text-[#FAEBD4] text-sm transition-colors hover:bg-[#FAE0B9]/25"
                              aria-label="Decrease Supported quantity"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm tabular-nums text-[#FAEBD4]">
                              {selections['supported'] ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange('supported', 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D9D0BF]/20 text-[#FAEBD4] text-sm transition-colors hover:bg-[#FAE0B9]/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#D9D0BF]/20"
                              disabled={totalQuantity >= 4}
                              aria-label="Increase Supported quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setShowSupportedTier(true)
                            setSupportedPrice(20)
                            setSupportedPriceInput('20')
                            setSelections((prev) => ({ ...prev, supported: 1 }))
                          }}
                          className="carrd-mobile-pill-select shrink-0"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setExpandedPricingNote((v) => !v)}
                  className="carrd-font-body text-[0.8125rem] text-[#D9D0BF]/80 hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer w-fit flex items-center gap-1"
                >
                  {expandedPricingNote ? 'Hide' : 'About our pricing'}
                  <span className="text-[0.75rem] transition-transform" style={{ transform: expandedPricingNote ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>
                {expandedPricingNote && (
                  <p className="carrd-font-body text-left text-[0.8125rem] text-[#D9D0BF]/95">
                    Our community spans a wide range of financial situations. Our tiered pricing helps us balance the financial sustainability and accessibility of the teahouse. We invite you to choose the level that feels right for you — one that honors your own capacity, while helping us keep this space open, welcoming and alive.
                  </p>
                )}
                {expandedTierDetails && (
                  <div className="carrd-font-body carrd-table-row-2-sm text-[#D9D0BF] space-y-3 text-[0.9375rem]">
                    {tiers.filter((t) => t.id === 'community' || t.id === 'patron' || t.id === 'supported').map((t) => (
                      <div key={t.id}>
                        <p className="font-medium text-[#C4AF86]">{t.label} — ${t.id === 'supported' ? '20+' : t.price}</p>
                        <p>{t.blurb}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Desktop: pricing note dropdown + tier cards */}
              <div className="hidden md:block w-full max-w-[650px] space-y-4">
                <button
                  type="button"
                  onClick={() => setExpandedPricingNote((v) => !v)}
                  className="carrd-font-body text-sm text-[#D9D0BF]/80 hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer w-fit flex items-center gap-1"
                >
                  {expandedPricingNote ? 'Hide' : 'About our pricing'}
                  <span className="text-xs transition-transform" style={{ transform: expandedPricingNote ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>
                {expandedPricingNote && (
                  <p className="carrd-font-body text-left w-full max-w-[650px]">
                    Our community spans a wide range of financial situations. Our tiered pricing helps us balance the financial sustainability and accessibility of the teahouse. We invite you to choose the level that feels right for you — one that honors your own capacity, while helping us keep this space open, welcoming and alive.
                  </p>
                )}
              </div>
              {/* Desktop: tier cards */}
              <div className="hidden md:block w-full max-w-[650px] space-y-4">
                {tiers
                  .filter((t) => t.id === 'community' || t.id === 'patron')
                  .map((t) => {
                    const qty = selections[t.id] ?? 0
                    return (
                      <div
                        key={t.id}
                        className="carrd-reservation-card flex flex-col gap-2 md:grid md:grid-cols-[6rem_1fr_auto] md:grid-rows-[auto_auto] md:gap-x-4 md:gap-y-1 md:py-3 md:items-start last:border-b-0"
                      >
                        <p className="carrd-font-body carrd-accent-color font-medium text-[1.625rem]">{t.label}</p>
                        <p className="carrd-font-body carrd-accent-color font-medium italic text-[1.625rem]">{t.mainLine}</p>
                        <div className="flex items-start justify-end min-w-[4.5rem] row-span-2 self-start order-last md:order-none">
                          {qty > 0 ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(t.id, -1)}
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D9D0BF]/25 text-[#FAEBD4] text-xs transition-colors hover:bg-[#FAE0B9]/30"
                                aria-label={`Decrease ${t.label} quantity`}
                              >
                                −
                              </button>
                              <span className="carrd-font-body w-5 text-center text-sm tabular-nums text-[#FAEBD4]">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(t.id, 1)}
                                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D9D0BF]/25 text-[#FAEBD4] text-xs transition-colors hover:bg-[#FAE0B9]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                disabled={totalQuantity >= 4}
                                aria-label={`Increase ${t.label} quantity`}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTierClick(t.id)}
                              className="carrd-btn px-6 py-3 md:ml-4"
                            >
                              Select
                            </button>
                          )}
                        </div>
                        <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0">${t.price}</p>
                        <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0">{t.blurb}</p>
                      </div>
                    )
                  })}
              </div>
              <p className="hidden md:block carrd-font-body text-left w-full max-w-[650px]">
                If cost is a barrier, please consider our{' '}
                <button
                  type="button"
                  onClick={() => setShowSupportedTier(true)}
                  className="underline hover:no-underline cursor-pointer text-[#FAE0B9] focus:outline-none focus:underline"
                >
                  supported ticket option
                </button>
                .
              </p>
              {showSupportedTier && (
              <div className="hidden md:block w-full max-w-[650px]">
              {tiers.filter((t) => t.id === 'supported').map((t) => (
                <div
                  key={t.id}
                  className="carrd-reservation-card flex flex-col gap-2 md:grid md:grid-cols-[6rem_1fr_auto] md:grid-rows-[auto_auto] md:gap-x-4 md:gap-y-1 md:py-3 md:items-start w-full max-w-[650px] last:border-b-0"
                >
                  <p className="carrd-font-body carrd-accent-color font-medium text-[1.625rem]">Supported</p>
                  <p className="carrd-font-body carrd-accent-color font-medium italic text-[1.625rem]">{t.blurb}</p>
                  <div className="flex items-start justify-end min-w-[4.5rem] row-span-2 self-start order-last md:order-none">
                    {(selections['supported'] ?? 0) > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 rounded-lg bg-[#FAEBD4]/5 px-1.5 py-1">
                          <span className="carrd-font-body text-[#D9D0BF] text-xs">$</span>
                          <input
                            type="number"
                            min={20}
                            max={40}
                            value={supportedPriceInput}
                            placeholder="20–40"
                            onChange={(e) => {
                              const raw = e.target.value
                              setSupportedPriceInput(raw)
                              const v = parseInt(raw, 10)
                              if (!isNaN(v) && v >= 20 && v <= 40) {
                                setSupportedPrice(v)
                              } else if (raw === '') {
                                setSelections((prev) => {
                                  const next = { ...prev }
                                  delete next.supported
                                  return next
                                })
                              }
                            }}
                            onBlur={() => {
                              const v = parseInt(supportedPriceInput, 10)
                              if (!isNaN(v) && v >= 20 && v <= 40) {
                                setSupportedPrice(v)
                                setSupportedPriceInput(String(v))
                              } else if (supportedPriceInput === '') {
                                setSelections((prev) => {
                                  const next = { ...prev }
                                  delete next.supported
                                  return next
                                })
                              } else {
                                setSupportedPriceInput(String(supportedPrice))
                              }
                            }}
                            className="carrd-font-body w-12 bg-transparent text-center text-[#FAEBD4] text-xs placeholder:text-[#D9D0BF]/50 placeholder:text-[0.65rem] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <span className="text-[#D9D0BF]/60 text-sm">×</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange('supported', -1)}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D9D0BF]/25 text-[#FAEBD4] text-xs transition-colors hover:bg-[#FAE0B9]/30"
                            aria-label="Decrease Supported quantity"
                          >
                            −
                          </button>
                          <span className="carrd-font-body w-5 text-center text-sm tabular-nums text-[#FAEBD4]">
                            {selections['supported'] ?? 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange('supported', 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D9D0BF]/25 text-[#FAEBD4] text-xs transition-colors hover:bg-[#FAE0B9]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            disabled={totalQuantity >= 4}
                            aria-label="Increase Supported quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSupportedPrice(20)
                          setSupportedPriceInput('20')
                          setSelections({ supported: 1 })
                        }}
                        className="carrd-btn px-6 py-3 md:ml-4"
                      >
                        Select
                      </button>
                    )}
                  </div>
                  <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0">$20+</p>
                  <div className="hidden md:block" />
                </div>
              ))}
              </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-[650px]">
                <button
                  type="button"
                  onClick={() => setReservationStep(3)}
                  disabled={!hasSelection}
                  className="carrd-btn px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Panel 3: Complete your reservation (summary + form + reserve) */}
            <div ref={formRef} className="flex-shrink-0 w-1/3 flex flex-col items-center gap-6 px-3 md:px-6">
              <div className="inline-flex flex-col items-stretch gap-6">
                <h2 className="carrd-font-heading carrd-font-h2">
                  3. Complete Your Reservation
                </h2>
              {selectedDate && hasSelection ? (
                <>
                  {/* Summary box: same width as heading */}
                  <div className="carrd-font-body rounded-lg bg-[#FAEBD4]/20 px-4 py-4 text-left w-full">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-[#D9D0BF]/80 uppercase tracking-wider">Date</p>
                        <p className="text-base text-[#FAEBD4]">
                          {selectedDateData?.dateTime.includes(', ') ? (
                            <>
                              {selectedDateData.label}
                              <br />
                              {selectedDateData.dateTime.split(', ')[1] ?? ''}
                            </>
                          ) : (
                            selectedDateDisplay
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#D9D0BF]/80 uppercase tracking-wider mb-1.5">Tickets</p>
                        <div className="space-y-1">
                          {(['supported', 'community', 'patron'] as const)
                            .filter((tierId) => (selections[tierId] ?? 0) > 0)
                            .map((tierId) => {
                              const qty = selections[tierId] ?? 0
                              const tier = tiers.find((t) => t.id === tierId)
                              const price = tierId === 'supported' ? supportedPrice : (tier?.price ?? 0)
                              const label = tier?.label ?? (tierId === 'supported' ? 'Supported' : tierId)
                              return (
                                <p key={tierId} className="text-base text-[#FAEBD4]">
                                  {label} — ${price} × {qty} = ${price * qty}
                                </p>
                              )
                            })}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#D9D0BF]/30">
                        <p className="text-sm text-[#D9D0BF]/80 uppercase tracking-wider">Total</p>
                        <p className="text-lg font-medium text-[#FAEBD4]">${totalPrice}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="carrd-font-body space-y-3 text-center">
                  <p className="opacity-80">
                    Select an evening and ticket above to see your reservation summary.
                  </p>
                  <button
                    type="button"
                    onClick={() => setReservationStep(1)}
                    className="carrd-btn px-8 py-3"
                  >
                    Choose evening & ticket
                  </button>
                </div>
              )}
              </div>
              <form
                id="carrd-form"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
                className="w-full max-w-[650px] flex flex-col gap-4 carrd-font-body"
              >
                <input type="hidden" name="device_type" value={deviceType} />
                <input type="hidden" name="date" value={selectedDate ?? ''} />
                <label className="flex flex-col gap-1.5">
                  Name *
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none focus:ring-2 focus:ring-[#FAE0B9]/30"
                    placeholder="Your name"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  Email *
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none focus:ring-2 focus:ring-[#FAE0B9]/30"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  Notes
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value }))}
                    rows={2}
                    className="mt-1 w-full resize-none rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none focus:ring-2 focus:ring-[#FAE0B9]/30"
                    placeholder="Anything else we should know?"
                  />
                </label>
              </form>
              {selectedDate && hasSelection && checkoutError && (
                <p className="carrd-font-body text-sm text-red-300" role="alert">
                  {checkoutError}
                </p>
              )}
              <div className="w-full max-w-[650px] text-left mt-6">
                <p className="carrd-font-body text-sm font-medium mb-1.5">A few things to note before booking:</p>
                <ul className="carrd-font-body text-base space-y-1 list-none pl-0 leading-tight">
                  {BOOKING_NOTES.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-[#D9D0BF] w-1.5 h-1.5 rounded-full bg-[#D9D0BF] shrink-0 flex-shrink-0" aria-hidden />
                      <span className="flex-1 text-[#D9D0BF]/95">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {selectedDate && hasSelection && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!selectedDate || !hasSelection || !formData.name.trim() || !formData.email.trim()) return
                    setIsSubmitting(true)
                    setCheckoutError(null)
                    try {
                      const items = Object.entries(selections)
                        .filter(([, q]) => q > 0)
                        .map(([tierId, qty]) => ({
                          tierId,
                          quantity: qty,
                          ...(tierId === 'supported' && { supportedPrice }),
                        }))
                      const res = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          dateId: selectedDate,
                          items,
                          supportedPrice: (selections['supported'] ?? 0) > 0 ? supportedPrice : undefined,
                          name: formData.name.trim(),
                          email: formData.email.trim(),
                          notes: formData.notes.trim(),
                          device: deviceType,
                        }),
                      })
                      const data = await res.json()
                      if (!res.ok) {
                        setCheckoutError(data.error ?? 'Something went wrong')
                        return
                      }
                      if (data.url) window.location.href = data.url
                      else setCheckoutError('No checkout URL received')
                    } catch {
                      setCheckoutError('Network error. Please try again.')
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                    className="carrd-btn px-10 py-3 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                >
                  {isSubmitting ? 'Redirecting…' : 'Finish Booking'}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
      <SiteFooter variant="main" className="hidden md:flex" />
    </div>
  )
}
