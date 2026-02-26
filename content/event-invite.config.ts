/**
 * Event invite config - edit dates and tiers for each event.
 */

export const eventDates = [
  { id: 'mar-18', label: 'Wednesday,\nMarch 18', value: '2026-03-18' },
  { id: 'mar-19', label: 'Thursday,\nMarch 19', value: '2026-03-19' },
  { id: 'mar-20', label: 'Friday,\nMarch 20', value: '2026-03-20' },
] as const

export const eventTiers = [
  { id: 'supported', label: 'Supported', description: 'An accessible option, we don\'t want price to keep people out.', price: 20 },
  { id: 'community', label: 'Community', description: 'The heart of our gathering, your support sustains the experience.', price: 40 },
  { id: 'patron', label: 'Patron', description: 'Your generosity helps us grow and supports others to attend.', price: 60 },
] as const
