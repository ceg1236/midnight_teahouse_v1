'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { eventDates } from '../../../content/event-invite.config'

const STORAGE_KEY = 'teahouse_reservation'

/** Google Calendar add-event URL for March 18, 2026 7–11pm Pacific */
const GOOGLE_CALENDAR_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text=Midnight+Teahouse+-+Crossing+into+Spring' +
  '&dates=20260319T030000Z/20260319T070000Z' +
  '&details=An+enchanted+world+hidden+in+San+Francisco' +
  '&location=SoMA%2C+San+Francisco'

function getFirstName(name: string): string {
  const trimmed = name.trim()
  return trimmed ? trimmed.split(/\s+/)[0] ?? trimmed : ''
}

export default function InviteSuccessPage() {
  const searchParams = useSearchParams()

  const handleForwardViaText = () => {
    const name = searchParams.get('name') ?? ''
    const dateId = searchParams.get('date_id') ?? ''
    const event = dateId ? eventDates.find((d) => d.id === dateId) : eventDates[0]
    const dateLabel = event?.dateTime ?? 'March 18–20, 2026'
    const firstName = getFirstName(name)
    const gatheringsUrl = `${window.location.origin}/invite/gatherings${dateId ? `?date=${dateId}` : ''}`
    const smsBody =
      (firstName ? `${firstName} invited you to join them at the Midnight Teahouse on ${dateLabel}. ` : '') +
      `Here are some details about our gatherings. ${gatheringsUrl}`
    window.location.href = `sms:?body=${encodeURIComponent(smsBody)}`
  }

  useEffect(() => {
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="carrd-page flex min-h-[100dvh] flex-col items-center justify-center px-6 md:min-h-screen">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <h1 className="carrd-font-heading text-3xl md:text-4xl [font-variant:small-caps]">
          See you at the Teahouse
        </h1>
        <p className="carrd-font-body text-lg leading-relaxed opacity-90 whitespace-pre-line">
          {`Thank you for reserving your spot.\nWe'll send a confirmation email shortly.`}
        </p>
        <div className="flex flex-col items-center gap-4">
          <a
            href={GOOGLE_CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carrd-link carrd-link--muted text-sm underline hover:no-underline"
          >
            Add to Google Calendar
          </a>
          <button
            type="button"
            onClick={handleForwardViaText}
            className="carrd-link carrd-link--muted text-sm underline hover:no-underline bg-transparent border-none cursor-pointer p-0 font-inherit"
          >
            Forward invite via text
          </button>
          <Link
            href="/"
            className="carrd-btn px-10 py-4 font-inherit text-xl"
          >
            Back to Invite
          </Link>
        </div>
      </div>
    </div>
  )
}
