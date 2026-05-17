import type { EventDate, EventTier } from './event-schema'

export const turbyEventDates = [
  {
    id: 'turby-may-30',
    day: 'Saturday',
    dateTime: 'May 30, 11am-3pm',
    label: 'Saturday, May 30',
    value: '2026-05-30',
    capacity: 45,
    musicians: [],
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
