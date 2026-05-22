export type AvailabilityDateRow = {
  dateId: string
  sold: number
  capacity: number
  soldOut: boolean
  ticketPools?: Array<{
    ticketType: string
    remaining: number
    soldOut: boolean
  }>
}

export type AvailabilityState = {
  soldOutByDateId: Record<string, boolean>
  remainingByDateId: Record<string, number>
  ticketPoolByDateId: Record<string, Record<string, { remaining: number; soldOut: boolean }>>
}

export function buildAvailabilityState(
  availability: readonly AvailabilityDateRow[] | null | undefined
): AvailabilityState {
  const soldOutByDateId: Record<string, boolean> = {}
  const remainingByDateId: Record<string, number> = {}
  const ticketPoolByDateId: Record<
    string,
    Record<string, { remaining: number; soldOut: boolean }>
  > = {}

  if (!availability) {
    return { soldOutByDateId, remainingByDateId, ticketPoolByDateId }
  }

  for (const a of availability) {
    soldOutByDateId[a.dateId] = a.soldOut
    remainingByDateId[a.dateId] = Math.max(0, a.capacity - a.sold)
    if (a.ticketPools?.length) {
      ticketPoolByDateId[a.dateId] = {}
      for (const pool of a.ticketPools) {
        ticketPoolByDateId[a.dateId][pool.ticketType] = {
          remaining: pool.remaining,
          soldOut: pool.soldOut,
        }
      }
    }
  }

  return { soldOutByDateId, remainingByDateId, ticketPoolByDateId }
}
