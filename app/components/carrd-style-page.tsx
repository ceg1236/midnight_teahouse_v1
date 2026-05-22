'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CountdownTimer } from './countdown-timer'
import type { EventDate, EventTicketFormat, EventTier } from '../../content/event-schema'
import { decodeTokenPayload } from '../../lib/admin-token-decode'
import { resolveDoorDate } from '../../lib/door-date'
import { getSupportedPriceBounds, isSupportedPriceInRange } from '../../lib/supported-tier-price'
import { getTiersForTicketFormat } from '../../lib/event-tiers'
import { getFormatCapacityState, getMaxSelectableForExperience } from '../../lib/ticket-pool'
import { getTurbyBookingNotes } from '../../lib/event-messaging'
import { HeroVideo } from './hero-video'
import { EventPageTopLinks } from './event-page-top-links'
import { SiteFooter } from './site-footer'

const STORAGE_KEY = 'teahouse_reservation'
const EVENT_HERO_VIDEO_SOURCES = [
  { src: '/images/fire_tea_pouring.mp4', type: 'video/mp4' },
  { src: '/images/fire_tea_pouring.mov', type: 'video/quicktime' },
]

/** First frame of `fire_tea_pouring.mp4` — regenerate with `pnpm posters:extract`. */
const EVENT_HERO_POSTER = '/images/fire_tea_pouring_poster.jpg'

function EventHero({
  className,
  heroImage,
}: {
  className?: string
  heroImage?: string
}) {
  if (heroImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={heroImage} alt="" className={className} />
    )
  }
  return (
    <HeroVideo
      className={className}
      poster={EVENT_HERO_POSTER}
      sources={EVENT_HERO_VIDEO_SOURCES}
    />
  )
}

type CarrdStylePageProps = {
  eventSlug: string
  eventTitle: string
  welcomeContent: string
  dates: readonly EventDate[]
  tiers: readonly EventTier[]
  /** Unix  for countdown (first event at 7pm) */
  countdownTarget: number
  showCountdown?: boolean
  dateRangeLabel: string
  timeLabel: string
  locationLabel: string
  /** dateId -> soldOut; used to disable and style sold-out dates */
  soldOutByDateId?: Record<string, boolean>
  /** dateId -> remaining seats; used for low-inventory messaging */
  remainingByDateId?: Record<string, number>
  /** dateId -> ticketType -> pool availability (e.g. tasting cap) */
  ticketPoolByDateId?: Record<string, Record<string, { remaining: number; soldOut: boolean }>>
  /** Admin/door token – bypasses sold-out, pre-fills date/tier */
  initialTicket?: string
  hostSectionTitle?: string
  hostSectionDescription?: string
  /** Static hero image instead of looping video (e.g. daytime events). */
  heroImage?: string
  /** Overrides default evening booking notes at checkout. */
  bookingNotes?: readonly (string | React.ReactNode)[]
  /** First reservation step: experience type before tier selection. */
  ticketFormats?: readonly EventTicketFormat[]
  /** When true, sheet availability is still loading (Reserve stays disabled). */
  availabilityLoading?: boolean
}

const SCROLL_DURATION = 1200
const SCROLL_OFFSET_TOP = 48
const NO_MORE_TICKETS_MSG = 'No more tickets left'

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

export function CarrdStylePage({
  eventSlug,
  eventTitle,
  welcomeContent,
  dates,
  tiers,
  countdownTarget,
  showCountdown = true,
  dateRangeLabel,
  timeLabel,
  locationLabel,
  soldOutByDateId = {},
  remainingByDateId = {},
  ticketPoolByDateId = {},
  initialTicket,
  hostSectionTitle,
  hostSectionDescription,
  heroImage,
  bookingNotes = BOOKING_NOTES,
  ticketFormats,
  availabilityLoading = false,
}: CarrdStylePageProps) {
  const singleDateEvent = dates.length === 1
  const usesFormatStep = (ticketFormats?.length ?? 0) > 0
  const skipDateStep = singleDateEvent && !usesFormatStep
  const tokenPayload = initialTicket ? decodeTokenPayload(initialTicket) : null
  const bypassSoldOut = !!tokenPayload
  const effectiveSoldOut = bypassSoldOut ? {} : soldOutByDateId
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTicketFormat, setSelectedTicketFormat] = useState<string | null>(null)
  const activeTiers = useMemo(
    () => getTiersForTicketFormat(tiers, ticketFormats, selectedTicketFormat ?? undefined),
    [tiers, ticketFormats, selectedTicketFormat]
  )
  const hasSupportedTier = activeTiers.some((t) => t.id === 'supported')
  const supportedTier = activeTiers.find((t) => t.id === 'supported')
  const supportedTierLabel = supportedTier?.label ?? 'Supported'
  const primaryTiers = activeTiers.filter((t) => t.id !== 'supported')
  const { supportedMin, supportedMax } = useMemo(() => getSupportedPriceBounds(activeTiers), [activeTiers])
  const supportedPriceRangeLabel = `${supportedMin}–${supportedMax}`
  const supportedPriceSuffix = useMemo(() => {
    const mainLine = activeTiers.find((t) => t.id === 'supported')?.mainLine
    return mainLine ? mainLine.replace(/^Supported\s*/i, ', ') : `, $${supportedMin}+`
  }, [activeTiers, supportedMin])
  const [selections, setSelections] = useState<TierSelections>({})
  const [supportedPrice, setSupportedPrice] = useState(supportedMin)
  const [supportedPriceInput, setSupportedPriceInput] = useState('')
  const [showSupportedTier, setShowSupportedTier] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' })
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [ticketLimitError, setTicketLimitError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [expandedPricingNote, setExpandedPricingNote] = useState(false)
  /** On mobile: true when Reserve Your Seat clicked (whole screen slides to reservation) */
  const [showReservationView, setShowReservationView] = useState(false)
  /** 1 = Choose evening, 2 = Choose ticket, 3 = Complete reservation */
  const [reservationStep, setReservationStep] = useState<1 | 2 | 3>(1)

  const joinRef = useRef<HTMLElement>(null)
  const tierRef = useRef<HTMLDivElement>(null)
  const mobileReservationPanelRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const mobileFormRef = useRef<HTMLDivElement>(null)
  const reservationHeaderRef = useRef<HTMLHeadingElement>(null)
  const mobileReservationHeaderRef = useRef<HTMLHeadingElement>(null)
  const reservationInitializedRef = useRef(false)

  const checkoutBookingNotes = useMemo(() => {
    if (eventSlug === 'turby-event') {
      return getTurbyBookingNotes(selectedTicketFormat ?? undefined)
    }
    return bookingNotes
  }, [eventSlug, selectedTicketFormat, bookingNotes])

  useEffect(() => {
    const persisted = loadPersisted(dates, tiers)
    let date = persisted.date
    let selections = persisted.selections

    const payload = initialTicket ? decodeTokenPayload(initialTicket) : null
    if (payload) {
      if (payload.door) {
        const today = new Date().toISOString().slice(0, 10)
        date = resolveDoorDate(today, dates)
        selections = { community: 1 }
      } else if (payload.open) {
        date = null
        selections = {}
      } else if (payload.dateId && dates.some((d) => d.id === payload.dateId)) {
        date = payload.dateId
        if (payload.tierId && tiers.some((t) => t.id === payload.tierId)) {
          selections = { [payload.tierId]: 1 }
        } else {
          selections = {}
        }
      }
    }

    setSelectedDate(date)
    setSelections(selections)
    setFormData(persisted.form)
    if (Object.keys(selections).some((id) => id === 'supported')) {
      setShowSupportedTier(true)
      const supportedTier = tiers.find((t) => t.id === 'supported')
      setSupportedPriceInput(String(supportedTier?.price ?? 20))
    }
    setHydrated(true)

    if (reservationInitializedRef.current) return
    reservationInitializedRef.current = true

    if (payload) {
      setShowReservationView(true)
      const hasSelection = Object.values(selections).some((q) => q > 0)
      if (date && hasSelection) setReservationStep(3)
      else if (date) setReservationStep(2)
      else setReservationStep(1)
    } else if (date || singleDateEvent) {
      if (singleDateEvent && !date && dates[0]) {
        setSelectedDate(dates[0].id)
      }
      setReservationStep(usesFormatStep ? 1 : 2)
    }
  }, [dates, tiers, initialTicket, singleDateEvent, usesFormatStep])

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
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
      })
    }
  }, [showReservationView])

  useEffect(() => {
    if (!initialTicket || !hydrated) return
    const t = setTimeout(() => {
      if (typeof window !== 'undefined' && window.innerWidth >= 768) {
        joinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
    return () => clearTimeout(t)
  }, [initialTicket, hydrated])

  useEffect(() => {
    if (reservationStep === 3) {
      const t = setTimeout(() => {
        const el =
          typeof window !== 'undefined' && window.innerWidth < 768
            ? mobileReservationHeaderRef.current
            : reservationHeaderRef.current
        if (el) {
          const rect = el.getBoundingClientRect()
          const headerTop = rect.top + window.scrollY
          const offset = 0.1 * window.innerHeight
          const targetY = Math.max(0, headerTop - offset)
          window.scrollTo({ top: targetY, behavior: 'smooth' })
        }
      }, 100)
      return () => clearTimeout(t)
    }
  }, [reservationStep])

  const hasSelection = Object.values(selections).some((q) => q > 0)
  const totalQuantity = Object.values(selections).reduce((s, q) => s + q, 0)
  /** Single-date events always use that date for capacity, even before date step runs. */
  const capacityDateId =
    selectedDate ?? (singleDateEvent && dates[0] ? dates[0].id : null)
  const selectedFormatData = ticketFormats?.find((f) => f.id === selectedTicketFormat)
  const selectedFormatCapacity = selectedFormatData
    ? getFormatCapacityState(
        selectedFormatData,
        capacityDateId,
        remainingByDateId,
        ticketPoolByDateId
      )
    : undefined
  const maxSelectableTickets = getMaxSelectableForExperience(
    selectedFormatData,
    capacityDateId,
    remainingByDateId,
    ticketPoolByDateId,
    bypassSoldOut
  )
  const canAddTickets = bypassSoldOut || maxSelectableTickets > 0
  const getFormatAvailability = (format: EventTicketFormat) =>
    getFormatCapacityState(format, capacityDateId, remainingByDateId, ticketPoolByDateId)
  const isFormatSoldOut = (format: EventTicketFormat) => {
    if (bypassSoldOut) return false
    return getFormatAvailability(format).soldOut
  }
  useEffect(() => {
    if (!ticketLimitError) return
    if (totalQuantity < maxSelectableTickets) {
      setTicketLimitError(null)
    }
  }, [ticketLimitError, totalQuantity, maxSelectableTickets])
  const hasValidSupportedPrice = (() => {
    const v = parseInt(supportedPriceInput, 10)
    return !isNaN(v) && isSupportedPriceInRange(activeTiers, v)
  })()
  const totalPrice = Object.entries(selections).reduce((sum, [tierId, qty]) => {
    if (qty <= 0) return sum
    const tier = activeTiers.find((t) => t.id === tierId)
    const price = tierId === 'supported' ? supportedPrice : (tier?.price ?? 0)
    return sum + price * qty
  }, 0)
  const selectionSummaryLines = Object.entries(selections)
    .filter(([, qty]) => qty > 0)
    .map(([tierId, qty]) => {
      const tier = activeTiers.find((t) => t.id === tierId)
      const price = tierId === 'supported' ? supportedPrice : (tier?.price ?? 0)
      const label = tier?.label ?? tierId
      return { tierId, qty, price, label }
    })
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
        setTicketLimitError(null)
        return next
      }
      if (maxSelectableTickets <= 0) {
        setTicketLimitError(NO_MORE_TICKETS_MSG)
        return prev
      }
      setTicketLimitError(null)
      return { [tierId]: 1 }
    })
  }

  const handleQuantityChange = (tierId: string, delta: number) => {
    setSelections((prev) => {
      const q = prev[tierId] ?? 0
      const prevTotal = Object.values(prev).reduce((s, n) => s + n, 0)
      if (delta === -1 && q <= 1) {
        const next = { ...prev }
        delete next[tierId]
        setTicketLimitError(null)
        return next
      }
      if (delta === 1 && prevTotal >= maxSelectableTickets) {
        setTicketLimitError(NO_MORE_TICKETS_MSG)
        return prev
      }
      if (delta === 1 && q >= 4) return prev
      setTicketLimitError(null)
      return { [tierId]: q + delta }
    })
  }

  const welcomeAndHostSection = (
    <div className="carrd-font-body w-full max-w-[650px] space-y-4">
      <div className="text-left space-y-4">
        {welcomeContent.split(/\n\n+/).map((para, i) => (
          <p key={i} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
      {hostSectionTitle && hostSectionDescription ? (
        <div className="text-center space-y-4">
          <h3 className="carrd-font-heading carrd-font-h2 italic">{hostSectionTitle}</h3>
          <p>{hostSectionDescription}</p>
        </div>
      ) : null}
    </div>
  )
  const sharedMusicBlurb = dates.flatMap((d) => d.musicians).find((line) => line?.trim()) ?? ''
  const reservationSteps = skipDateStep ? ([2, 3] as const) : ([1, 2, 3] as const)
  const panelCount = reservationSteps.length
  const slideOffset = skipDateStep ? reservationStep - 2 : reservationStep - 1
  const panelFlexWidth = `${panelCount * 100}%`
  const slideTransform = `translateX(-${Math.max(0, slideOffset) * (100 / panelCount)}%)`
  const panelWidthClass = panelCount === 2 ? 'w-1/2' : 'w-1/3'
  const formatStepLabel = '1. Choose Your Experience'
  const ticketStepLabel = usesFormatStep
    ? '2. Choose Your Ticket'
    : skipDateStep
      ? '1. Choose Your Ticket'
      : '2. Choose Your Ticket'
  const formStepLabel = usesFormatStep
    ? '3. Complete Your Reservation'
    : skipDateStep
      ? '2. Complete Your Reservation'
      : '3. Complete Your Reservation'
  const readyToCheckout =
    hasSelection && selectedDate && (!usesFormatStep || selectedTicketFormat)

  const selectSupportedTier = () => {
    if (!canAddTickets) {
      setTicketLimitError(NO_MORE_TICKETS_MSG)
      return
    }
    setTicketLimitError(null)
    setShowSupportedTier(true)
    setSupportedPrice(supportedMin)
    setSupportedPriceInput(String(supportedMin))
    setSelections((prev) => ({ ...prev, supported: 1 }))
  }

  const selectTicketFormat = (formatId: string) => {
    const format = ticketFormats?.find((f) => f.id === formatId)
    if (format && isFormatSoldOut(format)) return
    if (singleDateEvent && dates[0]) {
      setSelectedDate(dates[0].id)
    }
    setSelectedTicketFormat(formatId)
    setSelections({})
    setShowSupportedTier(false)
    setSupportedPriceInput('')
    setTicketLimitError(null)
    setReservationStep(2)
  }

  const beginReservation = () => {
    if (singleDateEvent && dates[0]) {
      setSelectedDate(dates[0].id)
    }
    if (usesFormatStep) {
      setSelectedTicketFormat(null)
      setSelections({})
      setShowSupportedTier(false)
      setReservationStep(1)
    } else if (singleDateEvent) {
      setReservationStep(2)
    } else {
      setReservationStep(1)
    }
    setShowReservationView(true)
  }

  const handleReservationBack = () => {
    if (skipDateStep && reservationStep === 2) {
      setShowReservationView(false)
      return
    }
    if (usesFormatStep && reservationStep === 1) {
      setShowReservationView(false)
      return
    }
    if (reservationStep === 1) {
      setShowReservationView(false)
      return
    }
    setReservationStep((s) => (s - 1) as 1 | 2 | 3)
  }

  return (
    <div className={`carrd-page flex flex-col items-center min-h-screen overflow-x-hidden pt-8${eventSlug === 'turby-event' ? ' carrd-page--daytime' : ''}`}>
      <EventPageTopLinks />
      {/* Mobile: single column, viewport < 768px */}
      <div className="md:hidden w-full flex-1 min-w-0 overflow-x-hidden max-w-full">
        {!showReservationView ? (
          <div className="flex flex-col items-center px-6 py-8 gap-[1.25em] overflow-x-hidden w-full max-w-full">
            <div className="relative w-full flex flex-col items-center gap-1">
              <h1 className="carrd-font-heading carrd-font-title text-center">Midnight Teahouse</h1>
              <p className="carrd-font-subtitle text-center italic">an enchanted world hidden in San Francisco</p>
            </div>
            <div className="carrd-video-fade w-full py-6 overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <EventHero className="w-full h-full object-cover" heroImage={heroImage} />
              </div>
            </div>
            {showCountdown && (
              <div className="flex justify-center py-6" style={{ transform: 'scale(1.3)' }}>
                <CountdownTimer targetTimestamp={countdownTarget} length={3} />
              </div>
            )}
            <section className="w-full flex flex-col items-center gap-10 text-center">
              <div className="flex flex-col items-center gap-[1em] w-full">
                <h2 className="carrd-font-heading text-[0.96rem] italic" style={{ letterSpacing: '-2px' }}>{eventTitle}</h2>
                {welcomeAndHostSection}
              </div>
              <div className="w-full max-w-[650px] flex flex-col items-center justify-center gap-16 text-center pt-2">
                <div className="space-y-2">
                  <p className="carrd-font-label text-[1.3125rem]">Date</p>
                  <div className="space-y-0.5">
                    <p className="carrd-font-body">{dateRangeLabel}</p>
                    <p className="carrd-font-body">{timeLabel}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="carrd-font-label text-[1.3125rem]">Location</p>
                  <div className="space-y-0.5">
                    <p className="carrd-font-body">{locationLabel}</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={beginReservation}
                disabled={availabilityLoading}
                className="carrd-btn px-10 py-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {availabilityLoading ? 'Loading…' : 'Reserve Your Seat'}
              </button>
            </section>
            <SiteFooter variant="main" />
          </div>
        ) : (
          <div ref={mobileReservationPanelRef} className="carrd-mobile-reservation flex flex-col items-center px-4 py-4 gap-3 min-w-0 w-full max-w-full overflow-x-hidden">
            <div className="w-full flex flex-col items-center gap-1 shrink-0">
              <div className="flex justify-center gap-2" aria-hidden>
                {reservationSteps.map((step) => (
                  <span key={step} className={`w-2 h-2 rounded-full transition-colors duration-300 ${reservationStep === step ? 'bg-[#FAE0B9]' : 'bg-[#D9D0BF]/40'}`} />
                ))}
              </div>
              <div className="flex items-start justify-between w-full">
                <div className="flex-1 flex justify-start min-w-0">
                  <button
                    type="button"
                    onClick={handleReservationBack}
                    className="carrd-font-body text-lg text-[#D9D0BF] hover:text-[#FAEBD4] underline focus:outline-none cursor-pointer"
                  >
                    ← Back
                  </button>
                </div>
                <h2 ref={mobileReservationHeaderRef} className="carrd-font-heading carrd-font-heading-sm flex-1 text-center italic">Reservation</h2>
                <div className="flex-1 min-w-0" aria-hidden />
              </div>
            </div>
            <section className="carrd-reservation-section w-full min-w-0 overflow-x-hidden max-w-full">
              <div
                className="flex transition-transform duration-500 ease-in-out min-w-0"
                style={{
                  width: panelFlexWidth,
                  transform: slideTransform,
                }}
              >
                {/* Mobile reservation reuses same panel structure - content is in desktop flow below, we need inline copy */}
                {usesFormatStep ? (
                <div className={`carrd-font-body flex-shrink-0 ${panelWidthClass} flex flex-col items-center gap-4 px-3 min-w-0 overflow-y-auto overflow-x-hidden max-w-full`}>
                  <h2 className="carrd-font-heading carrd-font-h2 text-2xl text-center w-full">{formatStepLabel}</h2>
                  <div className="w-full max-w-full min-w-0 flex flex-col gap-3 break-words">
                    {ticketFormats?.map((f) => {
                      const formatSoldOut = isFormatSoldOut(f)
                      const formatAvailability = getFormatAvailability(f)
                      return (
                      <div
                        key={f.id}
                        className={`carrd-mobile-pill flex flex-col gap-3 text-left w-full ${formatSoldOut ? 'opacity-60' : ''}`}
                      >
                        <div className="min-w-0">
                          <p className="leading-tight text-xl">
                            <span className="text-[#C4AF86] font-medium">{f.label}</span>
                          </p>
                          <p className="text-[#D9D0BF]/90 text-lg leading-snug mt-0.5 whitespace-pre-line">{f.description}</p>
                          {!formatSoldOut && typeof formatAvailability.remaining === 'number' && formatAvailability.remaining > 0 && formatAvailability.remaining < 4 ? (
                            <p className="text-[#FAE0B9] text-base mt-1">Only {formatAvailability.remaining} seat{formatAvailability.remaining === 1 ? '' : 's'} remaining</p>
                          ) : null}
                        </div>
                        {formatSoldOut ? (
                          <span className="shrink-0 self-center text-[#D9D0BF]/70 italic">Sold Out</span>
                        ) : (
                        <button
                          type="button"
                          onClick={() => selectTicketFormat(f.id)}
                          className="carrd-mobile-pill-select shrink-0 self-center"
                        >
                          Select
                        </button>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
                ) : null}
                {!singleDateEvent ? (
                <div className={`carrd-font-body flex-shrink-0 ${panelWidthClass} flex flex-col items-center gap-4 px-3 min-w-0 overflow-y-auto overflow-x-hidden max-w-full`}>
                  <h2 className="carrd-font-heading carrd-font-h2 text-2xl text-center w-full">1. Choose Your Evening</h2>
                  {sharedMusicBlurb ? (
                    <p className="carrd-font-body text-center italic text-[#D9D0BF]/90 px-1">{sharedMusicBlurb}</p>
                  ) : null}
                  <div className="w-full max-w-full min-w-0 flex flex-col gap-3 break-words">
                    {dates.map((d) => {
                      const [datePart, timePart] = d.dateTime.includes(', ') ? d.dateTime.split(', ') : [d.dateTime, '']
                      const headerRest = timePart ? `${datePart}, ${timePart.toUpperCase()}` : datePart
                      const isSelected = selectedDate === d.id
                      const soldOut = effectiveSoldOut[d.id]
                      const remaining = remainingByDateId[d.id]
                      return (
                        <div
                          key={d.id}
                          role={soldOut ? undefined : 'button'}
                          tabIndex={soldOut ? undefined : 0}
                          onClick={soldOut ? undefined : () => { setSelectedDate(d.id); setReservationStep(2) }}
                          onKeyDown={soldOut ? undefined : (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDate(d.id); setReservationStep(2) } }}
                          className={`carrd-mobile-pill flex flex-col gap-3 text-left w-full ${soldOut ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? 'carrd-mobile-pill--selected' : ''}`}
                        >
                          <div className="min-w-0">
                            <p className="leading-tight text-xl">
                              <span className="text-[#C4AF86] font-medium">{d.day}</span>
                              <span className="text-[#FAEBD4]/90 font-normal">, {headerRest}</span>
                            </p>
                            {d.blurb ? (
                              <p className="text-[#D9D0BF]/90 text-base leading-snug mt-1 whitespace-pre-line">{d.blurb}</p>
                            ) : null}
                            {!soldOut && typeof remaining === 'number' && remaining > 0 && remaining < 5 ? (
                              <p className="text-[#FAE0B9] text-base mt-1">Only {remaining} tickets remaining</p>
                            ) : null}
                          </div>
                          <span className={`shrink-0 self-center ${soldOut ? 'text-[#D9D0BF]/70 italic' : isSelected ? 'carrd-mobile-pill-select carrd-mobile-pill-select--selected' : 'carrd-mobile-pill-select'}`}>{soldOut ? 'Sold Out' : 'Select'}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                ) : null}
                <div className={`carrd-font-body flex-shrink-0 ${panelWidthClass} flex flex-col items-center gap-4 px-3 min-w-0 overflow-y-auto overflow-x-hidden max-w-full`}>
                  <h2 className="carrd-font-heading carrd-font-h2 text-2xl text-center w-full">{ticketStepLabel}</h2>
                  <div className="w-full max-w-full min-w-0 flex flex-col gap-3 break-words">
                    {primaryTiers.map((t) => {
                      const qty = selections[t.id] ?? 0
                      const isSelected = qty > 0
                      return (
                        <div key={t.id} className={`carrd-mobile-pill flex flex-col gap-3 text-left w-full ${isSelected ? 'carrd-mobile-pill--selected' : ''}`}>
                          <div className="min-w-0">
                            <p className="leading-tight text-xl">
                              <span className="text-[#C4AF86] font-medium">{t.label}</span>
                              <span className="text-[#FAEBD4]/90 font-normal">, ${t.price}</span>
                            </p>
                            <p className="text-[#D9D0BF]/90 text-lg leading-snug mt-0.5 italic">{t.mainLine}</p>
                            {t.blurb ? <p className="text-[#D9D0BF]/90 text-lg leading-snug mt-0.5">{t.blurb}</p> : null}
                          </div>
                          {qty > 0 ? (
                            <div className="flex items-center justify-center gap-2">
                              <button type="button" onClick={() => handleQuantityChange(t.id, -1)} className="carrd-qty-btn flex h-11 w-11 items-center justify-center text-lg" aria-label={`Decrease ${t.label}`}>−</button>
                              <span className="w-8 text-center text-lg tabular-nums text-[#FAEBD4]">{qty}</span>
                              <button type="button" onClick={() => handleQuantityChange(t.id, 1)} disabled={totalQuantity >= maxSelectableTickets} className="carrd-qty-btn flex h-11 w-11 items-center justify-center text-lg disabled:opacity-40" aria-label={`Increase ${t.label}`}>+</button>
                            </div>
                          ) : null}
                          {qty === 0 && (
                            canAddTickets ? (
                            <button type="button" onClick={() => handleTierClick(t.id)} className="carrd-mobile-pill-select shrink-0 self-center">Select</button>
                            ) : (
                            <span className="shrink-0 self-center text-[#D9D0BF]/70 italic">Sold Out</span>
                            )
                          )}
                        </div>
                      )
                    })}
                    {hasSupportedTier ? (
                    <>
                    <p className="carrd-font-body text-left text-base text-[#D9D0BF]/95">
                      If cost is a barrier, please consider our{' '}
                      <button type="button" onClick={() => setShowSupportedTier((v) => !v)} className="underline cursor-pointer text-[#FAE0B9] focus:outline-none focus:underline">supported ticket option</button>.
                    </p>
                    {(showSupportedTier || (selections['supported'] ?? 0) > 0) && (
                      <div className={`carrd-mobile-pill flex flex-col gap-3 text-left w-full mt-2 ${(selections['supported'] ?? 0) > 0 ? 'carrd-mobile-pill--selected' : ''}`}>
                        <div className="min-w-0">
                          <p className="leading-tight text-xl"><span className="text-[#C4AF86] font-medium">{supportedTierLabel}</span><span className="text-[#FAEBD4]/90 font-normal">{supportedPriceSuffix}</span></p>
                          <p className="text-[#D9D0BF]/90 text-lg leading-snug mt-0.5 italic">{activeTiers.find((t) => t.id === 'supported')?.blurb ?? ''}</p>
                          <p className="text-[#FAEBD4] text-lg leading-snug mt-0.5">{"We're excited to have guests from diverse backgrounds. Please choose a price that feels accessible for you."}</p>
                        </div>
                        {(selections['supported'] ?? 0) > 0 ? (
                          <div className="flex flex-col gap-3 items-center">
                            <div className="flex items-center gap-2 w-full max-w-[8rem]">
                              <span className="text-[#D9D0BF] text-lg">$</span>
                              <input type="number" min={supportedMin} max={supportedMax} value={supportedPriceInput} placeholder={supportedPriceRangeLabel} onChange={(e) => { const raw = e.target.value; setSupportedPriceInput(raw); const v = parseInt(raw, 10); if (!isNaN(v) && isSupportedPriceInRange(activeTiers, v)) setSupportedPrice(v); else if (raw === '') setSelections((prev) => { const n = { ...prev }; delete n.supported; return n }); }} onBlur={() => { const v = parseInt(supportedPriceInput, 10); if (!isNaN(v) && isSupportedPriceInRange(activeTiers, v)) { setSupportedPrice(v); setSupportedPriceInput(String(v)) } else if (supportedPriceInput === '') setSelections((prev) => { const n = { ...prev }; delete n.supported; return n }); else setSupportedPriceInput(String(supportedPrice)) }} className="carrd-font-body flex-1 min-w-0 py-2.5 px-3 text-lg bg-[#2E0303]/40 rounded-lg border border-[#FAE0B9]/30 text-[#FAEBD4] focus:outline-none focus:border-[#FAE0B9]/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <button type="button" onClick={() => handleQuantityChange('supported', -1)} className="carrd-qty-btn flex h-11 w-11 items-center justify-center text-lg" aria-label="Decrease Supported">−</button>
                              <span className="w-8 text-center text-lg tabular-nums text-[#FAEBD4]">{selections['supported'] ?? 0}</span>
                              <button type="button" onClick={() => handleQuantityChange('supported', 1)} disabled={totalQuantity >= maxSelectableTickets} className="carrd-qty-btn flex h-11 w-11 items-center justify-center text-lg disabled:opacity-40" aria-label="Increase Supported">+</button>
                            </div>
                          </div>
                        ) : null}
                        {(selections['supported'] ?? 0) === 0 && (
                          <button type="button" onClick={selectSupportedTier} className="carrd-mobile-pill-select shrink-0 self-center">Select</button>
                        )}
                      </div>
                    )}
                    </>
                    ) : null}
                    {hasSupportedTier ? (
                    <>
                    <button type="button" onClick={() => setExpandedPricingNote((v) => !v)} className="carrd-font-body text-lg text-[#D9D0BF]/80 hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer w-fit flex items-center gap-1">
                      {expandedPricingNote ? 'Hide' : 'About our pricing'}
                      <span className="text-lg transition-transform" style={{ transform: expandedPricingNote ? 'rotate(180deg)' : 'none' }}>▾</span>
                    </button>
                    {expandedPricingNote && (
                      <div className="carrd-font-body text-left text-base text-[#D9D0BF]/95">
                        <p>
                          Our city and community span a wide range of financial situations. Our tiered pricing helps us balance making the teahouse both financially sustainable and accessible. We invite you to choose the level that feels right for you — one that honors your own capacity while helping us keep this space open, welcoming and alive.
                        </p>
                      </div>
                    )}
                    </>
                    ) : null}
                    {ticketLimitError && (
                      <p className="carrd-font-body text-base text-[#FAE0B9]">{ticketLimitError}</p>
                    )}
                    {!ticketLimitError &&
                    selectedFormatCapacity &&
                    typeof selectedFormatCapacity.remaining === 'number' &&
                    selectedFormatCapacity.remaining > 0 &&
                    selectedFormatCapacity.remaining < 4 ? (
                      <p className="carrd-font-body text-base text-[#FAE0B9]">
                        Only {selectedFormatCapacity.remaining} seat{selectedFormatCapacity.remaining === 1 ? '' : 's'} remaining
                      </p>
                    ) : null}
                  </div>
                  <button type="button" onClick={() => setReservationStep(3)} disabled={!hasSelection || (usesFormatStep && !selectedTicketFormat)} className="carrd-btn px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed">Continue</button>
                </div>
                <div ref={mobileFormRef} className={`carrd-font-body flex-shrink-0 ${panelWidthClass} flex flex-col items-center gap-4 px-3 min-w-0 overflow-y-auto overflow-x-hidden max-w-full`}>
                  <h2 className="carrd-font-heading carrd-font-h2 text-2xl text-center w-full">{formStepLabel}</h2>
                  {readyToCheckout ? (
                    <div className="carrd-font-body rounded-lg bg-[#FAEBD4]/20 px-4 py-4 text-left w-full max-w-full min-w-0">
                      <div className="space-y-3">
                        <div><p className="text-base text-[#D9D0BF]/80 uppercase tracking-wider">Date</p><p className="text-lg text-[#FAEBD4]">{selectedDateData?.dateTime}</p></div>
                        {selectedFormatData ? (
                          <div><p className="text-base text-[#D9D0BF]/80 uppercase tracking-wider">Experience</p><p className="text-lg text-[#FAEBD4]">{selectedFormatData.label}</p></div>
                        ) : null}
                        <div><p className="text-base text-[#D9D0BF]/80 uppercase tracking-wider mb-1.5">Tickets</p><div className="space-y-1">{selectionSummaryLines.map(({ tierId, qty, price, label }) => <p key={tierId} className="text-lg text-[#FAEBD4]">{label} — ${price} × {qty} = ${price * qty}</p>)}</div></div>
                        <div className="pt-2 border-t border-[#D9D0BF]/30"><p className="text-base text-[#D9D0BF]/80 uppercase tracking-wider">Total</p><p className="text-xl font-medium text-[#FAEBD4]">${totalPrice}</p></div>
                      </div>
                    </div>
                  ) : null}
                  <form className="w-full max-w-full min-w-0 flex flex-col gap-4 carrd-font-body">
                    <input type="hidden" name="device_type" value={deviceType} />
                    <input type="hidden" name="date" value={selectedDate ?? ''} />
                    <label className="flex flex-col gap-1.5">Name *<input type="text" name="name" required value={formData.name} onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))} className="mt-1 w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none focus:ring-2 focus:ring-[#FAE0B9]/30" placeholder="Your name" /></label>
                    <label className="flex flex-col gap-1.5">Email *<input type="email" name="email" required value={formData.email} onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))} className="mt-1 w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none focus:ring-2 focus:ring-[#FAE0B9]/30" placeholder="you@example.com" /></label>
                    <label className="flex flex-col gap-1.5">Notes<textarea name="notes" value={formData.notes} onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value }))} rows={2} className="mt-1 w-full resize-none rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] placeholder:text-[#D9D0BF]/60 focus:border-[#FAE0B9] focus:outline-none focus:ring-2 focus:ring-[#FAE0B9]/30" placeholder="Anything else we should know?" /></label>
                  </form>
                  <div className="w-full max-w-full min-w-0 text-left px-4 md:px-0">
                    <p className="carrd-font-body text-base font-medium mb-1.5">A few things to note before booking:</p>
                    <ul className="carrd-font-body text-base space-y-1.5 list-none pl-0 leading-snug">
                      {checkoutBookingNotes.map((item, i) => (
                        <li key={i} className="flex items-center gap-2"><span className="text-[#D9D0BF] w-1.5 h-1.5 rounded-full bg-[#D9D0BF] shrink-0" aria-hidden /><span className="flex-1 min-w-0 text-[#D9D0BF]/95">{item}</span></li>
                      ))}
                    </ul>
                  </div>
                  {readyToCheckout && checkoutError && (
                    <p className="carrd-font-body text-base text-red-300 w-full max-w-full" role="alert">{checkoutError}</p>
                  )}
                  {readyToCheckout && (
                    <button type="button" disabled={isSubmitting} onClick={async () => {
                      if (!selectedDate || !hasSelection || !formData.name.trim() || !formData.email.trim()) return
                      if (usesFormatStep && !selectedTicketFormat) return
                      setIsSubmitting(true); setCheckoutError(null)
                      try {
                        const items = Object.entries(selections).filter(([, q]) => q > 0).map(([tierId, qty]) => ({ tierId, quantity: qty, ...(tierId === 'supported' && { supportedPrice }) }))
                        const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventSlug, dateId: selectedDate, items, supportedPrice: (selections['supported'] ?? 0) > 0 ? supportedPrice : undefined, name: formData.name.trim(), email: formData.email.trim(), notes: formData.notes.trim(), device: deviceType, ...(selectedTicketFormat && { ticketFormat: selectedTicketFormat }), ...(initialTicket && { ticket: initialTicket }) }) })
                        const data = await res.json()
                        if (!res.ok) { setCheckoutError(data.error ?? 'Something went wrong'); return }
                        if (data.url) window.location.href = data.url
                        else setCheckoutError('No checkout URL received')
                      } catch { setCheckoutError('Network error. Please try again.') }
                      finally { setIsSubmitting(false) }
                    }} className="carrd-btn px-12 py-4 disabled:opacity-70 disabled:cursor-not-allowed mt-8">
                      {isSubmitting ? 'Redirecting…' : 'Finish Booking'}
                    </button>
                  )}
                </div>
              </div>
            </section>
            <SiteFooter variant="main" />
          </div>
        )}
      </div>
      {/* Desktop: web version with table design, viewport >= 768px */}
      <div className="hidden md:flex w-full max-w-[60rem] flex-col items-center px-12 py-12 gap-[1.25em] overflow-x-hidden min-w-0">
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
        <div className="carrd-video-fade w-full py-6 overflow-hidden">
          <div className="aspect-video overflow-hidden">
            <EventHero className="w-full h-full object-cover" heroImage={heroImage} />
          </div>
        </div>

        {/* Countdown */}
        {showCountdown && (
          <div className="flex justify-center py-6" style={{ transform: 'scale(1.3)' }}>
            <CountdownTimer targetTimestamp={countdownTarget} length={3} />
          </div>
        )}

        {/* March Gatherings */}
        <section className="w-full flex flex-col items-center gap-10 text-center">
          <div className="flex flex-col items-center gap-[1em] w-full">
              <h2 className="carrd-font-heading text-[0.96rem] md:text-3xl italic" style={{ letterSpacing: '-2px' }}>
              {eventTitle}
            </h2>
            {welcomeAndHostSection}
          </div>
          <div className="w-full max-w-[650px] flex flex-col md:flex-row items-center md:items-start justify-center gap-16 md:gap-28 text-center pt-2">
            <div className="space-y-2">
              <p className="carrd-font-label text-[1.3125rem]">
                Date
              </p>
              <div className="space-y-0.5">
                <p className="carrd-font-body">
                  {dateRangeLabel}
                </p>
                <p className="carrd-font-body">
                  {timeLabel}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="carrd-font-label text-[1.3125rem]">
                Location
              </p>
              <div className="space-y-0.5">
                <p className="carrd-font-body">
                  {locationLabel}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              beginReservation()
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                joinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              } else {
                scrollToSection(joinRef)
              }
            }}
            disabled={availabilityLoading}
            className="carrd-btn px-10 py-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {availabilityLoading ? 'Loading…' : 'Reserve Your Seat'}
          </button>
        </section>

        <hr className="carrd-divider-solid border-0 my-8" />

        <div className="w-full flex flex-col items-center gap-1">
          {/* Step indicator */}
          <div className="flex justify-center gap-2" aria-hidden>
            {reservationSteps.map((step) => (
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
                  onClick={handleReservationBack}
                  className="carrd-font-body text-lg text-[#D9D0BF] hover:text-[#FAEBD4] underline focus:outline-none cursor-pointer"
                >
                  ← Back
                </button>
              )}
            </div>
            <h2 ref={reservationHeaderRef} className="carrd-font-heading carrd-font-heading-sm flex-1 text-center italic">
              Reservation
            </h2>
            <div className="flex-1 min-w-0" aria-hidden />
          </div>
        </div>

        {/* Reservation: three sliding panels (evening → ticket → form) */}
        <section
          ref={joinRef}
          className="carrd-reservation-section w-full min-w-0 overflow-x-hidden max-w-full mt-1"
        >
          <div
            className="flex transition-transform duration-500 ease-in-out min-w-0"
            style={{
              width: panelFlexWidth,
              transform: slideTransform,
            }}
          >
            {/* Panel 1: Choose your experience (Turby) or evening */}
            {usesFormatStep ? (
            <div className={`flex-shrink-0 ${panelWidthClass} min-w-0 flex flex-col items-center gap-6 px-4 md:px-6 max-w-full`}>
              <h2 className="carrd-font-heading carrd-font-h2 text-center">{formatStepLabel}</h2>
              <div className="carrd-font-body w-full max-w-[650px] flex flex-col gap-4">
                {ticketFormats?.map((f) => {
                  const formatSoldOut = isFormatSoldOut(f)
                  const formatAvailability = getFormatAvailability(f)
                  return (
                  <div
                    key={f.id}
                    className={`carrd-reservation-card flex flex-col gap-2 md:grid md:grid-cols-[1fr_auto] md:gap-x-6 md:items-start w-full ${formatSoldOut ? 'opacity-60' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="carrd-font-body carrd-accent-color font-medium text-[1.625rem]">{f.label}</p>
                      <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0 text-[#FAEBD4] mt-1 whitespace-pre-line">{f.description}</p>
                      {!formatSoldOut && typeof formatAvailability.remaining === 'number' && formatAvailability.remaining > 0 && formatAvailability.remaining < 4 ? (
                        <p className="carrd-font-body text-[#FAE0B9] text-base mt-1">Only {formatAvailability.remaining} seat{formatAvailability.remaining === 1 ? '' : 's'} remaining</p>
                      ) : null}
                    </div>
                    {formatSoldOut ? (
                      <span className="carrd-font-body text-[#D9D0BF]/70 italic md:ml-4 shrink-0 self-start">Sold Out</span>
                    ) : (
                    <button
                      type="button"
                      onClick={() => selectTicketFormat(f.id)}
                      className="carrd-btn px-8 py-4 md:ml-4 shrink-0 self-start"
                    >
                      Select
                    </button>
                    )}
                  </div>
                )})}
              </div>
            </div>
            ) : null}
            {!singleDateEvent ? (
            <div className={`flex-shrink-0 ${panelWidthClass} min-w-0 flex flex-col items-center gap-6 px-4 md:px-6 max-w-full`}>
              <h2 className="carrd-font-heading carrd-font-h2">
                1. Choose Your Evening
              </h2>
              {sharedMusicBlurb ? (
                <p className="carrd-font-body text-center italic text-[#D9D0BF]/90 w-full max-w-[650px] px-2">
                  {sharedMusicBlurb}
                </p>
              ) : null}
              {/* Mobile: date cards (2-line, succinct) */}
              <div className="md:hidden w-full max-w-full flex flex-col gap-5 break-words">
                {dates.map((d) => {
                  const [datePart, timePart] = d.dateTime.includes(', ') ? d.dateTime.split(', ') : [d.dateTime, '']
                  const headerRest = timePart ? `${datePart}, ${timePart.toUpperCase()}` : datePart
                  const isSelected = selectedDate === d.id
                  const soldOut = effectiveSoldOut[d.id]
                  const remaining = remainingByDateId[d.id]
                  return (
                    <div
                      key={d.id}
                      role={soldOut ? undefined : 'button'}
                      tabIndex={soldOut ? undefined : 0}
                      onClick={soldOut ? undefined : () => {
                        setSelectedDate(d.id)
                        setReservationStep(2)
                      }}
                      onKeyDown={soldOut ? undefined : (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedDate(d.id)
                          setReservationStep(2)
                        }
                      }}
                      className={`carrd-mobile-pill flex flex-col gap-3 text-left w-full ${soldOut ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${
                        isSelected ? 'carrd-mobile-pill--selected' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="leading-tight text-base">
                          <span className="text-[#C4AF86] font-medium">{d.day}</span>
                          <span className="text-[#FAEBD4]/90 font-normal">, {headerRest}</span>
                        </p>
                        {d.blurb ? (
                          <p className="text-[#D9D0BF]/90 text-[0.9375rem] leading-snug mt-1 whitespace-pre-line">{d.blurb}</p>
                        ) : null}
                        {!soldOut && typeof remaining === 'number' && remaining > 0 && remaining < 5 ? (
                          <p className="text-[#FAE0B9] text-sm mt-1">Only {remaining} tickets remaining</p>
                        ) : null}
                      </div>
                      <span className={`shrink-0 self-center ${soldOut ? 'text-[#D9D0BF]/70 italic' : isSelected ? 'carrd-mobile-pill-select carrd-mobile-pill-select--selected' : 'carrd-mobile-pill-select'}`}>
                        {soldOut ? 'Sold Out' : 'Select'}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* Desktop: date cards */}
              <div className="hidden md:block w-full max-w-[650px] space-y-6">
                {dates.map((d) => {
                  const soldOut = effectiveSoldOut[d.id]
                  const remaining = remainingByDateId[d.id]
                  return (
                  <div
                    key={d.id}
                    className={`carrd-reservation-card flex flex-col gap-2 md:grid md:grid-cols-[12rem_1fr_auto] md:grid-rows-[auto_auto] md:gap-x-6 md:gap-y-1 md:items-start ${soldOut ? 'opacity-60' : ''}`}
                  >
                    <p className="carrd-font-body carrd-accent-color font-medium text-[1.625rem] md:col-start-1 md:row-start-1">{d.day}</p>
                    <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0 mt-1 md:col-start-1 md:row-start-2">
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
                    <div className="min-w-0 md:col-start-2 md:row-start-1 md:row-span-2">
                      {d.blurb ? (
                        <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0 text-[#D9D0BF]/90 whitespace-pre-line">
                          {d.blurb}
                        </p>
                      ) : null}
                      {!soldOut && typeof remaining === 'number' && remaining > 0 && remaining < 5 ? (
                        <p className="text-[#FAE0B9] text-base mt-1">Only {remaining} tickets remaining</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      disabled={soldOut}
                      onClick={soldOut ? undefined : () => {
                        setSelectedDate(d.id)
                        setReservationStep(2)
                      }}
                      className={`carrd-btn px-8 py-4 flex-shrink-0 self-start md:col-start-3 md:row-start-1 md:row-span-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                        selectedDate === d.id ? 'bg-[#FAE0B9]/20' : ''
                      }`}
                    >
                      {soldOut ? 'Sold Out' : 'Select'}
                    </button>
                  </div>
                  )
                })}
              </div>
            </div>
            ) : null}

            {/* Panel 2: Choose your ticket */}
            <div ref={tierRef} className={`flex-shrink-0 ${panelWidthClass} min-w-0 flex flex-col items-center gap-6 px-4 md:px-6 max-w-full`}>
              <h2 className="carrd-font-heading carrd-font-h2">
                {ticketStepLabel}
              </h2>
              {/* Mobile: cards first, then dropdown for pricing note */}
              <div className="carrd-font-body md:hidden w-full max-w-full flex flex-col gap-5 break-words">
                {primaryTiers.map((t) => {
                    const qty = selections[t.id] ?? 0
                    const isSelected = qty > 0
                    return (
                      <div
                        key={t.id}
                        className={`carrd-mobile-pill flex flex-col gap-3 text-left w-full ${isSelected ? 'carrd-mobile-pill--selected' : ''}`}
                      >
                        <div className="min-w-0">
                          <p className="leading-tight text-base">
                            <span className="text-[#C4AF86] font-medium">{t.label}</span>
                            <span className="text-[#FAEBD4]/90 font-normal">, ${t.price}</span>
                          </p>
                          <p className="text-[#D9D0BF]/90 text-[0.9375rem] leading-snug mt-0.5 italic">
                            {t.mainLine}
                          </p>
                          {t.blurb ? <p className="text-[#D9D0BF]/90 text-[0.9375rem] leading-snug mt-0.5">{t.blurb}</p> : null}
                        </div>
                        {qty > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(t.id, -1)}
                              className="carrd-qty-btn flex h-11 w-11 items-center justify-center text-lg transition-colors"
                              aria-label={`Decrease ${t.label} quantity`}
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-lg tabular-nums text-[#FAEBD4]">{qty}</span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(t.id, 1)}
                              className="carrd-qty-btn flex h-11 w-11 items-center justify-center text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              disabled={totalQuantity >= maxSelectableTickets}
                              aria-label={`Increase ${t.label} quantity`}
                            >
                              +
                            </button>
                          </div>
                        ) : null}
                        {qty === 0 && (
                          canAddTickets ? (
                          <button
                            type="button"
                            onClick={() => handleTierClick(t.id)}
                            className={`carrd-mobile-pill-select shrink-0 self-center ${isSelected ? 'carrd-mobile-pill-select--selected' : ''}`}
                          >
                            Select
                          </button>
                          ) : (
                          <span className="shrink-0 self-center text-[#D9D0BF]/70 italic">Sold Out</span>
                          )
                        )}
                      </div>
                    )
                  })}
                {hasSupportedTier ? (
                <>
                <p className="carrd-font-body text-left text-base text-[#D9D0BF]/95">
                  If cost is a barrier, please consider our{' '}
                  <button
                    type="button"
                    onClick={() => setShowSupportedTier((v) => !v)}
                    className="underline hover:no-underline cursor-pointer text-[#FAE0B9] focus:outline-none focus:underline"
                  >
                    supported ticket option
                  </button>
                  .
                </p>
                {(showSupportedTier || (selections['supported'] ?? 0) > 0) && (
                  <div
                    className={`carrd-mobile-pill flex flex-col gap-3 text-left w-full mt-2 ${(selections['supported'] ?? 0) > 0 ? 'carrd-mobile-pill--selected' : ''}`}
                  >
                    <div className="min-w-0">
                      <p className="leading-tight text-base">
                        <span className="text-[#C4AF86] font-medium">{supportedTierLabel}</span>
                        <span className="text-[#FAEBD4]/90 font-normal">{supportedPriceSuffix}</span>
                      </p>
                      <p className="text-[#D9D0BF]/90 text-[0.9375rem] leading-snug mt-0.5 italic">{activeTiers.find((t) => t.id === 'supported')?.blurb ?? ''}</p>
                      <p className="text-[#FAEBD4] text-[0.9375rem] leading-snug mt-0.5">{"We're excited to have guests from diverse backgrounds. Please choose a price that feels accessible for you."}</p>
                    </div>
                    {(selections['supported'] ?? 0) > 0 ? (
                      <div className="flex flex-col gap-3 items-center">
                        <div className="flex items-center gap-2 w-full max-w-[8rem]">
                          <span className="text-[#D9D0BF] text-lg">$</span>
                          <input
                            type="number"
                            min={supportedMin}
                            max={supportedMax}
                            value={supportedPriceInput}
                            placeholder={supportedPriceRangeLabel}
                            onChange={(e) => {
                              const raw = e.target.value
                              setSupportedPriceInput(raw)
                              const v = parseInt(raw, 10)
                              if (!isNaN(v) && isSupportedPriceInRange(activeTiers, v)) setSupportedPrice(v)
                              else if (raw === '') {
                                setSelections((prev) => { const n = { ...prev }; delete n.supported; return n })
                              }
                            }}
                            onBlur={() => {
                              const v = parseInt(supportedPriceInput, 10)
                              if (!isNaN(v) && isSupportedPriceInRange(activeTiers, v)) {
                                setSupportedPrice(v)
                                setSupportedPriceInput(String(v))
                              } else if (supportedPriceInput === '') {
                                setSelections((prev) => { const n = { ...prev }; delete n.supported; return n })
                              } else setSupportedPriceInput(String(supportedPrice))
                            }}
                            className="carrd-font-body flex-1 min-w-0 py-2.5 px-3 text-lg bg-[#2E0303]/40 rounded-lg border border-[#FAE0B9]/30 text-[#FAEBD4] placeholder:text-[#D9D0BF]/50 focus:outline-none focus:border-[#FAE0B9]/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange('supported', -1)}
                            className="carrd-qty-btn flex h-11 w-11 items-center justify-center text-lg transition-colors"
                            aria-label="Decrease Supported quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-lg tabular-nums text-[#FAEBD4]">
                              {selections['supported'] ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange('supported', 1)}
                              className="carrd-qty-btn flex h-11 w-11 items-center justify-center text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              disabled={totalQuantity >= maxSelectableTickets}
                              aria-label="Increase Supported quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                    ) : null}
                    {(selections['supported'] ?? 0) === 0 && (
                      canAddTickets ? (
                      <button
                        type="button"
                        onClick={selectSupportedTier}
                        className="carrd-mobile-pill-select shrink-0 self-center"
                      >
                        Select
                      </button>
                      ) : (
                      <span className="shrink-0 self-center text-[#D9D0BF]/70 italic">Sold Out</span>
                      )
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setExpandedPricingNote((v) => !v)}
                  className="carrd-font-body text-lg text-[#D9D0BF]/80 hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer w-fit flex items-center gap-1"
                >
                  {expandedPricingNote ? 'Hide' : 'About our pricing'}
                  <span className="text-lg transition-transform" style={{ transform: expandedPricingNote ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>
                {expandedPricingNote && (
                  <div className="carrd-font-body text-left text-base text-[#D9D0BF]/95">
                    <p>
                      Our city and community span a wide range of financial situations. Our tiered pricing helps us balance making the teahouse both financially sustainable and accessible. We invite you to choose the level that feels right for you — one that honors your own capacity while helping us keep this space open, welcoming and alive.
                    </p>
                  </div>
                )}
                </>
                ) : null}
              </div>
              {/* Desktop: tier cards first, then About our pricing */}
              <div className="hidden md:block w-full max-w-[650px] space-y-6">
                {primaryTiers.map((t) => {
                    const qty = selections[t.id] ?? 0
                    return (
                      <div
                        key={t.id}
                        className="carrd-reservation-card flex flex-col gap-2 md:grid md:grid-cols-[6rem_1fr_auto] md:grid-rows-[auto_auto] md:gap-x-6 md:gap-y-1 md:items-start"
                      >
                        <p className="carrd-font-body carrd-accent-color font-medium text-[1.625rem]">{t.label}</p>
                        <p className="carrd-font-body carrd-accent-color font-medium italic text-[1.625rem]">{t.mainLine}</p>
                        <div className="flex items-start justify-end min-w-[8rem] w-[8rem] row-span-2 self-start order-last md:order-none">
                          {qty > 0 ? (
                            <div className="flex items-center justify-end gap-2 w-full">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(t.id, -1)}
                                className="carrd-qty-btn flex h-7 w-7 items-center justify-center text-sm transition-colors"
                                aria-label={`Decrease ${t.label} quantity`}
                              >
                                −
                              </button>
                              <span className="carrd-font-body w-7 text-center text-base tabular-nums text-[#FAEBD4]">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(t.id, 1)}
                                className="carrd-qty-btn flex h-7 w-7 items-center justify-center text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={totalQuantity >= maxSelectableTickets}
                                aria-label={`Increase ${t.label} quantity`}
                              >
                                +
                              </button>
                            </div>
                          ) : canAddTickets ? (
                            <button
                              type="button"
                              onClick={() => handleTierClick(t.id)}
                              className="carrd-btn px-8 py-4 md:ml-4"
                            >
                              Select
                            </button>
                          ) : (
                            <span className="carrd-font-body text-[#D9D0BF]/70 italic md:ml-4">Sold Out</span>
                          )}
                        </div>
                        <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0">${t.price}</p>
                        <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0">{t.blurb}</p>
                      </div>
                    )
                  })}
              </div>
              {hasSupportedTier ? (
              <div className="hidden md:block w-full max-w-[650px] space-y-4">
                <p className="carrd-font-body text-left text-[#D9D0BF]/95">
                  If cost is a barrier, please consider our{' '}
                  <button
                    type="button"
                    onClick={() => setShowSupportedTier((v) => !v)}
                    className="underline hover:no-underline cursor-pointer text-[#FAE0B9] focus:outline-none focus:underline"
                  >
                    supported ticket option
                  </button>
                  .
                </p>
                {(showSupportedTier || (selections['supported'] ?? 0) > 0) && (
              <div className="hidden md:block w-full max-w-[650px]">
              {activeTiers.filter((t) => t.id === 'supported').map((t) => (
                <div
                  key={t.id}
                  className="carrd-reservation-card flex flex-col gap-2 md:grid md:grid-cols-[6rem_1fr_auto] md:grid-rows-[auto_auto] md:gap-x-6 md:gap-y-1 md:items-start w-full max-w-[650px]"
                >
                  <p className="carrd-font-body carrd-accent-color font-medium text-[1.625rem]">{t.label}</p>
                  <p className="carrd-font-body carrd-accent-color font-medium italic text-[1.625rem]">{t.blurb}</p>
                  <div className="flex items-start justify-end min-w-[8rem] w-[8rem] row-span-2 self-start order-last md:order-none">
                    {(selections['supported'] ?? 0) > 0 ? (
                      <div className="flex items-center justify-end gap-2 w-full">
                        <div className="flex items-center gap-0.5 rounded-lg bg-[#FAEBD4]/5 px-1.5 py-1">
                          <span className="carrd-font-body text-[#D9D0BF] text-xs">$</span>
                          <input
                            type="number"
                            min={supportedMin}
                            max={supportedMax}
                            value={supportedPriceInput}
                            placeholder={supportedPriceRangeLabel}
                            onChange={(e) => {
                              const raw = e.target.value
                              setSupportedPriceInput(raw)
                              const v = parseInt(raw, 10)
                              if (!isNaN(v) && isSupportedPriceInRange(activeTiers, v)) {
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
                              if (!isNaN(v) && isSupportedPriceInRange(activeTiers, v)) {
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
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange('supported', -1)}
                            className="carrd-qty-btn flex h-7 w-7 items-center justify-center text-sm transition-colors"
                            aria-label="Decrease Supported quantity"
                          >
                            −
                          </button>
                          <span className="carrd-font-body w-7 text-center text-base tabular-nums text-[#FAEBD4]">
                            {selections['supported'] ?? 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange('supported', 1)}
                            className="carrd-qty-btn flex h-7 w-7 items-center justify-center text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            disabled={totalQuantity >= maxSelectableTickets}
                            aria-label="Increase Supported quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ) : canAddTickets ? (
                      <button
                        type="button"
                        onClick={selectSupportedTier}
                        className="carrd-btn px-8 py-4 md:ml-4"
                      >
                        Select
                      </button>
                    ) : (
                      <span className="carrd-font-body text-[#D9D0BF]/70 italic md:ml-4">Sold Out</span>
                    )}
                  </div>
                  <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0">${supportedMin}+</p>
                  <p className="carrd-font-body carrd-table-row-2 carrd-table-row-2-sm min-w-0 text-[#FAEBD4]">We're excited to have guests from diverse backgrounds. Please choose a price that feels accessible for you.</p>
                </div>
              ))}
              </div>
              )}
                <button
                  type="button"
                  onClick={() => setExpandedPricingNote((v) => !v)}
                  className="carrd-font-body text-base text-[#D9D0BF]/80 hover:text-[#FAEBD4] focus:outline-none focus:underline cursor-pointer w-fit flex items-center gap-1"
                >
                  {expandedPricingNote ? 'Hide' : 'About our pricing'}
                  <span className="text-base transition-transform" style={{ transform: expandedPricingNote ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>
                {expandedPricingNote && (
                  <div className="carrd-font-body text-left w-full max-w-[650px]">
                    <p>
                      Our city and community span a wide range of financial situations. Our tiered pricing helps us balance making the teahouse both financially sustainable and accessible. We invite you to choose the level that feels right for you — one that honors your own capacity while helping us keep this space open, welcoming and alive.
                    </p>
                  </div>
                )}
                {ticketLimitError && (
                  <p className="carrd-font-body text-base text-[#FAE0B9]">{ticketLimitError}</p>
                )}
                {!ticketLimitError &&
                selectedFormatCapacity &&
                typeof selectedFormatCapacity.remaining === 'number' &&
                selectedFormatCapacity.remaining > 0 &&
                selectedFormatCapacity.remaining < 4 ? (
                  <p className="carrd-font-body text-base text-[#FAE0B9]">
                    Only {selectedFormatCapacity.remaining} seat{selectedFormatCapacity.remaining === 1 ? '' : 's'} remaining
                  </p>
                ) : null}
              </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-[650px]">
                <button
                  type="button"
                  onClick={() => setReservationStep(3)}
                  disabled={!hasSelection || (usesFormatStep && !selectedTicketFormat)}
                  className="carrd-btn px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Panel 3: Complete your reservation (summary + form + reserve) */}
            <div ref={formRef} className={`flex-shrink-0 ${panelWidthClass} min-w-0 flex flex-col items-center gap-6 px-4 md:px-6 max-w-full`}>
              <div className="inline-flex flex-col items-stretch gap-6">
                <h2 className="carrd-font-heading carrd-font-h2 text-center">
                  {formStepLabel}
                </h2>
              {readyToCheckout ? (
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
                      {selectedFormatData ? (
                        <div>
                          <p className="text-sm text-[#D9D0BF]/80 uppercase tracking-wider">Experience</p>
                          <p className="text-base text-[#FAEBD4]">{selectedFormatData.label}</p>
                        </div>
                      ) : null}
                      <div>
                        <p className="text-sm text-[#D9D0BF]/80 uppercase tracking-wider mb-1.5">Tickets</p>
                        <div className="space-y-1">
                          {selectionSummaryLines.map(({ tierId, qty, price, label }) => (
                            <p key={tierId} className="text-base text-[#FAEBD4]">
                              {label} — ${price} × {qty} = ${price * qty}
                            </p>
                          ))}
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
                    className="carrd-btn px-10 py-4"
                  >
                    Choose your ticket
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
              {readyToCheckout && checkoutError && (
                <p className="carrd-font-body text-sm text-red-300" role="alert">
                  {checkoutError}
                </p>
              )}
              <div className="w-full max-w-[650px] text-left mt-6 px-4 md:px-0">
                <p className="carrd-font-body text-sm font-medium mb-1.5">A few things to note before booking:</p>
                <ul className="carrd-font-body text-base space-y-1 list-none pl-0 leading-tight">
                  {checkoutBookingNotes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-[#D9D0BF] w-1.5 h-1.5 rounded-full bg-[#D9D0BF] shrink-0 flex-shrink-0" aria-hidden />
                      <span className="flex-1 min-w-0 text-[#D9D0BF]/95">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {readyToCheckout && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!selectedDate || !hasSelection || !formData.name.trim() || !formData.email.trim()) return
                    if (usesFormatStep && !selectedTicketFormat) return
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
                          eventSlug,
                          dateId: selectedDate,
                          items,
                          supportedPrice: (selections['supported'] ?? 0) > 0 ? supportedPrice : undefined,
                          name: formData.name.trim(),
                          email: formData.email.trim(),
                          notes: formData.notes.trim(),
                          device: deviceType,
                          ...(selectedTicketFormat && { ticketFormat: selectedTicketFormat }),
                          ...(initialTicket && { ticket: initialTicket }),
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
