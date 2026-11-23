'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getEventConfig } from '../../../lib/event-registry'
import { getCalendarDescription, getCalendarEventTitle, getGoogleCalendarUrl } from '../../../lib/event-messaging'
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

  useEffect(() => {
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="mw-page mw-page--event min-h-[100dvh]">
      <FirefliesLayer />
      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <MwNav variant="event" />
        <main className="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center justify-center gap-6 px-6 pb-16 text-center">
          <h1 role="status" className="mw-font-aboreto text-[30px] tracking-[0.06em] text-[var(--mw-text-strong)]">
            Thank you
          </h1>
          <p className="mw-font-body text-[19px] leading-[1.65] text-[var(--mw-text)]">
            Your seat for {dateLabel} is reserved. We&rsquo;ll email your confirmation and the address. We
            can&rsquo;t wait to see you.
          </p>
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
