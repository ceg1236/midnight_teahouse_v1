import type { EventTicketFormat, EventTier } from '../content/event-schema'
import type { EventConfig } from './event-registry'

export function getTiersForTicketFormat(
  eventTiers: readonly EventTier[],
  ticketFormats: readonly EventTicketFormat[] | undefined,
  ticketFormatId?: string
): readonly EventTier[] {
  if (ticketFormatId && ticketFormats?.length) {
    const format = ticketFormats.find((f) => f.id === ticketFormatId)
    if (format?.tiers?.length) return format.tiers
  }
  return eventTiers
}

export function getTiersForEvent(event: EventConfig, ticketFormatId?: string): readonly EventTier[] {
  return getTiersForTicketFormat(event.tiers, event.ticketFormats, ticketFormatId)
}
