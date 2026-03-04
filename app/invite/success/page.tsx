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

const ADDRESS = '54 Washburn st, San Francisco'

export default function InviteSuccessPage() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name') ?? ''
  const dateId = searchParams.get('date_id') ?? ''
  const event = dateId ? eventDates.find((d) => d.id === dateId) : eventDates[0]
  const dateLabel = event?.dateTime ?? 'March 18–20, 2026'
  const firstName = getFirstName(name)

  const handleForwardViaText = () => {
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
        {/* Paper card invite */}
        <div className="carrd-font-body w-full max-w-sm rounded-xl border border-[#D9D0BF]/60 bg-[#f8f4ec] px-8 py-10 shadow-[0_4px_24px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] text-[#2E0303]">
          <h2 className="carrd-font-heading text-xl md:text-2xl [font-variant:small-caps] mb-1">
            Midnight Teahouse
          </h2>
          <p className="carrd-font-subtitle italic text-[#5c4a3a] text-sm mb-6">
            an enchanted world hidden in San Francisco
          </p>
          {firstName ? (
            <p className="carrd-font-body text-lg text-[#2E0303] mb-2">
              {firstName},
            </p>
          ) : null}
          <p className="carrd-font-body text-[#3d2e2e] mb-4">
            You&apos;re invited to join us on{' '}
            <span className="font-medium text-[#5c4a3a]">{dateLabel}</span>
          </p>
          <p className="carrd-font-body text-sm text-[#5c4a3a]">
            {ADDRESS}
          </p>
        </div>
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
