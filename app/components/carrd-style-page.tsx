'use client'

import { useEffect, useRef, useState } from 'react'
import { CountdownTimer } from './countdown-timer'
import type { eventDates, eventTiers } from '../../content/event-invite.config'

const STORAGE_KEY = 'teahouse_reservation'

type CarrdStylePageProps = {
  welcomeContent: string
  dates: readonly (typeof eventDates)[number][]
  tiers: readonly (typeof eventTiers)[number][]
  /** Unix timestamp for countdown (first event at 7pm) */
  countdownTarget: number
}

function scrollToSection(ref: React.RefObject<HTMLElement | null>) {
  ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function loadPersisted(
  dates: readonly { id: string }[],
  tiers: readonly { id: string }[]
): { date: string | null; tier: string | null; form: { name: string; email: string; notes: string } } {
  if (typeof window === 'undefined') return { date: null, tier: null, form: { name: '', email: '', notes: '' } }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: null, tier: null, form: { name: '', email: '', notes: '' } }
    const data = JSON.parse(raw) as { date?: string; tier?: string; name?: string; email?: string; notes?: string }
    const date = data.date && dates.some((d) => d.id === data.date) ? data.date : null
    const tier = data.tier && tiers.some((t) => t.id === data.tier) ? data.tier : null
    return {
      date,
      tier,
      form: {
        name: typeof data.name === 'string' ? data.name : '',
        email: typeof data.email === 'string' ? data.email : '',
        notes: typeof data.notes === 'string' ? data.notes : '',
      },
    }
  } catch {
    return { date: null, tier: null, form: { name: '', email: '', notes: '' } }
  }
}

function savePersisted(date: string | null, tier: string | null, form: { name: string; email: string; notes: string }) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ date, tier, ...form }))
  } catch {
    /* ignore */
  }
}

export function CarrdStylePage({ welcomeContent, dates, tiers, countdownTarget }: CarrdStylePageProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' })
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const joinRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLElement>(null)
  const paymentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const persisted = loadPersisted(dates, tiers)
    setSelectedDate(persisted.date)
    setSelectedTier(persisted.tier)
    setFormData(persisted.form)
    setHydrated(true)
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
    savePersisted(selectedDate, selectedTier, formData)
  }, [hydrated, selectedDate, selectedTier, formData])

  const selectedTierData = tiers.find((t) => t.id === selectedTier)

  return (
    <div className="carrd-page flex flex-col items-center min-h-screen overflow-x-hidden pt-8">
      <div className="w-full max-w-[60rem] flex flex-col items-center px-6 md:px-12 py-8 md:py-12 gap-6">
        {/* Hero: Title + Subtitle */}
        <h1 className="carrd-font-heading text-center text-3xl md:text-4xl">
          Midnight Teahouse
        </h1>
        <p className="carrd-font-subtitle text-center text-base md:text-lg italic">
          an evening teahouse
        </p>

        {/* Video */}
        <div className="w-full -mx-6 md:-mx-12 aspect-video overflow-hidden">
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
        <section className="w-full flex flex-col items-center gap-4 text-center">
          <h2 className="carrd-font-heading text-2xl md:text-3xl">
            March Gatherings
          </h2>
          <p className="carrd-font-muted text-base leading-relaxed">
            {dates[0]?.value && dates[dates.length - 1]?.value
              ? `${new Date(dates[0].value).toLocaleDateString('en-US', { month: 'long' })} ${new Date(dates[0].value).getDate()}-${new Date(dates[dates.length - 1].value).getDate()}, ${new Date(dates[0].value).getFullYear()}`
              : 'March 18-20, 2025'}
            <br />
            7-11pm<br />
            SoMA, SF
          </p>
          <div className="carrd-font-body text-left space-y-4 max-w-xl">
            {welcomeContent.split(/\n\n+/).map((para, i) => (
              <p key={i} className="leading-relaxed">
                {para}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollToSection(joinRef)}
            className="carrd-btn px-8 py-3 text-base"
          >
            Reserve your spot
          </button>
        </section>

        <hr className="carrd-divider border-0 my-2" />

        {/* Join us - Dates + Tiers */}
        <section
          ref={joinRef}
          className="w-full flex flex-col items-center gap-6"
        >
          <h2 className="carrd-font-heading text-2xl md:text-3xl">
            Join us
          </h2>
          <p className="carrd-font-body text-center max-w-xl leading-relaxed">
            To keep our gatherings intimate, we are open by reservation and have limited seats. Reserve a spot to gift a cozy evening to yourself or someone you love.
          </p>

          {/* Date buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {dates.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDate(d.id)}
                className={`carrd-btn px-6 py-3 text-base whitespace-normal max-w-[10rem] ${
                  selectedDate === d.id ? 'bg-[#FAE0B9]/20' : ''
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Tier buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {tiers.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTier(t.id)}
                className={`carrd-btn px-6 py-3 text-base whitespace-normal max-w-[10rem] ${
                  selectedTier === t.id ? 'bg-[#FAE0B9]/20' : ''
                }`}
              >
                {t.label} ${t.price}
              </button>
            ))}
          </div>

          {/* Form - show when date + tier selected */}
          {(selectedDate || selectedTier) && (
            <button
              type="button"
              onClick={() => scrollToSection(formRef)}
              className="carrd-btn px-8 py-3 text-base"
            >
              Continue with details
            </button>
          )}
        </section>

        <hr className="carrd-divider border-0 my-2" />

        {/* Form section */}
        <section
          ref={formRef}
          className="w-full flex flex-col items-center gap-6"
        >
          <h2 className="carrd-font-heading text-2xl md:text-3xl">
            A few details
          </h2>
          <form
            id="carrd-form"
            onSubmit={(e) => {
              e.preventDefault()
              scrollToSection(paymentRef)
            }}
            className="w-full max-w-md flex flex-col gap-4 carrd-font-body"
          >
            <input type="hidden" name="device_type" value={deviceType} />
            <input type="hidden" name="date" value={selectedDate ?? ''} />
            <input type="hidden" name="tier" value={selectedTier ?? ''} />
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
            <button
              type="submit"
              className="carrd-btn w-full py-3 mt-2"
            >
              Continue to payment
            </button>
          </form>
        </section>

        {/* Payment section */}
        <section
          ref={paymentRef}
          className="w-full flex flex-col items-center gap-6"
        >
          <h2 className="carrd-font-heading text-2xl md:text-3xl">
            Complete your reservation
          </h2>
          {selectedDate && selectedTier ? (
            <>
              <div className="carrd-font-body rounded-lg border border-[#D9D0BF]/40 bg-[#2E0303]/30 px-6 py-4 text-center">
                <p>
                  {dates.find((d) => d.id === selectedDate)?.label} · {selectedTierData?.label}
                </p>
                <p className="mt-2 carrd-font-heading text-xl">
                  ${selectedTierData?.price}
                </p>
              </div>
              {checkoutError && (
                <p className="carrd-font-body text-sm text-red-300" role="alert">
                  {checkoutError}
                </p>
              )}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={async () => {
                  if (!selectedDate || !selectedTier || !formData.name.trim() || !formData.email.trim()) return
                  setIsSubmitting(true)
                  setCheckoutError(null)
                  try {
                    const res = await fetch('/api/checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        dateId: selectedDate,
                        tierId: selectedTier,
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
                className="carrd-btn px-10 py-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Redirecting…' : 'Reserve'}
              </button>
            </>
          ) : (
            <div className="carrd-font-body space-y-4 text-center">
              <p className="opacity-80">
                Select a date and tier above to complete your reservation.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection(joinRef)}
                className="carrd-btn px-8 py-3"
              >
                Choose date & tier
              </button>
            </div>
          )}
        </section>

        {/* Booking notes */}
        <section className="w-full max-w-xl">
          <p className="carrd-font-body font-medium mb-2">A few things to note before booking:</p>
          <ul className="carrd-font-body space-y-2 list-none pl-0">
            {[
              'Doors open at 7pm and close at 11pm. Feel free to join us anytime in this window.',
              'Reservation includes unlimited tea and all other amenities.',
              'We are a phone and laptop-free space.',
              'Unfortunately, we aren\'t able to offer refunds or exchanges for future events.',
              'We\'ll share the location once you make the reservation. If you don\'t hear from us within a few days, please send us an email.',
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[#D9D0BF] mt-1.5 w-2 h-2 rounded-full bg-[#D9D0BF] shrink-0" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <hr className="carrd-divider border-0 my-2" />

        {/* Our story */}
        <section className="w-full flex flex-col items-center gap-4">
          <h2 className="carrd-font-heading text-2xl md:text-3xl">
            our story
          </h2>
          <div className="carrd-font-body-light space-y-4 max-w-xl text-left leading-relaxed">
            <p>
              Welcome to the Midnight Teahouse — a little world being created in San Francisco, born from our shared love of tea, music, community, and beautiful spaces.
            </p>
            <p className="font-medium carrd-font-body">What is Midnight Teahouse?</p>
            <p>
              Our vision is to cultivate a place that becomes both a beloved gathering spot and an inviting home for creative exploration — for ourselves, our community, and the beautiful strangers we meet along the way. We imagine a space to savor: where our body and mind can be softened, our senses delighted. For now, that takes the shape of a curated evening by reservation, with gongfu-style tea service, live music, and quiet corners.
            </p>
            <p className="font-medium carrd-font-body">What&apos;s next?</p>
            <p>
              Eventually, we hope to find a permanent home. We&apos;d love to become a place where artists and musicians gather to play, where friends stop by after a long day or wander in on a quiet Friday looking for adventure.
            </p>
          </div>
        </section>

        <hr className="carrd-divider border-0 my-2" />

        {/* Footer icons */}
        <ul className="flex justify-center gap-4">
          <li>
            <a
              href="mailto:hello@midnightteahouse.com"
              className="text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors"
              aria-label="Email"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 40 40" aria-hidden>
                <path d="M37.5,12.6l-17.5,11.9L2.5,12.6c-.2-.1-.3-.2-.5-.2v-2.7c0-.8.6-1.4,1.4-1.4h33.1c.8,0,1.4.6,1.4,1.4v2.7c-.2,0-.4,0-.5.2ZM19.5,26.3c.2.1.3.2.5.2s.4,0,.5-.2l17.5-11.9v16.9c0,.8-.6,1.4-1.4,1.4H3.4c-.8,0-1.4-.6-1.4-1.4V14.4l17.5,11.9Z" />
              </svg>
            </a>
          </li>
          <li>
            <a
              href="https://instagram.com/midnightteahouse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D9D0BF] hover:text-[#FAE0B9] transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 40 40" aria-hidden>
                <path d="M20,7c4.2,0,4.7,0,6.3,0.1c1.5,0.1,2.3,0.3,3,0.5C30,8,30.5,8.3,31.1,8.9c0.5,0.5,0.9,1.1,1.2,1.8c0.2,0.5,0.5,1.4,0.5,3C33,15.3,33,15.8,33,20s0,4.7-0.1,6.3c-0.1,1.5-0.3,2.3-0.5,3c-0.3,0.7-0.6,1.2-1.2,1.8c-0.5,0.5-1.1,0.9-1.8,1.2c-0.5,0.2-1.4,0.5-3,0.5C24.7,33,24.2,33,20,33s-4.7,0-6.3-0.1c-1.5-0.1-2.3-0.3-3-0.5C10,32,9.5,31.7,8.9,31.1C8.4,30.6,8,30,7.7,29.3c-0.2-0.5-0.5-1.4-0.5-3C7,24.7,7,24.2,7,20s0-4.7,0.1-6.3c0.1-1.5,0.3-2.3,0.5-3C8,10,8.3,9.5,8.9,8.9C9.4,8.4,10,8,10.7,7.7c0.5-0.2,1.4-0.5,3-0.5C15.3,7.1,15.8,7,20,7z" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
