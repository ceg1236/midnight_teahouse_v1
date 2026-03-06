import { CarrdStylePage } from './components/carrd-style-page'
import { getEventInviteContent } from '../content/parse'
import { eventDates, eventTiers } from '../content/event-invite.config'
import { getAvailability, getMockAvailability } from '../lib/sheets-availability'

/** Unix timestamp for first event at 7pm Pacific (March 18, 2026) */
function getCountdownTarget(): number {
  // March 18, 2026 7pm PDT (DST starts March 8)
  const d = new Date('2026-03-18T19:00:00-07:00')
  return Math.floor(d.getTime() / 1000)
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ mock?: string }>
}) {
  const welcomeContent = getEventInviteContent()
  const countdownTarget = getCountdownTarget()
  const params = await searchParams

  let availability: Awaited<ReturnType<typeof getAvailability>>
  if (process.env.NODE_ENV === 'development' && params.mock?.startsWith('soldOut:')) {
    const ids = params.mock.replace('soldOut:', '').split(',').map((s) => s.trim()).filter(Boolean)
    availability = getMockAvailability(ids)
  } else {
    availability = await getAvailability()
  }

  const soldOutByDateId: Record<string, boolean> = {}
  if (availability) {
    for (const a of availability) {
      soldOutByDateId[a.dateId] = a.soldOut
    }
  }
  return (
    <CarrdStylePage
      welcomeContent={welcomeContent}
      dates={eventDates}
      tiers={eventTiers}
      countdownTarget={countdownTarget}
      soldOutByDateId={soldOutByDateId}
    />
  )
}
