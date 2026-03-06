import { NextResponse } from 'next/server'
import { getAvailability } from '../../../lib/sheets-availability'

/**
 * GET /api/availability
 * Returns sold counts and sold-out status per date.
 * Used by UI and checkout for capacity enforcement.
 */
export async function GET() {
  const availability = await getAvailability()
  if (!availability) {
    // Sheets not configured – return all dates as available
    const { eventDates } = await import('../../../content/event-invite.config')
    return NextResponse.json({
      dates: eventDates.map((d) => ({
        dateId: d.id,
        label: d.label,
        sold: 0,
        capacity: (d as { capacity?: number }).capacity ?? 999,
        soldOut: false,
      })),
    })
  }
  return NextResponse.json({ dates: availability })
}
