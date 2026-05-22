import { NextResponse } from 'next/server'
import { buildAvailabilityState } from '../../../lib/availability-state'
import { getEventConfig } from '../../../lib/event-registry'
import { getAvailabilityForDates } from '../../../lib/sheets-availability'

export const dynamic = 'force-dynamic'

/**
 * GET /api/availability?eventSlug=turby-event
 * Returns sold counts and sold-out status per date for the requested event.
 */
export async function GET(request: Request) {
  const eventSlug = new URL(request.url).searchParams.get('eventSlug') ?? undefined
  const event = getEventConfig(eventSlug)
  const availability = await getAvailabilityForDates(event.dates, {
    ticketFormats: event.ticketFormats,
  })

  if (!availability) {
    return NextResponse.json({
      dates: event.dates.map((d) => ({
        dateId: d.id,
        label: d.label,
        sold: 0,
        capacity: d.capacity ?? 999,
        soldOut: false,
      })),
      ...buildAvailabilityState(null),
    })
  }

  return NextResponse.json({
    dates: availability,
    ...buildAvailabilityState(availability),
  })
}
