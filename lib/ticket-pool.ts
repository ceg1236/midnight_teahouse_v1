import type { EventTicketFormat } from '../content/event-schema'

/** Config col C / pool key for Open Teahouse (standard) tickets. Empty col C maps here for format events. */
export const STANDARD_CAPACITY_KEY = 'standard'

/** True when Payments/Guestlist Ticket type (col E) counts toward a tasting pool. */
export function isTastingSheetTicketType(ticketType: string): boolean {
  const t = ticketType.trim()
  if (!t) return false
  if (t === 'Tasting') return true
  if (t.startsWith('Tasting ·')) return true
  if (t.includes('Guided Tasting')) return true
  return false
}

export function getFormatCapacityTicketType(format: EventTicketFormat): string | undefined {
  if (typeof format.capacity !== 'number') return undefined
  return (format.capacityTicketType ?? format.id).trim().toLowerCase()
}

export function getFormatCapacityKeys(formats: readonly EventTicketFormat[] | undefined): string[] {
  if (!formats?.length) return []
  const keys = formats
    .map((f) => getFormatCapacityTicketType(f))
    .filter((k): k is string => !!k)
  return Array.from(new Set(keys))
}

export type FormatCapacityState = {
  poolRemaining?: number
  /** Legacy total-date remaining (invite events without per-format pools). */
  venueRemaining?: number
  /** Seats bookable for this experience (pool cap only when format has a pool key). */
  remaining?: number
  soldOut: boolean
}

export function getFormatCapacityState(
  format: EventTicketFormat,
  dateId: string | null | undefined,
  remainingByDateId: Record<string, number>,
  ticketPoolByDateId: Record<string, Record<string, { remaining: number; soldOut: boolean }>>
): FormatCapacityState {
  const poolKey = getFormatCapacityTicketType(format)
  const pool = poolKey && dateId ? ticketPoolByDateId[dateId]?.[poolKey] : undefined
  const poolRemaining = pool?.remaining

  if (poolKey) {
    return {
      poolRemaining,
      remaining: poolRemaining,
      soldOut:
        pool?.soldOut === true ||
        (typeof poolRemaining === 'number' && poolRemaining <= 0),
    }
  }

  const venueRemaining = dateId ? remainingByDateId[dateId] : undefined
  return {
    venueRemaining,
    remaining: venueRemaining,
    soldOut: typeof venueRemaining === 'number' && venueRemaining <= 0,
  }
}

export function getMaxSelectableForExperience(
  format: EventTicketFormat | undefined,
  dateId: string | null | undefined,
  remainingByDateId: Record<string, number>,
  ticketPoolByDateId: Record<string, Record<string, { remaining: number; soldOut: boolean }>>,
  bypassSoldOut: boolean
): number {
  if (bypassSoldOut) return 4
  if (format) {
    const state = getFormatCapacityState(format, dateId, remainingByDateId, ticketPoolByDateId)
    if (typeof state.remaining === 'number') {
      return Math.max(0, Math.min(4, state.remaining))
    }
  }
  const venueRemaining = dateId ? remainingByDateId[dateId] : undefined
  if (typeof venueRemaining === 'number') {
    return Math.max(0, Math.min(4, venueRemaining))
  }
  return 4
}
