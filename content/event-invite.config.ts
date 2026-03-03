/**
 * Event invite config - edit dates and tiers for each event.
 */

export const eventDates = [
  { id: 'mar-18', day: 'Wednesday', dateTime: 'March 18, 7-11PM', label: 'Wednesday, March 18', value: '2026-03-18', musicians: ['Daniel Burkeman, Kora'] },
  { id: 'mar-19', day: 'Thursday', dateTime: 'March 19, 7-11PM', label: 'Thursday, March 19', value: '2026-03-19', musicians: ['Sasha Bayan, Sitar'] },
  { id: 'mar-20', day: 'Friday', dateTime: 'March 20, 7-11PM', label: 'Friday, March 20', value: '2026-03-20', musicians: ['TBD'] },
] as const

export const eventTiers = [
  { id: 'supported', label: 'Supported', description: 'An accessible option, we don\'t want price to keep people out.', price: 20 },
  { id: 'community', label: 'Community', description: 'The heart of our gathering, your support sustains the experience.', price: 40 },
  { id: 'patron', label: 'Patron', description: 'Your generosity helps us grow and supports others to attend.', price: 60 },
] as const
