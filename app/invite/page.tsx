import { CarrdStylePage } from '../components/carrd-style-page'
import { getEventInviteContent } from '../../content/parse'
import { eventDates, eventTiers } from '../../content/event-invite.config'
import { getAvailability, getMockAvailability } from '../../lib/sheets-availability'

export const dynamic = 'force-dynamic'

/** Unix timestamp for first event at 7pm Pacific (March 18, 2026) */
function getCountdownTarget(): number {
  const d = new Date('2026-03-18T19:00:00-07:00')
  return Math.floor(d.getTime() / 1000)
}

function firstString(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v[0] : v
}

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const welcomeContent = getEventInviteContent()
  const countdownTarget = getCountdownTarget()
  const params = await searchParams

  let availability: Awaited<ReturnType<typeof getAvailability>>
  const mockParam = firstString(params.mock)
  if (process.env.NODE_ENV === 'development' && mockParam?.startsWith('soldOut:')) {
    const ids = mockParam.replace('soldOut:', '').split(',').map((s) => s.trim()).filter(Boolean)
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

  const ticket = firstString(params.ticket)

  return (
    <CarrdStylePage
      welcomeContent={welcomeContent}
      dates={eventDates}
      tiers={eventTiers}
      countdownTarget={countdownTarget}
      soldOutByDateId={soldOutByDateId}
      initialTicket={ticket ?? undefined}
    />
  )
}
