/**
 * Event invite config - edit dates and tiers for each event.
 */

export const eventDates = [
  { id: 'mar-7', label: 'Friday, March 7', value: '2025-03-07' },
  { id: 'mar-8', label: 'Saturday, March 8', value: '2025-03-08' },
  { id: 'mar-9', label: 'Sunday, March 9', value: '2025-03-09' },
] as const

export const eventTiers = [
  { id: 'evening', label: 'Evening', description: 'Tea service & live music', price: 75 },
  { id: 'full', label: 'Full Experience', description: 'Evening + curated tasting', price: 120 },
  { id: 'vip', label: 'VIP', description: 'Full + reserved seating & gift', price: 175 },
] as const
