import type { EventDate, EventTicketFormat } from './event-schema'
import { specialEventTiers } from './special-event.config'

export const holidayShowcaseEventDates = [
  {
    id: 'dec-15',
    day: 'Tuesday',
    dateTime: 'December 15, 7-11pm',
    label: 'Tuesday, December 15',
    value: '2026-12-15',
    capacity: 45,
    musicians: [],
  },
  {
    id: 'dec-16',
    day: 'Wednesday',
    dateTime: 'December 16, 7-11pm',
    label: 'Wednesday, December 16',
    value: '2026-12-16',
    capacity: 45,
    musicians: [],
  },
  {
    id: 'dec-17',
    day: 'Thursday',
    dateTime: 'December 17, 7-11pm',
    label: 'Thursday, December 17',
    value: '2026-12-17',
    capacity: 45,
    musicians: [],
  },
] as const satisfies readonly EventDate[]

/** Same tiers as Erstwhere / special-event. */
export const holidayShowcaseEventTiers = specialEventTiers

export const holidayShowcaseTicketFormats = [
  {
    id: 'standard',
    label: 'Main Event, 7pm',
    description: 'The main evening — gongfu-style tea, live music, and the people in the room, 7-11pm.',
    capacity: 45,
    capacityTicketType: 'standard',
  },
  {
    id: 'guided-tasting',
    label: 'Guided Tasting, 5:30pm',
    description:
      'Arrive early for an intimate guided tasting, then stay for the full evening from 7-11pm.\nCapped at 6 guests. Wednesday and Thursday only.',
    capacity: 6,
    capacityTicketType: 'tasting',
    availableDateIds: ['dec-16', 'dec-17'],
    tiers: [
      {
        id: 'tasting',
        label: 'Guided Tasting',
        mainLine: 'Includes entry to the evening',
        blurb: 'An intimate guided tasting at 5:30pm, plus full entry to the 7-11pm evening.',
        price: 75,
      },
    ],
  },
] as const satisfies readonly EventTicketFormat[]
