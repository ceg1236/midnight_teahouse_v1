'use client'

import { useEffect, useRef, useState } from 'react'
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

const BOOKING_NOTES = [
  'Doors open at 7pm and close at 11pm. Feel free to join us anytime in this window.',
  'Reservation includes unlimited tea and all other amenities.',
  'We are a phone and laptop-free space.',
  "Unfortunately, we aren't able to offer refunds or exchanges for future events.",
  "We'll share the location once you make the reservation. If you don't hear from us within a few days, please send us an email.",
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
  const [supportedPriceInput, setSupportedPriceInput] = useState('20')
  const [showSupportedTier, setShowSupportedTier] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' })
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [expandedBlurbId, setExpandedBlurbId] = useState<string | null>(null)
  /** 1 = Choose evening, 2 = Choose ticket, 3 = Complete reservation */
  const [reservationStep, setReservationStep] = useState<1 | 2 | 3>(1)

  const joinRef = useRef<HTMLElement>(null)
  const tierRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const persisted = loadPersisted(dates, tiers)
    setSelectedDate(persisted.date)
    setSelections(persisted.selections)
    setFormData(persisted.form)
    if (Object.keys(persisted.selections).some((id) => id === 'supported')) setShowSupportedTier(true)
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

  const hasSelection = Object.values(selections).some((q) => q > 0)
  const totalQuantity = Object.values(selections).reduce((s, q) => s + q, 0)
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
      const othersTotal = Object.entries(prev).reduce((s, [id, n]) => (id === tierId ? s : s + n), 0)
      if (q > 0) {
        const next = { ...prev }
        delete next[tierId]
        return next
      }
      if (othersTotal >= 4) return prev
      return { ...prev, [tierId]: 1 }
    })
  }

  const handleQuantityChange = (tierId: string, delta: number) => {
    setSelections((prev) => {
      const q = prev[tierId] ?? 0
      const othersTotal = Object.entries(prev).reduce((s, [id, n]) => (id === tierId ? s : s + n), 0)
      if (delta === -1 && q <= 1) {
        const next = { ...prev }
        delete next[tierId]
        return next
      }
      if (delta === 1 && othersTotal + q >= 4) return prev
      return { ...prev, [tierId]: q + delta }
    })
  }

  return (
    <div className="carrd-page flex flex-col items-center min-h-screen overflow-x-hidden pt-8">
      <div className="w-full max-w-[60rem] flex flex-col items-center px-6 md:px-12 py-8 md:py-12 gap-6">
        {/* Hero: Title + Subtitle */}
        <h1 className="carrd-font-heading carrd-font-title text-center">
          Midnight Teahouse
        </h1>
        <p className="carrd-font-subtitle text-center italic">
          welcome to our evening world
        </p>

        {/* Video */}
        <div className="carrd-video-fade w-full -mx-6 md:-mx-12 aspect-video overflow-hidden">
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

        {/* Countdown */}
        <div className="flex justify-center py-2">
          <CountdownTimer targetTimestamp={countdownTarget} length={3} />
        </div>

        {/* March Gatherings */}
        <section className="w-full flex flex-col items-center gap-6 text-center">
          <h2 className="carrd-font-heading text-2xl md:text-3xl">
            Crossing into Spring
          </h2>
          <div className="carrd-font-body text-left space-y-4 w-full max-w-[56rem]">
            {welcomeContent.split(/\n\n+/).map((para, i) => (
              <p key={i} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>
          <div className="w-full max-w-[56rem] flex flex-col md:flex-row items-center md:items-start justify-center gap-10 md:gap-16 text-center pt-2">
            <div className="space-y-2">
              <p className="carrd-font-muted text-xs tracking-[0.2em] uppercase">
                Date
              </p>
              <div className="space-y-1">
                <p className="carrd-font-body">
                  March 18-20, 2026
                </p>
                <p className="carrd-font-body">
                  7-11pm
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="carrd-font-muted text-xs tracking-[0.2em] uppercase">
                Location
              </p>
              <div className="space-y-1">
                <p className="carrd-font-body">
                  SoMA, SF
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => scrollToSection(joinRef)}
            className="carrd-btn px-8 py-3"
          >
            Reserve Your Seat
          </button>
        </section>

        <hr className="carrd-divider-solid border-0 my-2" />

        <h2 className="carrd-font-heading text-2xl md:text-3xl">
          Reserve Your Seat
        </h2>

        {/* Reservation: three sliding panels (evening → ticket → form) */}
        <section
          ref={joinRef}
          className="w-full overflow-x-hidden"
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              width: '300%',
              transform: `translateX(-${(reservationStep - 1) * (100 / 3)}%)`,
            }}
          >
            {/* Panel 1: Choose your evening */}
            <div className="flex-shrink-0 w-1/3 flex flex-col items-center gap-6 px-1">
              <p className="carrd-font-body text-left w-full max-w-[56rem] leading-relaxed">
                To keep our gatherings intimate, we are open by reservation and have limited seats. Reserve a seat to gift a cozy evening to yourself or someone you love.
              </p>
              <h2 className="carrd-font-heading carrd-font-h2">
                1. Choose Your Evening
              </h2>
              <div className="w-full max-w-[56rem] space-y-4">
                {dates.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 py-3 border-b border-[#D9D0BF]/30 last:border-b-0"
                  >
                    <div className="carrd-font-body flex-shrink-0 min-w-[10rem]">
                      <p className="font-medium text-[#FAEBD4]">{d.day}</p>
                      <p className="text-[#D9D0BF] text-sm">{d.dateTime}</p>
                    </div>
                    <div className="carrd-font-body flex-1 min-w-0 space-y-1 text-[#FAEBD4]">
                      {d.musicians.map((line, i) => (
                        <p key={i} className="font-medium italic">
                          {line}
                        </p>
                      ))}
                      {d.blurb ? (
                        <div className="text-[#D9D0BF] text-sm">
                          {expandedBlurbId === d.id ? (
                            <>
                              <p className="leading-relaxed">{d.blurb}</p>
                              <button
                                type="button"
                                onClick={() => setExpandedBlurbId(null)}
                                className="mt-1 italic text-[#D9D0BF] hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer"
                              >
                                ...less
                              </button>
                            </>
                          ) : (
                            <p className="leading-relaxed flex items-baseline gap-1 min-w-0">
                              <span className="truncate min-w-0">{d.blurb}</span>
                              <button
                                type="button"
                                onClick={() => setExpandedBlurbId(d.id)}
                                className="italic flex-shrink-0 text-[#D9D0BF] hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer"
                              >
                                ...more
                              </button>
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.id)
                        setReservationStep(2)
                      }}
                      className={`carrd-btn px-6 py-3 flex-shrink-0 self-start ${
                        selectedDate === d.id ? 'bg-[#FAE0B9]/20' : ''
                      }`}
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Choose your ticket */}
            <div ref={tierRef} className="flex-shrink-0 w-1/3 flex flex-col items-center gap-6 px-1">
              <h2 className="carrd-font-heading carrd-font-h2">
                2. Choose Your Ticket
              </h2>
              <div className="w-full max-w-[56rem] flex flex-wrap justify-evenly gap-6">
                {tiers
                  .filter((t) => t.id === 'community' || t.id === 'patron')
                  .map((t) => {
                    const qty = selections[t.id] ?? 0
                    return (
                      <div key={t.id} className="flex flex-col items-center gap-2 min-h-[6.5rem]">
                        <button
                          type="button"
                          onClick={() => handleTierClick(t.id)}
                          className={`carrd-btn px-8 py-4 whitespace-normal min-w-[10rem] flex-1 max-w-[14rem] shrink-0 max-h-[3.5rem] ${
                            qty > 0 ? 'bg-[#FAE0B9]/20' : ''
                          }`}
                        >
                          {t.label} ${t.price}
                        </button>
                        {qty > 0 ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(t.id, -1)}
                              className="carrd-btn w-9 h-9 flex items-center justify-center p-0 text-lg leading-none"
                              aria-label={`Decrease ${t.label} quantity`}
                            >
                              −
                            </button>
                            <span className="carrd-font-body w-8 text-center tabular-nums">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(t.id, 1)}
                              className="carrd-btn w-9 h-9 flex items-center justify-center p-0 text-lg leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={totalQuantity >= 4}
                              aria-label={`Increase ${t.label} quantity`}
                            >
                              +
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
              </div>
              <p className="carrd-font-body text-left w-full max-w-[56rem] leading-relaxed">
                Like the Bay Area as a whole, our community includes people in wildly different financial situations. Using tiered pricing helps us balance two essential but divergent goals: ensuring that the teahouse is both <em>financially sustainable</em> and <em>accessible</em>. We invite you to choose the level that feels right for you — one that honors your own capacity while helping us keep this space open, welcoming, and alive.
              </p>
              <p className="carrd-font-body text-left w-full max-w-[56rem] leading-relaxed">
                If cost is a barrier please consider our{' '}
                <button
                  type="button"
                  onClick={() => setShowSupportedTier(true)}
                  className="underline hover:no-underline cursor-pointer text-[#FAE0B9] focus:outline-none focus:underline"
                >
                  supported ticket option
                </button>
                .
              </p>
              <div
                className={`grid transition-all duration-500 ease-out overflow-hidden w-full max-w-[56rem] ${
                  showSupportedTier ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="min-h-0 flex flex-col items-center gap-2">
                  {tiers
                    .filter((t) => t.id === 'supported')
                    .map((t) => (
                      <div key={t.id} className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTierClick(t.id)}
                          className={`carrd-btn px-8 py-4 whitespace-normal min-w-[10rem] shrink-0 max-h-[3.5rem] ${
                            (selections['supported'] ?? 0) > 0 ? 'bg-[#FAE0B9]/20' : ''
                          }`}
                        >
                          {t.label}
                        </button>
                        {(selections['supported'] ?? 0) > 0 && (
                          <>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange('supported', -1)}
                                className="carrd-btn w-9 h-9 flex items-center justify-center p-0 text-lg leading-none"
                                aria-label="Decrease Supported quantity"
                              >
                                −
                              </button>
                              <span className="carrd-font-body w-8 text-center tabular-nums">{selections['supported'] ?? 0}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange('supported', 1)}
                                className="carrd-btn w-9 h-9 flex items-center justify-center p-0 text-lg leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={totalQuantity >= 4}
                                aria-label="Increase Supported quantity"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex flex-col items-center gap-1 w-full max-w-[40rem]">
                              <p className="carrd-font-body text-xs text-center opacity-90 w-full px-2">
                                Sliding scale: choose an amount between $20 and $39 that works for you.
                              </p>
                              <div className="flex items-center justify-center gap-1">
                                <span className="carrd-font-body text-lg text-[#FAEBD4]">$</span>
                                <input
                                  type="number"
                                  min={20}
                                  max={39}
                                  value={supportedPriceInput}
                                  onChange={(e) => {
                                    const raw = e.target.value
                                    setSupportedPriceInput(raw)
                                    const v = parseInt(raw, 10)
                                    if (!isNaN(v) && v >= 20 && v <= 39) setSupportedPrice(v)
                                  }}
                                  onBlur={() => {
                                    const v = parseInt(supportedPriceInput, 10)
                                    if (!isNaN(v) && v >= 20 && v <= 39) {
                                      setSupportedPrice(v)
                                      setSupportedPriceInput(String(v))
                                    } else {
                                      setSupportedPriceInput(String(supportedPrice))
                                    }
                                  }}
                                  className="w-20 text-center rounded-md border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-2 py-1 text-[#FAEBD4] text-lg focus:border-[#FAE0B9] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-[56rem]">
                <button
                  type="button"
                  onClick={() => setReservationStep(1)}
                  className="carrd-font-body text-[#D9D0BF] hover:text-[#FAEBD4] underline focus:outline-none cursor-pointer"
                >
                  ← Change evening
                </button>
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
            <div ref={formRef} className="flex-shrink-0 w-1/3 flex flex-col items-center gap-6 px-1">
              <h2 className="carrd-font-heading carrd-font-h2">
                3. Complete Your Reservation
              </h2>
              {selectedDate && hasSelection ? (
                <>
                  {/* Summary box: date/time + choices, directly under heading */}
                  <div className="carrd-font-body rounded-lg bg-[#FAEBD4]/15 px-4 py-3 text-center w-full max-w-[28rem]">
                    <p className="text-sm italic text-[#FAEBD4]">{selectedDateDisplay}</p>
                    <div className="mt-1.5 space-y-0.5">
                      {Object.entries(selections)
                        .filter(([, q]) => q > 0)
                        .map(([tierId, qty]) => {
                          const tier = tiers.find((t) => t.id === tierId)
                          const price = tierId === 'supported' ? supportedPrice : (tier?.price ?? 0)
                          return (
                            <p key={tierId} className="text-sm italic text-[#FAEBD4]">
                              {tier?.label} (${price}) x {qty} = ${price * qty}
                            </p>
                          )
                        })}
                    </div>
                    <p className="mt-1.5 text-sm italic text-[#FAEBD4]">Total: ${totalPrice}</p>
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
              <form
                id="carrd-form"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
                className="w-full max-w-md flex flex-col gap-4 carrd-font-body"
              >
                <input type="hidden" name="device_type" value={deviceType} />
                <input type="hidden" name="date" value={selectedDate ?? ''} />
                <label className="flex flex-col gap-1">
                  Name *
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none"
                    placeholder="Your name"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Email *
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none"
                    placeholder="you@example.com"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  Notes
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value }))}
                    rows={2}
                    className="mt-1 w-full resize-none rounded-md border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none"
                    placeholder="Anything else we should know?"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setReservationStep(2)}
                    className="carrd-font-body text-[#D9D0BF] hover:text-[#FAEBD4] underline focus:outline-none cursor-pointer"
                  >
                    ← Change ticket
                  </button>
                </div>
              </form>
              {selectedDate && hasSelection && checkoutError && (
                <p className="carrd-font-body text-sm text-red-300" role="alert">
                  {checkoutError}
                </p>
              )}
              <div className="w-full max-w-[56rem] text-left mt-6">
                <p className="carrd-font-body font-medium mb-2">A few things to note before booking:</p>
                <ul className="carrd-font-body space-y-3 list-none pl-0">
                  {BOOKING_NOTES.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-[#D9D0BF] mt-[0.45em] w-2 h-2 rounded-full bg-[#D9D0BF] shrink-0 flex-shrink-0" aria-hidden />
                      <span className="flex-1">{item}</span>
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
                  className="carrd-btn px-10 py-3 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                >
                  {isSubmitting ? 'Redirecting…' : 'Confirm'}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
      <SiteFooter variant="main" />
    </div>
  )
}
