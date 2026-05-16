import type { EventDate, EventTier } from './event-schema'

export const turbyEventDates = [
  {
    id: 'turby-jun-13',
    day: 'Friday',
    dateTime: 'June 13, 7-11pm',
    label: 'Friday, June 13',
    value: '2026-06-13',
    capacity: 45,
    musicians: ['Live music throughout the evening—intimate acoustic sets alongside gong-fu tea and the rhythm of the room.'],
    blurb: 'Musicians TBA',
  },
  {
    id: 'turby-jun-14',
    day: 'Saturday',
    dateTime: 'June 14, 7-11pm',
    label: 'Saturday, June 14',
    value: '2026-06-14',
    capacity: 45,
    musicians: ['Live music throughout the evening—intimate acoustic sets alongside gong-fu tea and the rhythm of the room.'],
    blurb: 'Musicians TBA',
  },
  {
    id: 'turby-jun-15',
    day: 'Sunday',
    dateTime: 'June 15, 7-11pm',
    label: 'Sunday, June 15',
    value: '2026-06-15',
    capacity: 45,
    musicians: ['Live music throughout the evening—intimate acoustic sets alongside gong-fu tea and the rhythm of the room.'],
    blurb: 'Musicians TBA',
  },
] as const satisfies readonly EventDate[]

export const turbyEventTiers = [
  {
    id: 'supported',
    label: 'Supported',
    mainLine: 'Supported $20+',
    blurb: 'For guests who need financial support',
    price: 20,
  },
  {
    id: 'community',
    label: 'Community',
    mainLine: 'For most of our guests',
    blurb: 'This is our standard price to keep the teahouse financially sustainable.',
    price: 40,
  },
  {
    id: 'patron',
    label: 'Supporter',
    mainLine: 'For guests with additional capacity',
    blurb: 'If you are willing and able, please consider supporting our guests who would like supported tickets.',
    price: 60,
  },
] as const satisfies readonly EventTier[]
