'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { eventDates } from '../../../content/event-invite.config'

function GatheringsContent() {
  const searchParams = useSearchParams()
  const dateId = searchParams.get('date')
  const event = dateId
    ? eventDates.find((d) => d.id === dateId)
    : eventDates[0]

  return (
    <div className="carrd-page flex min-h-[100dvh] flex-col items-center justify-center px-6 md:min-h-screen">
      <div className="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
        {/* Post-card style invite */}
        <div className="carrd-font-body w-full max-w-sm rounded-xl border border-[#D9D0BF]/40 bg-[#2E0303]/60 px-8 py-10 shadow-lg backdrop-blur-sm">
          <h1 className="carrd-font-heading text-2xl md:text-3xl [font-variant:small-caps] mb-2">
            Midnight Teahouse
          </h1>
          <p className="carrd-font-subtitle italic text-[#D9D0BF]/90 text-sm mb-6">
            an enchanted world hidden in San Francisco
          </p>
          <p className="carrd-font-body text-lg text-[#FAEBD4] mb-4">
            You&apos;re invited to join us
          </p>
          <div className="space-y-2 text-[#D9D0BF]">
            <p className="carrd-font-body font-medium text-[#C4AF86]">
              {event?.dateTime ?? 'March 18–20, 2026'}
            </p>
            <p className="carrd-font-body text-sm">SoMA, San Francisco</p>
          </div>
        </div>
        <Link
          href="/invite"
          className="carrd-btn px-10 py-4 font-inherit text-xl"
        >
          Reserve Your Seat
        </Link>
      </div>
    </div>
  )
}

export default function GatheringsPage() {
  return (
    <Suspense fallback={
      <div className="carrd-page flex min-h-[100dvh] flex-col items-center justify-center px-6 md:min-h-screen">
        <div className="carrd-font-body text-[#FAEBD4]">Loading...</div>
      </div>
    }>
      <GatheringsContent />
    </Suspense>
  )
}
