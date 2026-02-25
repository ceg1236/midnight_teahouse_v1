'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { eventDates, eventTiers } from '../../content/event-invite.config'

const STORAGE_KEY = 'teahouse_reservation'

type EventInviteWizardProps = {
  welcomeContent: string
  dates: readonly (typeof eventDates)[number][]
  tiers: readonly (typeof eventTiers)[number][]
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

export function EventInviteWizard({ welcomeContent, dates, tiers }: EventInviteWizardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' })
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const dateRef = useRef<HTMLElement>(null)
  const tierRef = useRef<HTMLElement>(null)
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
    <div className="invite-wizard relative flex flex-col overflow-y-auto">
      {/* Section 1: Welcome (hero with video) */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-12 pt-16 md:min-h-screen md:pt-20">
        <div className="absolute inset-0 z-0" aria-hidden>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/images/midnight_site_vid_hi_res.mp4" type="video/mp4" />
            <source src="/images/midnight_site_vid_hi_res.mov" type="video/quicktime" />
          </video>
          <div className="absolute inset-0 bg-[#162143]/60" aria-hidden />
        </div>
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-4 md:gap-5">
          <h1 className="font-invite-title text-center text-3xl text-inherit md:text-3xl lg:text-4xl">
            Spring Fling at the Teahouse
          </h1>
          <div className="font-invite-body space-y-3 text-center text-lg leading-relaxed md:text-xl">
            {welcomeContent.split(/\n\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollToSection(dateRef)}
            className="invite-reserve mt-4 rounded-lg bg-[#f8f6f2] px-10 py-4 font-invite-title text-xl text-[#162143] md:text-2xl"
          >
            Reserve
          </button>
        </div>
      </section>

      {/* Section 2: Date */}
      <section
        ref={dateRef}
        className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 md:min-h-screen md:py-20"
      >
        <div className="invite-dates mx-auto flex w-full max-w-2xl flex-col gap-4 px-2">
          <h2 className="font-invite-title text-center text-2xl">
            Choose your evening
          </h2>
          <div className="relative mx-auto aspect-[16/10] w-full max-w-md overflow-hidden rounded-lg">
            <Image
              src="/images/art_tea.jpg"
              alt="An intimate evening of tea and connection"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          </div>
          <div className="flex flex-col gap-3">
            {dates.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setSelectedDate(d.id)
                  scrollToSection(tierRef)
                }}
                className={`rounded-xl border-2 px-6 py-4 text-left font-invite-body text-lg transition-colors ${
                  selectedDate === d.id
                    ? 'border-[#f8f6f2] bg-[#f8f6f2]/10'
                    : 'border-[#f8f6f2]/30 hover:border-[#f8f6f2]/50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Tier */}
      <section
        ref={tierRef}
        className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 md:min-h-screen md:py-20"
      >
        <div className="invite-tiers mx-auto flex w-full max-w-2xl flex-col gap-4 px-2">
          <h2 className="font-invite-title text-center text-2xl">
            Select your experience
          </h2>
          <div className="relative mx-auto aspect-[16/10] w-full max-w-md overflow-hidden rounded-lg">
            <Image
              src="/images/xf_flowers_tea/xf_teacup.jpg"
              alt="Tea and connection"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {tiers.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelectedTier(t.id)
                  scrollToSection(formRef)
                }}
                className={`flex flex-col rounded-xl border-2 p-5 text-center transition-colors font-invite-body ${
                  selectedTier === t.id
                    ? 'border-[#f8f6f2] bg-[#f8f6f2]/10'
                    : 'border-[#f8f6f2]/30 hover:border-[#f8f6f2]/50'
                }`}
              >
                <span className="font-invite-title text-xl">{t.label}</span>
                <span className="mt-1 text-base opacity-80">
                  {t.description}
                </span>
                <span className="mt-2 font-invite-title text-xl">${t.price}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Form */}
      <section
        ref={formRef}
        className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 md:min-h-screen md:py-20"
      >
        <div className="invite-form mx-auto flex w-full max-w-md flex-col gap-4">
          <h2 className="font-invite-title text-center text-2xl">
            A few details
          </h2>
          <form
            id="invite-form"
            onSubmit={(e) => {
              e.preventDefault()
              scrollToSection(paymentRef)
            }}
            className="flex flex-col gap-4 font-invite-body"
          >
            <input type="hidden" name="device_type" value={deviceType} />
            <input type="hidden" name="date" value={selectedDate ?? ''} />
            <input type="hidden" name="tier" value={selectedTier ?? ''} />
            <label>
              Name *
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
                className="invite-input mt-1 w-full rounded-lg border border-[#f8f6f2]/40 bg-[#f8f6f2]/5 px-4 py-3 text-inherit placeholder:text-inherit/50 focus:border-[#f8f6f2] focus:outline-none"
                placeholder="Your name"
              />
            </label>
            <label>
              Email *
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))}
                className="invite-input mt-1 w-full rounded-lg border border-[#f8f6f2]/40 bg-[#f8f6f2]/5 px-4 py-3 text-inherit placeholder:text-inherit/50 focus:border-[#f8f6f2] focus:outline-none"
                placeholder="you@example.com"
              />
            </label>
            <label>
              Notes
              <textarea
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData((d) => ({ ...d, notes: e.target.value }))}
                rows={2}
                className="invite-input mt-1 w-full resize-none rounded-lg border border-[#f8f6f2]/40 bg-[#f8f6f2]/5 px-4 py-3 text-inherit placeholder:text-inherit/50 focus:border-[#f8f6f2] focus:outline-none"
                placeholder="Anything else we should know?"
              />
            </label>
            <button
              type="submit"
              className="invite-reserve mt-2 w-full rounded-lg bg-[#f8f6f2] px-8 py-4 font-invite-title text-xl text-[#162143]"
            >
              Continue
            </button>
          </form>
        </div>
      </section>

      {/* Section 5: Payment */}
      <section
        ref={paymentRef}
        className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-16 md:min-h-screen md:py-20"
      >
        <div className="invite-payment mx-auto flex max-w-md flex-col items-center gap-6 text-center">
          <h2 className="font-invite-title text-2xl">
            Complete your reservation
          </h2>
          {selectedDate && selectedTier ? (
            <>
              <div className="font-invite-body rounded-xl border border-[#f8f6f2]/40 bg-[#f8f6f2]/5 px-6 py-4">
                <p>
                  {dates.find((d) => d.id === selectedDate)?.label} · {selectedTierData?.label}
                </p>
                <p className="mt-2 font-invite-title text-xl">${selectedTierData?.price}</p>
              </div>
              {checkoutError && (
                <p className="font-invite-body text-sm text-red-300" role="alert">
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
                className="invite-reserve rounded-lg bg-[#f8f6f2] px-10 py-4 font-invite-title text-xl text-[#162143] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Redirecting…' : 'Reserve'}
              </button>
            </>
          ) : (
            <div className="font-invite-body space-y-4">
              <p className="opacity-80">
                Select a date and tier above to complete your reservation.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection(dateRef)}
                className="invite-reserve rounded-lg bg-[#f8f6f2]/80 px-8 py-3 font-invite-title text-lg text-[#162143]"
              >
                Choose date & tier
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
