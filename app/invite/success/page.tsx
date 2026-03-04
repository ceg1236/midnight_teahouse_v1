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
        <h1 className="carrd-font-heading text-3xl md:text-4xl [font-variant:small-caps] text-[#FAEBD4]">
          See you at the Teahouse
        </h1>
        <div className="carrd-font-body flex flex-col items-center gap-4 text-left w-full max-w-md">
          {firstName ? (
            <p className="text-lg text-[#FAEBD4] w-full">
              {firstName},
            </p>
          ) : null}
          <p className="text-base leading-relaxed text-[#FAEBD4] w-full">
            Thank you for reserving your spot. We are excited to share an evening with you.
          </p>
          <div className="space-y-1 w-full">
            <p className="text-xs uppercase tracking-wider text-[#D9D0BF]">
              Date
            </p>
            <p className="text-base text-[#FAEBD4]">
              {dateLabel}
            </p>
          </div>
          <div className="space-y-1 w-full">
            <p className="text-xs uppercase tracking-wider text-[#D9D0BF]">
              Location
            </p>
            <p className="text-base text-[#FAEBD4]">
              {ADDRESS}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-[#FAEBD4] w-full">
            Please look out for our confirmation email.
          </p>
          <p className="text-base text-[#FAEBD4] w-full">
            Warmly,
          </p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <a
            href={GOOGLE_CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="carrd-link text-sm underline hover:no-underline text-[#D9D0BF] hover:text-[#FAE0B9]"
          >
            Add to Google Calendar
          </a>
          <button
            type="button"
            onClick={handleForwardViaText}
            className="carrd-link text-sm underline hover:no-underline bg-transparent border-none cursor-pointer p-0 font-inherit text-[#D9D0BF] hover:text-[#FAE0B9]"
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
