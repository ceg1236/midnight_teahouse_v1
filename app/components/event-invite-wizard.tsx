'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { eventDates, eventTiers } from '../../content/event-invite.config'

type EventInviteWizardProps = {
  welcomeContent: string
  dates: readonly (typeof eventDates)[number][]
  tiers: readonly (typeof eventTiers)[number][]
}

const STEPS = ['welcome', 'date', 'tier', 'form', 'payment'] as const
type Step = (typeof STEPS)[number]

export function EventInviteWizard({ welcomeContent, dates, tiers }: EventInviteWizardProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', notes: '' })
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window.innerWidth
    const hasTouch = 'ontouchstart' in window
    if (w < 768) setDeviceType('mobile')
    else if (hasTouch && w < 1024) setDeviceType('tablet')
    else setDeviceType('desktop')
  }, [])

  const stepIndex = STEPS.indexOf(step)

  const handleNext = () => {
    const i = stepIndex + 1
    if (i < STEPS.length) setStep(STEPS[i])
  }

  const handleBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1])
  }

  const selectedTierData = tiers.find((t) => t.id === selectedTier)

  return (
    <div
      ref={containerRef}
      className="invite-wizard relative flex min-h-[100dvh] flex-col overflow-y-auto md:min-h-screen md:overflow-hidden"
    >
      {/* Progress */}
      <div className="invite-progress fixed left-0 right-0 top-0 z-20 flex gap-1 px-4 py-3 md:px-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= stepIndex ? 'bg-[#f8f6f2]/60' : 'bg-[#f8f6f2]/20'
            }`}
            aria-hidden
          />
        ))}
      </div>

      {/* Step content - key triggers fade-in on step change */}
      <div key={step} className="invite-step invite-step-enter relative flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-16 md:pt-20">
        {step === 'welcome' && (
          <>
            {/* Full-viewport hero video behind title */}
            <div className="fixed inset-0 z-0" aria-hidden>
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
            <div className="invite-welcome invite-welcome-step relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 md:gap-5">
              <h1 className="font-invite text-center text-3xl text-inherit md:text-3xl lg:text-4xl">
                Spring Fling at the Teahouse
              </h1>
              <div className="flex flex-1 flex-col items-center">
                <div className="font-invite space-y-3 text-center text-lg leading-relaxed md:text-xl">
                  {welcomeContent.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="invite-reserve mt-4 rounded-lg bg-[#f8f6f2] px-10 py-4 font-invite text-xl text-[#162143] md:text-2xl"
                >
                  Reserve
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'date' && (
          <div className="invite-dates mx-auto flex w-full max-w-2xl flex-col gap-4 px-2">
            <button
              type="button"
              onClick={handleBack}
              className="self-start font-invite text-[#f8f6f2] hover:opacity-80"
              aria-label="Go back"
            >
              ← Back
            </button>
            <div className="relative mx-auto aspect-[16/10] w-full max-w-md overflow-hidden rounded-lg">
              <Image
                src="/images/art_tea.jpg"
                alt="An intimate evening of tea and connection"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </div>
            <h2 className="font-invite text-center text-2xl">
              Choose your evening
            </h2>
            <div className="flex flex-col gap-3">
              {dates.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setSelectedDate(d.id)
                    handleNext()
                  }}
                  className={`rounded-xl border-2 px-6 py-4 text-left font-invite text-lg transition-colors ${
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
        )}

        {step === 'tier' && (
          <div className="invite-tiers mx-auto flex w-full max-w-2xl flex-col gap-4 px-2">
            <button
              type="button"
              onClick={handleBack}
              className="self-start font-invite text-[#f8f6f2] hover:opacity-80"
              aria-label="Go back"
            >
              ← Back
            </button>
            <div className="relative mx-auto aspect-[16/10] w-full max-w-md overflow-hidden rounded-lg">
              <Image
                src="/images/xf_flowers_tea/xf_teacup.jpg"
                alt="Tea and connection"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </div>
            <h2 className="font-invite text-center text-2xl">
              Select your experience
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {tiers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedTier(t.id)
                    handleNext()
                  }}
                  className={`flex flex-col rounded-xl border-2 p-5 text-center transition-colors ${
                    selectedTier === t.id
                      ? 'border-[#f8f6f2] bg-[#f8f6f2]/10'
                      : 'border-[#f8f6f2]/30 hover:border-[#f8f6f2]/50'
                  }`}
                >
                  <span className="font-invite text-xl">{t.label}</span>
                  <span className="font-invite mt-1 text-base opacity-80">
                    {t.description}
                  </span>
                  <span className="font-invite mt-2 text-xl">${t.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="invite-form mx-auto flex w-full max-w-md flex-col gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="self-start font-invite text-[#f8f6f2] hover:opacity-80"
              aria-label="Go back"
            >
              ← Back
            </button>
            <h2 className="font-invite text-center text-2xl">
              A few details
            </h2>
            <form
              id="invite-form"
              onSubmit={(e) => {
                e.preventDefault()
                handleNext()
              }}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="device_type" value={deviceType} />
              <input type="hidden" name="date" value={selectedDate ?? ''} />
              <input type="hidden" name="tier" value={selectedTier ?? ''} />
              <label className="font-invite">
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
              <label className="font-invite">
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
              <label className="font-invite">
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
                className="invite-reserve mt-2 w-full rounded-lg bg-[#f8f6f2] px-8 py-4 font-invite text-xl text-[#162143]"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div className="invite-payment mx-auto flex max-w-md flex-col items-center gap-6 text-center">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="self-start font-invite text-[#f8f6f2] hover:opacity-80 disabled:opacity-50"
              aria-label="Go back"
            >
              ← Back
            </button>
            <h2 className="font-invite text-2xl">
              Complete your reservation
            </h2>
            <div className="font-invite rounded-xl border border-[#f8f6f2]/40 bg-[#f8f6f2]/5 px-6 py-4">
              <p>
                {dates.find((d) => d.id === selectedDate)?.label} · {selectedTierData?.label}
              </p>
              <p className="mt-2 text-xl">${selectedTierData?.price}</p>
            </div>
            {checkoutError && (
              <p className="font-invite text-sm text-red-300" role="alert">
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
              className="invite-reserve rounded-lg bg-[#f8f6f2] px-10 py-4 font-invite text-xl text-[#162143] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Redirecting…' : 'Reserve'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
