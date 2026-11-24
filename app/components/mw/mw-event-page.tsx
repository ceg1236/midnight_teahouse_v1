'use client'

import { useEffect, useRef, useState } from 'react'
import type { EventDate, EventTier } from '../../../content/event-schema'
import { apiPath } from '../../../lib/client-api-url'
import { decodeTokenPayload } from '../../../lib/admin-token-decode'
import { resolveDoorDate } from '../../../lib/door-date'
import { AnimatedTitle } from './animated-title'
import { MwNav } from './mw-nav'
import { MwFooter } from './mw-footer'
import { FirefliesLayer } from './fireflies-layer'
import { MwNewsletterForm } from './mw-newsletter-form'

type MwEventPageProps = {
  eventSlug: string
  dates: readonly EventDate[]
  tiers: readonly EventTier[]
  soldOutByDateId: Record<string, boolean>
  /** Admin/door-sale token: bypasses sold-out and pre-fills date/tier. */
  initialTicket?: string
}

const MAX_QTY = 4
const SUPPORTED_MIN = 20

const NOTES = [
  'Doors open at 7pm and close at 11pm. Join us anytime in this window.',
  'Reservation includes unlimited tea and all other amenities.',
  'We are a device- and shoes-free space.',
  "Unfortunately, we don't offer refunds or exchanges for future events. You're welcome to gift your ticket to another guest, and they can give us your email at the door.",
]

function deviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop'
  const w = window.innerWidth
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

export function MwEventPage({ eventSlug, dates, tiers, soldOutByDateId, initialTicket }: MwEventPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [bypassSoldOut, setBypassSoldOut] = useState(false)
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null)
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showSupported, setShowSupported] = useState(false)
  const [supportedPrice, setSupportedPrice] = useState(SUPPORTED_MIN)
  const [supportedPriceInput, setSupportedPriceInput] = useState(String(SUPPORTED_MIN))
  const [showPricingNote, setShowPricingNote] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const sectionRef = useRef<HTMLDivElement>(null)
  const reserveButtonRef = useRef<HTMLAnchorElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  useEffect(() => {
    if (!initialTicket) return
    const payload = decodeTokenPayload(initialTicket)
    if (!payload) return
    setBypassSoldOut(true)
    if (payload.door) {
      const today = new Date().toISOString().slice(0, 10)
      const doorDateId = resolveDoorDate(today, dates)
      if (doorDateId) {
        setSelectedDateId(doorDateId)
        setSelectedTierId('community')
        setQuantity(1)
        setStep(3)
      }
    } else if (payload.dateId && dates.some((d) => d.id === payload.dateId)) {
      setSelectedDateId(payload.dateId)
      if (payload.tierId && tiers.some((t) => t.id === payload.tierId)) {
        setSelectedTierId(payload.tierId)
        setQuantity(1)
        setStep(3)
      } else {
        setStep(2)
      }
    }
    // payload.open: no date/tier preset, just bypass sold-out (stays on step 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTicket])

  const effectiveSoldOut = bypassSoldOut ? {} : soldOutByDateId
  const selectedDate = dates.find((d) => d.id === selectedDateId) ?? null
  const community = tiers.find((t) => t.id === 'community')
  const patron = tiers.find((t) => t.id === 'patron')
  const supported = tiers.find((t) => t.id === 'supported')
  const selectedTier = tiers.find((t) => t.id === selectedTierId) ?? null

  const supportedPriceValid = selectedTierId !== 'supported' || supportedPrice >= SUPPORTED_MIN
  const canContinue = !!selectedTierId && quantity >= 1 && supportedPriceValid

  const unitPrice = selectedTierId === 'supported' ? supportedPrice : selectedTier?.price ?? 0
  const total = unitPrice * quantity

  function chooseDate(dateId: string) {
    setSelectedDateId(dateId)
    setStep(2)
  }

  function selectTier(tierId: string) {
    setSelectedTierId(tierId)
    setQuantity(1)
    if (tierId === 'supported') {
      setSupportedPrice(SUPPORTED_MIN)
      setSupportedPriceInput(String(SUPPORTED_MIN))
    }
  }

  function clearTier() {
    setSelectedTierId(null)
    setQuantity(1)
  }

  async function finishBooking() {
    if (!selectedDateId || !selectedTierId || !name.trim() || !email.trim()) return
    setIsSubmitting(true)
    setCheckoutError(null)
    try {
      const items = [
        {
          tierId: selectedTierId,
          quantity,
          ...(selectedTierId === 'supported' && { supportedPrice }),
        },
      ]
      const res = await fetch(apiPath('/api/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug,
          dateId: selectedDateId,
          items,
          supportedPrice: selectedTierId === 'supported' ? supportedPrice : undefined,
          name: name.trim(),
          email: email.trim(),
          notes: notes.trim(),
          device: deviceType(),
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
  }

  return (
    <div className="mw-page mw-page--event min-h-[100dvh]">
      <FirefliesLayer />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <MwNav variant="event" />

        <main className="flex flex-1 flex-col items-center">
          {/* Invitation */}
          <section className="flex w-full flex-col items-center gap-4 px-6 py-14 text-center">
            <p className="mw-font-body text-[19px] italic text-[var(--mw-text-muted)]">You&rsquo;re invited to</p>
            <AnimatedTitle text="Make a Wish" className="text-[clamp(72px,12vw,140px)]" />
            <p className="mw-font-body text-[19px] italic text-[var(--mw-text-muted)]">
              Winter gathering at Midnight Teahouse
            </p>
            <div className="mw-font-body mt-4 flex flex-col gap-1 text-[18px] leading-[1.6] text-[var(--mw-text)] sm:text-[20px]">
              <p>December 15–17 · Tue–Thu · 7–11 pm</p>
              <p>
                By reservation ·{' '}
                <span className="sm:hidden">SoMa, SF</span>
                <span className="hidden sm:inline">SoMa, San Francisco</span>
              </p>
            </div>
            <a ref={reserveButtonRef} href="#evenings" className="mw-btn-primary mt-6">
              Reserve your seat
            </a>
          </section>

          {/* Film */}
          <section className="w-full max-w-[960px] px-6 pb-16">
            <div className="carrd-video-fade overflow-hidden rounded-[6px]">
              <video
                className="aspect-[1732/968] w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster="/images/fire_tea_pouring_poster.jpg"
                aria-label="Tea being poured from a glass pitcher into a small cup beside a fire"
              >
                <source src="/images/fire_tea_pouring.mp4" type="video/mp4" />
              </video>
            </div>
          </section>

          {/* Letter */}
          <section className="mw-font-body w-full max-w-[600px] px-6 pb-16 text-[19px] leading-[1.75] text-[var(--mw-text)]">
            <div className="flex flex-col gap-5">
              <p className="text-[21px] italic text-[var(--mw-text-strong)]">Dear friends,</p>
              <p>
                We&rsquo;ve been hosting tea gatherings at Midnight Teahouse for over a year now. So many of our
                wishes have come true: beautiful gatherings, budding friendships, delightful experiments.
                We&rsquo;re excited to make room for more in the new year.
              </p>
              <p>
                As we enter a season of celebration and reflection, we invite you to join us for three evenings
                of tea, music and connection, a chance to slow down and settle in.
              </p>
              <p>
                As always, we&rsquo;ll be pouring tea all night, with live improvised sets from some of our
                favorite musicians, art supplies and cozy corners to curl up in. For this special holiday
                edition, we&rsquo;ll also have a small tasting room and market with treasures from our recent
                trip to China and Taiwan.
              </p>
              <p>Come alone or bring a friend, for rest, play and discovery. We can&rsquo;t wait to see you.</p>
              <p className="text-[22px] italic text-[var(--mw-text-strong)]">
                With warmth,
                <br />
                Midnight Teahouse team
              </p>
            </div>
          </section>

          {/* The details */}
          <section className="w-full max-w-[720px] px-6 pb-16">
            <h2 className="mw-font-aboreto mb-6 text-center text-2xl tracking-[0.08em] text-[var(--mw-text-strong)]">
              The details
            </h2>
            <dl className="mw-font-body flex flex-col">
              <DetailRow label="When" value="Doors open at 7 pm. Arrive anytime." />
              <DetailRow
                label="Where"
                value="A beautiful home in SoMa, San Francisco"
                note="We'll share the address once you make a reservation."
              />
              <DetailRow
                label="Included"
                value="Gongfu tea tables, live music, art-making"
                note="Featuring curated teas and teaware from China and Taiwan"
              />
              <DetailRow label="Good to know" value="The teahouse is a device- and shoes-free space." last />
            </dl>
          </section>

          {/* Reservation flow */}
          <section id="evenings" ref={sectionRef} className="w-full scroll-mt-4 px-6 pb-20">
            {step === 1 && (
              <div className="mw-step-enter mx-auto flex w-full max-w-[880px] flex-col gap-8">
                <StepHeader n={1} title="Choose your evening" subline="We have limited space. Save your seat." />
                <div className="flex flex-col">
                  {dates.map((d, i) => (
                    <div
                      key={d.id}
                      className="flex flex-col gap-4 border-[var(--mw-line)] py-7 sm:flex-row sm:items-center sm:gap-6"
                      style={{ borderTopWidth: i === 0 ? 1 : 0, borderBottomWidth: 1 }}
                    >
                      <div className="mw-font-body sm:w-[140px] sm:shrink-0">
                        <p className="text-[18px] text-[var(--mw-text-strong)]">{d.day}</p>
                        <p className="text-[16px] text-[var(--mw-text-muted)]">
                          {d.dateTime.replace(/,.*/, '')}
                        </p>
                      </div>
                      <div className="mw-font-body flex-1">
                        <p className="text-[17px] font-bold text-[var(--mw-text-strong)]">{d.musicianTitle}</p>
                        <p className="text-[17px] leading-relaxed text-[var(--mw-text-tier)]">{d.shortBio}</p>
                        {d.websiteUrl ? (
                          <a href={d.websiteUrl} target="_blank" rel="noopener noreferrer" className="mw-link text-sm">
                            Listen
                          </a>
                        ) : null}
                      </div>
                      <div className="sm:shrink-0">
                        {effectiveSoldOut[d.id] ? (
                          <button type="button" disabled className="mw-btn-outline" aria-disabled>
                            Sold out
                          </button>
                        ) : selectedDateId === d.id ? (
                          <button
                            type="button"
                            aria-pressed
                            onClick={() => chooseDate(d.id)}
                            className="mw-btn-outline mw-btn-outline--chosen"
                          >
                            Selected
                          </button>
                        ) : (
                          <button type="button" aria-pressed={false} onClick={() => chooseDate(d.id)} className="mw-btn-outline">
                            Select
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mw-font-body text-center text-[16px] text-[var(--mw-text-muted)]">
                  If you can&rsquo;t make these dates, <a href="#mailing-list" className="mw-link">join our mailing list</a> to
                  hear about future gatherings.
                </p>
              </div>
            )}

            {step === 2 && selectedDate && (
              <div className="mw-step-enter mx-auto flex w-full max-w-[760px] flex-col gap-6">
                <BackLink onClick={() => setStep(1)} />
                <StepHeader
                  n={2}
                  title="Choose your ticket"
                  subline={`${selectedDate.label} · 7–11 pm`}
                />

                <TierRow
                  tier={community}
                  isFirst
                  selected={selectedTierId === 'community'}
                  quantity={quantity}
                  onSelect={() => selectTier('community')}
                  onQtyChange={setQuantity}
                  onRemove={clearTier}
                />
                <TierRow
                  tier={patron}
                  selected={selectedTierId === 'patron'}
                  quantity={quantity}
                  onSelect={() => selectTier('patron')}
                  onQtyChange={setQuantity}
                  onRemove={clearTier}
                />

                {!showSupported && (
                  <p className="mw-font-body text-[16px] text-[var(--mw-text-muted)]">
                    If cost is a barrier, please consider our{' '}
                    <button
                      type="button"
                      aria-expanded={showSupported}
                      onClick={() => setShowSupported(true)}
                      className="mw-link"
                    >
                      supported ticket option
                    </button>
                    .
                  </p>
                )}
                {showSupported && supported && (
                  <SupportedTierRow
                    tier={supported}
                    selected={selectedTierId === 'supported'}
                    quantity={quantity}
                    price={supportedPrice}
                    priceInput={supportedPriceInput}
                    onSelect={() => selectTier('supported')}
                    onQtyChange={setQuantity}
                    onRemove={() => {
                      clearTier()
                      setShowSupported(false)
                    }}
                    onPriceInputChange={(v) => {
                      setSupportedPriceInput(v)
                      const n = Number(v)
                      if (Number.isFinite(n)) setSupportedPrice(n)
                    }}
                    onHide={() => {
                      if (selectedTierId === 'supported') clearTier()
                      setShowSupported(false)
                    }}
                  />
                )}

                <div>
                  <button
                    type="button"
                    aria-expanded={showPricingNote}
                    onClick={() => setShowPricingNote((v) => !v)}
                    className="mw-link text-[16px]"
                  >
                    About our pricing {showPricingNote ? '▴' : '▾'}
                  </button>
                  {showPricingNote && (
                    <p className="mw-font-body mt-2 text-[16px] leading-relaxed text-[var(--mw-text-soft)]">
                      Our city and community span a wide range of financial situations. Our tiered pricing helps
                      us balance making the teahouse both financially sustainable and accessible. We invite you
                      to choose the level that feels right for you — one that honors your own capacity while
                      helping us keep this space open, welcoming and alive.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep(3)}
                  className="mw-btn-primary mx-auto mt-4"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 3 && selectedDate && selectedTier && (
              <div className="mw-step-enter mx-auto flex w-full max-w-[600px] flex-col gap-6">
                <BackLink onClick={() => setStep(2)} />
                <StepHeader n={3} title="Complete your reservation" />

                <div
                  className="flex flex-col gap-3 rounded-[6px] border px-6 py-5"
                  style={{ borderColor: 'var(--mw-line-card)' }}
                >
                  <SummaryRow label="Date" value={`${selectedDate.label}\n7–11 pm`} />
                  <SummaryRow
                    label="Tickets"
                    value={`${selectedTier.label} — $${unitPrice} × ${quantity} = $${total}`}
                  />
                  <div className="border-t pt-3" style={{ borderColor: 'var(--mw-line)' }}>
                    <p className="mw-font-body text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--mw-text-muted)]">
                      Total
                    </p>
                    <p className="mw-font-body text-[22px] font-bold text-[var(--mw-gold)]">${total}</p>
                  </div>
                </div>

                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault()
                    finishBooking()
                  }}
                >
                  <label className="flex flex-col gap-2">
                    <span className="mw-font-body text-sm text-[var(--mw-text-muted)]">Name *</span>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mw-input"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="mw-font-body text-sm text-[var(--mw-text-muted)]">Email *</span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mw-input"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="mw-font-body text-sm text-[var(--mw-text-muted)]">Notes</span>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Anything else we should know?"
                      className="mw-input mw-textarea"
                    />
                  </label>

                  <div className="mw-font-body text-[16px] text-[var(--mw-text)]">
                    <p className="mb-2 font-bold">A few things to note before booking:</p>
                    <ul className="flex flex-col gap-1.5 pl-5" style={{ listStyleType: 'disc' }}>
                      {NOTES.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                      <li>
                        If you have any questions about the reservation, please{' '}
                        <a href="mailto:midnight.teahouse.sf@gmail.com" className="mw-link">
                          send us an email
                        </a>
                        .
                      </li>
                    </ul>
                  </div>

                  {checkoutError ? (
                    <p role="alert" className="text-sm" style={{ color: 'var(--mw-error)' }}>
                      {checkoutError}
                    </p>
                  ) : null}

                  <button type="submit" disabled={isSubmitting} className="mw-btn-primary mx-auto mt-2">
                    {isSubmitting ? 'Redirecting…' : 'Finish Booking'}
                  </button>
                </form>
              </div>
            )}
          </section>

          {/* Mailing list */}
          <section id="mailing-list" className="mw-font-body w-full max-w-[600px] scroll-mt-4 px-6 pb-20 text-center">
            <h2 className="mw-font-aboreto mb-3 text-xl tracking-[0.06em] text-[var(--mw-text-strong)]">
              Join our mailing list
            </h2>
            <p className="mb-6 text-[17px] text-[var(--mw-text-muted)]">
              Hear about future gatherings before they&rsquo;re announced here.
            </p>
            <MwNewsletterForm />
          </section>
        </main>

        <MwFooter variant="event" />
      </div>

      <MwStickyReserveBar reserveButtonRef={reserveButtonRef} sectionRef={sectionRef} />
    </div>
  )
}

function DetailRow({
  label,
  value,
  note,
  last,
}: {
  label: string
  value: string
  note?: string
  last?: boolean
}) {
  return (
    <div
      className="flex flex-col gap-1 border-[var(--mw-line)] py-[18px] sm:flex-row sm:gap-6"
      style={{ borderTopWidth: 1, borderBottomWidth: last ? 1 : 0 }}
    >
      <p className="text-[17px] text-[var(--mw-text-muted)] sm:w-[132px] sm:shrink-0">{label}</p>
      <div>
        <p className="text-[18px] text-[var(--mw-text)]">{value}</p>
        {note ? <p className="mt-1 text-[16px] text-[var(--mw-text-muted)]">{note}</p> : null}
      </div>
    </div>
  )
}

function StepHeader({ n, title, subline }: { n: number; title: string; subline?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="mw-font-body text-[15px] font-bold uppercase tracking-[0.14em] text-[var(--mw-text-muted)]">
        Step {n} of 3
      </p>
      <h2 className="mw-font-aboreto text-2xl tracking-[0.08em] text-[var(--mw-text-strong)]">{title}</h2>
      {subline ? <p className="mw-font-body text-[17px] text-[var(--mw-text-muted)]">{subline}</p> : null}
    </div>
  )
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mw-link self-start text-[16px]">
      ← Back
    </button>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mw-font-body text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--mw-text-muted)]">
        {label}
      </p>
      <p className="mw-font-body whitespace-pre-line text-[18px] text-[var(--mw-text-strong)]">{value}</p>
    </div>
  )
}

function TierRow({
  tier,
  selected,
  quantity,
  onSelect,
  onQtyChange,
  onRemove,
  isFirst,
}: {
  tier?: EventTier
  selected: boolean
  quantity: number
  onSelect: () => void
  onQtyChange: (q: number) => void
  onRemove: () => void
  isFirst?: boolean
}) {
  if (!tier) return null
  return (
    <div
      className="flex flex-col gap-3 border-[var(--mw-line)] py-[30px] sm:flex-row sm:items-center sm:gap-6"
      style={{ borderTopWidth: isFirst ? 1 : 0, borderBottomWidth: 1 }}
    >
      <div className="mw-font-body sm:w-[120px] sm:shrink-0">
        <p className="text-[18px] font-bold text-[var(--mw-text-strong)]">{tier.label}</p>
        <p className="text-[18px] font-bold text-[var(--mw-gold)]">${tier.price}</p>
      </div>
      <div className="mw-font-body flex-1">
        <p className="text-[17px] italic text-[var(--mw-text)]">{tier.mainLine}</p>
        <p className="text-[17px] leading-relaxed text-[var(--mw-text-tier)]">{tier.blurb}</p>
      </div>
      <div className="sm:shrink-0">
        {selected ? (
          <Stepper quantity={quantity} onChange={onQtyChange} onZero={onRemove} label={tier.label} />
        ) : (
          <button type="button" onClick={onSelect} className="mw-btn-outline">
            Select
          </button>
        )}
      </div>
    </div>
  )
}

function SupportedTierRow({
  tier,
  selected,
  quantity,
  price,
  priceInput,
  onSelect,
  onQtyChange,
  onRemove,
  onPriceInputChange,
  onHide,
}: {
  tier: EventTier
  selected: boolean
  quantity: number
  price: number
  priceInput: string
  onSelect: () => void
  onQtyChange: (q: number) => void
  onRemove: () => void
  onPriceInputChange: (v: string) => void
  onHide: () => void
}) {
  const invalid = selected && price < SUPPORTED_MIN
  return (
    <div
      className="flex flex-col gap-3 border-[var(--mw-line)] py-[30px] sm:flex-row sm:items-center sm:gap-6"
      style={{ borderTopWidth: 0, borderBottomWidth: 1 }}
    >
      <div className="mw-font-body sm:w-[120px] sm:shrink-0">
        <p className="text-[18px] font-bold text-[var(--mw-text-strong)]">{tier.label}</p>
        <p className="text-[18px] font-bold text-[var(--mw-gold)]">$20+</p>
      </div>
      <div className="mw-font-body flex-1">
        <p className="text-[17px] italic text-[var(--mw-text)]">{tier.mainLine}</p>
        <p className="text-[17px] leading-relaxed text-[var(--mw-text-tier)]">{tier.blurb}</p>
        {invalid ? (
          <p role="alert" className="mt-1 text-sm" style={{ color: 'var(--mw-error)' }}>
            Supported tickets start at $20.
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-3 sm:shrink-0">
        {selected ? (
          <>
            <span className="mw-font-body text-[18px] text-[var(--mw-text-strong)]">$</span>
            <input
              type="number"
              min={SUPPORTED_MIN}
              value={priceInput}
              onChange={(e) => onPriceInputChange(e.target.value)}
              aria-label="Supported ticket price"
              className={`mw-input text-center ${invalid ? 'mw-input--error' : ''}`}
              style={{ width: '64px', height: '44px', padding: 0 }}
            />
            <Stepper quantity={quantity} onChange={onQtyChange} onZero={onRemove} label={tier.label} />
          </>
        ) : (
          <button type="button" onClick={onSelect} className="mw-btn-outline">
            Select
          </button>
        )}
        {selected ? (
          <button type="button" onClick={onHide} className="mw-link text-sm">
            Hide
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Stepper({
  quantity,
  onChange,
  onZero,
  label,
}: {
  quantity: number
  onChange: (q: number) => void
  onZero: () => void
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`Decrease ${label} quantity`}
        onClick={() => (quantity <= 1 ? onZero() : onChange(quantity - 1))}
        className="mw-stepper-btn"
      >
        −
      </button>
      <span className="mw-font-body min-w-[28px] text-center text-[18px] font-bold text-[var(--mw-text-strong)]">
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label} quantity`}
        disabled={quantity >= MAX_QTY}
        onClick={() => onChange(Math.min(MAX_QTY, quantity + 1))}
        className="mw-stepper-btn"
      >
        +
      </button>
    </div>
  )
}

function MwStickyReserveBar({
  reserveButtonRef,
  sectionRef,
}: {
  reserveButtonRef: React.RefObject<HTMLAnchorElement | null>
  sectionRef: React.RefObject<HTMLDivElement | null>
}) {
  const [heroVisible, setHeroVisible] = useState(true)
  const [sectionVisible, setSectionVisible] = useState(false)

  useEffect(() => {
    const heroEl = reserveButtonRef.current
    const sectionEl = sectionRef.current
    if (!heroEl || !sectionEl) return

    const heroObserver = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      threshold: 0,
    })
    const sectionObserver = new IntersectionObserver(([entry]) => setSectionVisible(entry.isIntersecting), {
      threshold: 0,
    })
    heroObserver.observe(heroEl)
    sectionObserver.observe(sectionEl)
    return () => {
      heroObserver.disconnect()
      sectionObserver.disconnect()
    }
  }, [reserveButtonRef, sectionRef])

  const show = !heroVisible && !sectionVisible

  if (!show) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t px-4 py-3 md:hidden"
      style={{
        background: 'rgba(12,16,22,0.92)',
        backdropFilter: 'blur(8px)',
        borderColor: 'var(--mw-line-footer)',
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
      }}
    >
      <p className="mw-font-body text-[15px] text-[var(--mw-text-soft)]">Dec 15–17 · from $40</p>
      <a href="#evenings" className="mw-btn-primary" style={{ minHeight: '48px', padding: '0 24px' }}>
        Reserve
      </a>
    </div>
  )
}
