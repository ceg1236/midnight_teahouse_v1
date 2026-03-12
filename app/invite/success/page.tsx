'use client'

import Link from 'next/link'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { eventDates } from '../../../content/event-invite.config'

const STORAGE_KEY = 'teahouse_reservation'

/** Build Google Calendar add-event URL for 7–11pm Pacific on the given date */
function getGoogleCalendarUrl(dateValue: string): string {
  // dateValue = "2026-03-18"; 7pm–11pm Pacific = 02:00–06:00 UTC next day
  const [y, m, d] = dateValue.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  const y2 = next.getUTCFullYear()
  const m2 = String(next.getUTCMonth() + 1).padStart(2, '0')
  const d2 = String(next.getUTCDate()).padStart(2, '0')
  const start = `${y2}${m2}${d2}T020000Z`
  const end = `${y2}${m2}${d2}T060000Z`
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=Midnight+Teahouse+-+Crossing+into+Spring' +
    `&dates=${start}/${end}` +
    '&details=An+enchanted+world+hidden+in+San+Francisco' +
    '&location=SoMA%2C+San+Francisco'
  )
}

function getFirstName(name: string): string {
  const trimmed = name.trim()
  return trimmed ? trimmed.split(/\s+/)[0] ?? trimmed : ''
}

const ADDRESS = '54 Washburn st, San Francisco'

function InviteSuccessContent() {
  const searchParams = useSearchParams()
  const name = searchParams.get('name') ?? ''
  const dateId = searchParams.get('date_id') ?? ''
  const event = dateId ? eventDates.find((d) => d.id === dateId) : eventDates[0]
  const dateLabel = event?.dateTime ?? 'March 18–20, 2026'
  const firstName = getFirstName(name)

  useEffect(() => {
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="carrd-page flex min-h-[100dvh] flex-col items-center justify-center px-6 md:min-h-screen">
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
            <p className="text-[11px] uppercase tracking-[0.05em] text-[#D9D0BF] mt-3">
              Location
            </p>
            <p className="text-[18.4px] font-medium text-[#FAE0B9] font-cursive">
              {ADDRESS}
            </p>
          </div>
          <svg
            viewBox="0 0 160 32"
            className="w-full max-w-[200px] mx-auto opacity-70"
            aria-hidden
          >
            <path
              d="M0 16 C40 4, 80 28, 120 16 C140 10, 150 14, 160 16"
              fill="none"
              stroke="#D9D0BF"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <path
              d="M0 18 C40 10, 80 30, 120 18 C140 14, 150 16, 160 18"
              fill="none"
              stroke="#D9D0BF"
              strokeWidth="0.4"
              strokeLinecap="round"
              opacity="0.7"
            />
            <circle cx="80" cy="16" r="1.5" fill="#D9D0BF" opacity="0.8" />
          </svg>
          <div className="flex flex-col gap-2">
            <p className="text-[16px] leading-[1.55] text-[#FAEBD4]">
              Thank you for reserving your spot.
            </p>
            <p className="text-[16px] leading-[1.55] text-[#FAEBD4]">
              We are excited to share an evening with you.
            </p>
            <p className="text-[16px] leading-[1.55] text-[#FAEBD4]">
              We&apos;ve sent a confirmation email with your ticket details and venue info. Please check your inbox — and your Promotions folder if you use Gmail — so you have everything you need.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <a
            href={getGoogleCalendarUrl(event?.value ?? '2026-03-18')}
            target="_blank"
            rel="noopener noreferrer"
            className="carrd-link text-[16px] underline hover:no-underline text-[#D9D0BF] hover:text-[#FAE0B9]"
          >
            Add to Google Calendar
          </a>
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

export default function InviteSuccessPage() {
  return (
    <Suspense fallback={
      <div className="carrd-page flex min-h-[100dvh] flex-col items-center justify-center px-6 md:min-h-screen">
        <div className="carrd-font-body text-[#FAEBD4]">Loading...</div>
      </div>
    }>
      <InviteSuccessContent />
    </Suspense>
  )
}
