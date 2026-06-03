import type { EventDate } from './event-schema'
import { specialEventTiers } from './special-event.config'

export const midsummerEventDates = [
  {
    id: 'midsummer-jun-25',
    day: 'Thursday',
    dateTime: 'June 25, 7-11pm',
    label: 'Thursday, June 25',
    value: '2026-06-25',
    capacity: 45,
    musicians: [],
    blurb: 'Daniel Riera – guitar',
  },
  {
    id: 'midsummer-jun-26',
    day: 'Friday',
    dateTime: 'June 26, 7-11pm',
    label: 'Friday, June 26',
    value: '2026-06-26',
    capacity: 45,
    musicians: [],
  },
  {
    id: 'midsummer-jun-27',
    day: 'Saturday',
    dateTime: 'June 27, 7-11pm',
    label: 'Saturday, June 27',
    value: '2026-06-27',
    capacity: 45,
    musicians: [],
    blurb: 'Bernice Yu – piano',
  },
] as const satisfies readonly EventDate[]

/** Same tiers as Erstwhere / special-event. */
export const midsummerEventTiers = specialEventTiers
