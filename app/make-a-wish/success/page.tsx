'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getEventConfig } from '../../../lib/event-registry'
import {
  getAddressMapUrl,
  getCalendarDescription,
  getCalendarEventTitle,
  getEventPracticalNotes,
  getGoogleCalendarUrl,
} from '../../../lib/event-messaging'
import { MwNav } from '../../components/mw/mw-nav'
import { MwFooter } from '../../components/mw/mw-footer'
import { FirefliesLayer } from '../../components/mw/fireflies-layer'

const STORAGE_KEY = 'teahouse_reservation'

function MakeAWishSuccessContent() {
  const event = getEventConfig('holiday-showcase-event')
  const searchParams = useSearchParams()
  const dateId = searchParams.get('date_id') ?? ''
  const selectedDate = dateId ? event.dates.find((d) => d.id === dateId) : event.dates[0]
  const dateLabel = selectedDate?.label ?? event.dateRangeLabel
  const notes = getEventPracticalNotes(event.slug)
  const mapUrl = getAddressMapUrl(event.address)

  useEffect(() => {
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="mw-page mw-page--event min-h-[100dvh]">
      <FirefliesLayer />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <MwNav variant="event" />
        <main className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center gap-6 px-6 py-14 text-center">
          <h1 role="status" className="mw-font-aboreto text-[30px] tracking-[0.06em] text-[var(--mw-text-strong)]">
            Thank you
          </h1>
          <p className="mw-font-body text-[19px] leading-[1.65] text-[var(--mw-text)]">
            Your seat for {dateLabel} is reserved. We&rsquo;ve also sent these details to your email. Be sure to
            check your Promotions folder for your confirmation email! We can&rsquo;t wait to see you.
          </p>

          <dl className="mw-font-body w-full text-left">
            {notes.map((note, i) => (
              <div
                key={note.label}
                className="flex flex-col gap-1 border-[var(--mw-line)] py-4 sm:flex-row sm:gap-6"
                style={{ borderTopWidth: i === 0 ? 1 : 0, borderBottomWidth: 1 }}
              >
                <dt className="text-[15px] text-[var(--mw-text-muted)] sm:w-[132px] sm:shrink-0">{note.label}</dt>
                <dd className="text-[17px] text-[var(--mw-text)]">
                  {note.label === 'Where' ? (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mw-link">
                      {note.text}
                    </a>
                  ) : (
                    note.text
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col items-center gap-4 pt-2">
            <a
              href={getGoogleCalendarUrl(
                selectedDate?.value ?? event.dates[0]?.value ?? '2026-12-15',
                getCalendarEventTitle(event.slug),
                getCalendarDescription(event.slug),
                event.address,
                event.slug
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mw-link text-[16px]"
            >
              Add to Google Calendar
            </a>
            <a href={event.invitePath} className="mw-btn-primary">
              Back to reservation
            </a>
          </div>
        </main>
        <MwFooter variant="event" />
      </div>
    </div>
  )
}

export default function MakeAWishSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mw-page mw-page--event flex min-h-[100dvh] items-center justify-center">
          <p className="mw-font-body text-[var(--mw-text)]">Loading...</p>
        </div>
      }
    >
      <MakeAWishSuccessContent />
    </Suspense>
  )
}
