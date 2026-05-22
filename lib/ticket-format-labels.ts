import type { EventTicketFormat, EventTier } from '../content/event-schema'

export function getTicketFormatLabels(
  formats: readonly EventTicketFormat[] | undefined
): Record<string, string> {
  if (!formats?.length) return {}
  return Object.fromEntries(formats.map((f) => [f.id, f.label]))
}

export function formatTicketTypeWithFormat(
  orderStr: string,
  tierLabels: Record<string, string>,
  ticketFormat?: string,
  formatLabels?: Record<string, string>
): string {
  const tierPart = formatTierOrder(orderStr, tierLabels)
  const formatLabel = ticketFormat ? formatLabels?.[ticketFormat] : undefined
  if (formatLabel && tierPart) return `${formatLabel} · ${tierPart}`
  if (formatLabel) return formatLabel
  return tierPart
}

function formatTierOrder(orderStr: string, tierLabels: Record<string, string>): string {
  const parts: string[] = []
  for (const pair of orderStr.split(',')) {
    const [tierId] = pair.split(':')
    if (!tierId) continue
    const label = tierLabels[tierId] ?? tierId
    parts.push(label)
  }
  return Array.from(new Set(parts)).join(', ') || ''
}

/** Ticket Type column (Payments + Guestlist) — tier labels only; amount paid is column F. */
export function formatSheetTicketType(
  orderStr: string,
  tiers: readonly EventTier[],
  ticketFormat?: string,
  _supportedPrice?: string | number
): string {
  const parts: string[] = []

  for (const pair of orderStr.split(',')) {
    const [tierId] = pair.split(':')
    if (!tierId) continue
    const tier = tiers.find((t) => t.id === tierId)
    parts.push(sheetLabelForTier(tierId, tier?.label ?? tierId, ticketFormat))
  }

  return Array.from(new Set(parts)).join(', ') || ''
}

function sheetLabelForTier(
  tierId: string,
  tierLabel: string,
  ticketFormat?: string
): string {
  if (ticketFormat === 'guided-tasting') {
    if (tierId === 'tasting') return 'Tasting'
    if (tierId === 'supported') return 'Tasting Supported'
    return tierLabel
  }

  return tierLabel
}
