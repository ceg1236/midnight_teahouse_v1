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
  const [supportedPriceInput, setSupportedPriceInput] = useState('')
  const [showSupportedTier, setShowSupportedTier] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' })
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [expandedBlurbId, setExpandedBlurbId] = useState<string | null>(null)
  const [expandedTierBlurbId, setExpandedTierBlurbId] = useState<string | null>(null)
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
      <div className="w-full max-w-[60rem] flex flex-col items-center px-6 md:px-12 py-8 md:py-12 gap-8">
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
        <div className="flex justify-center py-6">
          <CountdownTimer targetTimestamp={countdownTarget} length={3} />
        </div>

        {/* March Gatherings */}
        <section className="w-full flex flex-col items-center gap-8 text-center">
          <h2 className="carrd-font-heading text-2xl md:text-3xl">
            Crossing into Spring
          </h2>
          <div className="carrd-font-body text-left space-y-4 w-full max-w-[56rem]">
            {welcomeContent.split(/\n\n+/).map((para, i) => (
              <p key={i}>
                {para}
              </p>
            ))}
          </div>
          <div className="w-full max-w-[56rem] flex flex-col md:flex-row items-center md:items-start justify-center gap-10 md:gap-16 text-center pt-2">
            <div className="space-y-2">
              <p className="carrd-font-label">
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
              <p className="carrd-font-label">
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

        <hr className="carrd-divider-solid border-0 my-4" />

        <div className="w-full relative">
          {reservationStep > 1 && (
            <button
              type="button"
              onClick={() => setReservationStep((s) => (s - 1) as 1 | 2 | 3)}
              className="absolute top-0 left-0 z-10 carrd-font-body text-sm text-[#D9D0BF] hover:text-[#FAEBD4] underline focus:outline-none cursor-pointer"
            >
              ← Back
            </button>
          )}
          <div className="flex flex-col items-center gap-1">
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
            <h2 className="carrd-font-heading carrd-font-heading-sm text-center">
              Reservation
            </h2>
          </div>
        </div>

        {/* Reservation: three sliding panels (evening → ticket → form) */}
        <section
          ref={joinRef}
          className="w-full overflow-x-hidden mt-1"
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: '300%',
              transform: `translateX(-${(reservationStep - 1) * (100 / 3)}%)`,
            }}
          >
            {/* Panel 1: Choose your evening */}
            <div className="flex-shrink-0 w-1/3 flex flex-col items-center gap-6 px-3">
              <h2 className="carrd-font-heading carrd-font-h2">
                1. Choose Your Evening
              </h2>
              <p className="carrd-font-intro text-left w-full max-w-[56rem]">
                To keep our gatherings intimate, we are open by reservation and have limited seats. Reserve a seat to gift a cozy evening to yourself or someone you love.
              </p>
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
                    <div className="carrd-font-body flex-1 min-w-0 space-y-1 text-[#FAEBD4] mr-4 sm:mr-6">
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
                              {d.spotifyUrl ? (
                                <a
                                  href={d.spotifyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-2 inline-block italic text-[#D9D0BF] hover:text-[#FAEBD4] focus:outline-none focus:underline"
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
            <div ref={tierRef} className="flex-shrink-0 w-1/3 flex flex-col items-center gap-6 px-3">
              <h2 className="carrd-font-heading carrd-font-h2">
                2. Choose Your Ticket
              </h2>
              <div className="w-full max-w-[56rem] space-y-4">
                {showSupportedTier && tiers.filter((t) => t.id === 'supported').map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 py-3 border-b border-[#D9D0BF]/30"
                  >
                    <div className="carrd-font-body flex-shrink-0 min-w-[10rem]">
                      <p className="font-medium text-[#FAEBD4]">Supported</p>
                      <p className="text-[#D9D0BF] text-sm">$20+</p>
                    </div>
                    <div className="carrd-font-body flex-1 min-w-0 space-y-1 text-[#FAEBD4] mr-4 sm:mr-6">
                      <p className="font-medium italic leading-tight">{t.blurb}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2 flex-shrink-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="carrd-font-body text-lg text-[#FAEBD4]">$</span>
                          <input
                            type="number"
                            min={20}
                            max={40}
                            value={supportedPriceInput}
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
                            className="w-20 text-center rounded-md border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-2 py-1 text-[#FAEBD4] text-lg focus:border-[#FAE0B9] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        {hasValidSupportedPrice && (
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
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {tiers
                  .filter((t) => t.id === 'community' || t.id === 'patron')
                  .map((t) => {
                    const qty = selections[t.id] ?? 0
                    return (
                      <div
                        key={t.id}
                        className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 py-3 border-b border-[#D9D0BF]/30 last:border-b-0"
                      >
                        <div className="carrd-font-body flex-shrink-0 min-w-[10rem]">
                          <p className="font-medium text-[#FAEBD4]">{t.label}</p>
                          <p className="text-[#D9D0BF] text-sm">${t.price}</p>
                        </div>
                        <div className="carrd-font-body flex-1 min-w-0 space-y-1 text-[#FAEBD4] mr-4 sm:mr-6">
                          <p className="font-medium italic">{t.mainLine}</p>
                          <div className="text-[#D9D0BF] text-sm">
                            {expandedTierBlurbId === t.id ? (
                              <>
                                <p className="leading-relaxed">{t.blurb}</p>
                                <button
                                  type="button"
                                  onClick={() => setExpandedTierBlurbId(null)}
                                  className="mt-1 block italic text-[#D9D0BF] hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer"
                                >
                                  ...less
                                </button>
                              </>
                            ) : (
                              <p className="leading-relaxed flex items-baseline gap-1 min-w-0">
                                <span className="truncate min-w-0">{t.blurb}</span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedTierBlurbId(t.id)}
                                  className="italic flex-shrink-0 text-[#D9D0BF] hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer"
                                >
                                  ...more
                                </button>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-start gap-2 flex-shrink-0">
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
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleTierClick(t.id)}
                              className="carrd-btn px-6 py-3 self-start"
                            >
                              Select
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
              <p className="carrd-font-intro text-left w-full max-w-[56rem]">
                Our community spans a wide range of financial situations. Our tiered pricing helps us balance the financial sustainability and accessibility of the teahouse. We invite you to choose the level that feels right for you — one that honors your own capacity, while helping us keep this space open, welcoming and alive.
              </p>
              <p className="carrd-font-intro text-left w-full max-w-[56rem]">
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
              <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-[56rem]">
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
            <div ref={formRef} className="flex-shrink-0 w-1/3 flex flex-col items-center gap-6 px-3">
              <h2 className="carrd-font-heading carrd-font-h2">
                3. Complete Your Reservation
              </h2>
              {selectedDate && hasSelection ? (
                <>
                  {/* Summary box: date/time + choices, directly under heading */}
                  <div className="carrd-font-body rounded-lg bg-[#FAEBD4]/20 px-4 py-3 text-center w-full max-w-[28rem]">
                    <p className="text-base text-[#FAEBD4]">{selectedDateDisplay}</p>
                    <div className="mt-2 space-y-1">
                      {Object.entries(selections)
                        .filter(([, q]) => q > 0)
                        .map(([tierId, qty]) => {
                          const tier = tiers.find((t) => t.id === tierId)
                          const price = tierId === 'supported' ? supportedPrice : (tier?.price ?? 0)
                          return (
                            <p key={tierId} className="text-base text-[#FAEBD4]">
                              {tier?.label} (${price}) x {qty} = ${price * qty}
                            </p>
                          )
                        })}
                    </div>
                    <p className="mt-2 text-base font-medium text-[#FAEBD4]">Total: ${totalPrice}</p>
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
              <div className="w-full max-w-md text-left mt-6">
                <p className="carrd-font-body text-sm font-medium mb-1.5">A few things to note before booking:</p>
                <ul className="carrd-font-body text-[0.74375rem] space-y-1 list-none pl-0 leading-tight">
                  {BOOKING_NOTES.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#D9D0BF] mt-[0.3em] w-1.5 h-1.5 rounded-full bg-[#D9D0BF] shrink-0 flex-shrink-0" aria-hidden />
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
      <SiteFooter variant="main" />
    </div>
  )
}
