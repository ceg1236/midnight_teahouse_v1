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
  const [formData, setFormData] = useState({ name: '', email: '', dietary: '', notes: '' })
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window)
    setDeviceType(isMobile ? 'mobile' : 'desktop')
  }, [])

  const stepIndex = STEPS.indexOf(step)
  const canProceed =
    (step === 'welcome') ||
    (step === 'date' && selectedDate) ||
    (step === 'tier' && selectedTier) ||
    (step === 'form' && formData.name && formData.email) ||
    step === 'payment'

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

      {/* Step content */}
      <div className="invite-step flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-16 md:pb-12 md:pt-20">
        {step === 'welcome' && (
          <div className="invite-welcome invite-welcome-step mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 md:gap-5">
            <h1 className="font-invite text-center text-2xl text-inherit md:text-3xl lg:text-4xl">
              Spring Fling at the Teahouse
            </h1>
            {/* Text body flanked by images */}
            <div className="flex w-full items-stretch justify-center gap-4 md:gap-6">
              <div className="relative hidden w-24 shrink-0 md:block lg:w-28" style={{ minHeight: 320 }}>
                <Image
                  src="/images/xf_flowers_tea/xf_white_flowers_2.jpg"
                  alt=""
                  fill
                  className="rounded-lg object-cover"
                  sizes="112px"
                  aria-hidden
                />
              </div>
              <div className="flex flex-1 flex-col items-center">
                {/* Invite text - tweak size: text-base/text-lg, space-y-2/3, leading-snug/relaxed */}
                <div className="font-invite space-y-3 text-center text-base leading-relaxed md:text-lg">
                  {welcomeContent.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="invite-reserve mt-4 rounded-lg bg-[#f8f6f2] px-8 py-3 font-invite text-[#162143]"
                >
                  Reserve
                </button>
              </div>
              <div className="relative hidden w-24 shrink-0 md:block lg:w-28" style={{ minHeight: 320 }}>
                <Image
                  src="/images/xf_flowers_tea/xf_plant_yellow_3.jpg"
                  alt=""
                  fill
                  className="rounded-lg object-cover"
                  sizes="112px"
                  aria-hidden
                />
              </div>
            </div>
            {/* Mobile: images below text */}
            <div className="flex gap-4 md:hidden">
              <Image
                src="/images/xf_flowers_tea/xf_white_flowers_2.jpg"
                alt=""
                width={80}
                height={100}
                className="rounded-lg object-cover"
                aria-hidden
              />
              <Image
                src="/images/xf_flowers_tea/xf_plant_yellow_3.jpg"
                alt=""
                width={80}
                height={100}
                className="rounded-lg object-cover"
                aria-hidden
              />
            </div>
          </div>
        )}

        {step === 'date' && (
          <div className="invite-dates mx-auto flex max-w-md flex-col gap-6">
            <h2 className="font-invite text-center text-2xl">
              Choose your evening
            </h2>
            <div className="flex flex-col gap-3">
              {dates.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDate(d.id)}
                  className={`rounded-xl border-2 px-6 py-4 text-left font-invite transition-colors ${
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
          <div className="invite-tiers mx-auto flex max-w-lg flex-col gap-6">
            <h2 className="font-invite text-center text-2xl">
              Select your experience
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {tiers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTier(t.id)}
                  className={`flex flex-col rounded-xl border-2 p-5 text-center transition-colors ${
                    selectedTier === t.id
                      ? 'border-[#f8f6f2] bg-[#f8f6f2]/10'
                      : 'border-[#f8f6f2]/30 hover:border-[#f8f6f2]/50'
                  }`}
                >
                  <span className="font-invite text-lg">{t.label}</span>
                  <span className="font-invite mt-1 text-sm opacity-80">
                    {t.description}
                  </span>
                  <span className="font-invite mt-2">${t.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="invite-form mx-auto w-full max-w-md space-y-6">
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
                Dietary preferences
                <input
                  type="text"
                  name="dietary"
                  value={formData.dietary}
                  onChange={(e) => setFormData((d) => ({ ...d, dietary: e.target.value }))}
                  className="invite-input mt-1 w-full rounded-lg border border-[#f8f6f2]/40 bg-[#f8f6f2]/5 px-4 py-3 text-inherit placeholder:text-inherit/50 focus:border-[#f8f6f2] focus:outline-none"
                  placeholder="Vegetarian, allergies, etc."
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
            </form>
          </div>
        )}

        {step === 'payment' && (
          <div className="invite-payment mx-auto flex max-w-md flex-col items-center gap-6 text-center">
            <h2 className="font-invite text-2xl">
              Complete your reservation
            </h2>
            <div className="font-invite rounded-xl border border-[#f8f6f2]/40 bg-[#f8f6f2]/5 px-6 py-4">
              <p>
                {dates.find((d) => d.id === selectedDate)?.label} · {selectedTierData?.label}
              </p>
              <p className="mt-2 text-xl">${selectedTierData?.price}</p>
            </div>
            <p className="font-invite text-sm opacity-70">
              Stripe payment will be integrated here. For now, this completes the flow.
            </p>
          </div>
        )}
      </div>

      {/* Nav buttons - hidden on welcome step */}
      {step !== 'welcome' && (
      <div className="invite-nav fixed bottom-0 left-0 right-0 z-20 flex justify-between gap-4 border-t border-[#f8f6f2]/20 bg-[#162143]/95 px-6 py-4 backdrop-blur-sm md:px-8">
        <button
          type="button"
          onClick={handleBack}
          disabled={stepIndex === 0}
          className="font-invite rounded-lg px-6 py-2 disabled:opacity-30"
        >
          Back
        </button>
        {step === 'form' ? (
          <button
            type="submit"
            form="invite-form"
            className="invite-next rounded-lg bg-[#f8f6f2] px-6 py-2 font-invite text-[#162143]"
          >
            Next
          </button>
        ) : step === 'payment' ? (
          <button
            type="button"
            onClick={handleNext}
            className="invite-next rounded-lg bg-[#f8f6f2] px-6 py-2 font-invite text-[#162143]"
          >
            Reserve (Stripe placeholder)
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed}
            className="invite-next rounded-lg bg-[#f8f6f2] px-6 py-2 font-invite text-[#162143] disabled:opacity-50"
          >
            Next
          </button>
        )}
      </div>
      )}
    </div>
  )
}
