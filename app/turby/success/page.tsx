'use client'

import Link from 'next/link'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getEventConfig } from '../../../lib/event-registry'
import {
  getCalendarDescription,
  getCalendarEventTitle,
  getGoogleCalendarUrl,
  getTurbySuccessPageNotes,
} from '../../../lib/event-messaging'

const STORAGE_KEY = 'teahouse_reservation'

function getFirstName(name: string): string {
  const trimmed = name.trim()
  return trimmed ? trimmed.split(/\s+/)[0] ?? trimmed : ''
}

function TurbyEventSuccessContent() {
  const event = getEventConfig('turby-event')
  const searchParams = useSearchParams()
  const name = searchParams.get('name') ?? ''
  const dateId = searchParams.get('date_id') ?? ''
  const ticketFormat = searchParams.get('ticket_format') ?? undefined
  const selectedDate = dateId ? event.dates.find((d) => d.id === dateId) : event.dates[0]
  const dateLabel = selectedDate?.label ?? selectedDate?.dateTime ?? event.dateRangeLabel
  const successNotes = getTurbySuccessPageNotes(ticketFormat)
  const firstName = getFirstName(name)

  useEffect(() => {
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="carrd-page carrd-page--daytime flex min-h-[100dvh] flex-col items-center justify-center px-6 md:min-h-screen">
      <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
        <h1 className="carrd-font-heading text-[2rem] md:text-[2.5rem] font-semibold [font-variant:small-caps] tracking-wide text-[#FAEBD4]">
          See you at the Teahouse
        </h1>
        <div className="carrd-font-body flex flex-col items-center gap-6 text-center w-full max-w-md">
          {firstName ? (
            <p className="text-[18px] italic text-[#D9D0BF]">
              {firstName},
            </p>
          ) : null}
          <div className="flex flex-col gap-2 w-full">
            <p className="text-[11px] uppercase tracking-[0.05em] text-[#D9D0BF]">
              Date
            </p>
            <p className="text-[18.4px] font-medium text-[#FAE0B9] font-cursive">
              {dateLabel}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-left w-full">
            <p className="text-[16px] leading-[1.55] text-[#FAEBD4]">
              Thank you for reserving your spot.
            </p>
            <p className="text-[16px] leading-[1.55] text-[#FAEBD4]">
              We are excited to share this day with you.
            </p>
            <div className="flex flex-col gap-3 pt-1">
              <p className="text-[11px] uppercase tracking-[0.05em] text-[#D9D0BF]">
                A few things to note
              </p>
              <ul className="list-disc space-y-2 pl-5 text-[16px] leading-[1.55] text-[#FAEBD4]">
                {successNotes.map((note) => (
                  <li key={note.label}>
                    <span className="sr-only">{note.label}: </span>
                    {note.text}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[16px] leading-[1.55] text-[#FAEBD4]">
              We&apos;ve sent a confirmation email with your ticket details and venue info.
              Please check your inbox — and your Promotions folder if you use Gmail.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <a
            href={getGoogleCalendarUrl(
              selectedDate?.value ?? event.dates[0]?.value ?? '2026-05-30',
              getCalendarEventTitle(event.slug, ticketFormat),
              getCalendarDescription(event.slug, { ticketFormat }),
              event.address,
              event.slug,
              ticketFormat
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="carrd-link text-[16px] underline hover:no-underline text-[#D9D0BF] hover:text-[#FAE0B9]"
          >
            Add to Google Calendar
          </a>
          <Link
            href={event.invitePath}
            className="carrd-btn px-10 py-4 font-inherit text-xl"
          >
            Back to reservation
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function TurbyEventSuccessPage() {
  return (
    <Suspense fallback={
      <div className="carrd-page carrd-page--daytime flex min-h-[100dvh] flex-col items-center justify-center px-6 md:min-h-screen">
        <div className="carrd-font-body text-[#FAEBD4]">Loading...</div>
      </div>
    }>
      <TurbyEventSuccessContent />
    </Suspense>
  )
}
