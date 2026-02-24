/**
 * Event invite config - edit dates and tiers for each event.
 */

export const eventDates = [
  { id: 'mar-18', label: 'Wednesday, March 18', value: '2025-03-18' },
  { id: 'mar-19', label: 'Thursday, March 19', value: '2025-03-19' },
  { id: 'mar-20', label: 'Friday, March 20', value: '2025-03-20' },
] as const

export const eventTiers = [
  { id: 'supported', label: 'Supported', description: 'Pay what feels right, we believe in accessibility.', price: 20 },
  { id: 'community', label: 'Community', description: 'The heart of our gathering, your support sustains the experience.', price: 40 },
  { id: 'patron', label: 'Patron', description: 'Your generosity helps us grow and supports others to attend.', price: 60 },
] as const
