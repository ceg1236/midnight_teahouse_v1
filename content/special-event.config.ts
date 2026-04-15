import type { EventDate, EventTier } from './event-schema'

export const specialEventDates = [
  {
    id: 'apr-21',
    day: 'Tuesday',
    dateTime: 'April 21, 7-11pm',
    label: 'Tuesday, April 21,',
    value: '2026-04-21',
    capacity: 45,
    musicians: ['In the spirit of this home, our musicians will roam throughout the evening—offering intimate, acoustic sets that unfold alongside the flow of tea and the rhythm of the room.'],
  },
  {
    id: 'apr-22',
    day: 'Wednesday',
    dateTime: 'April 22, 7-11pm',
    label: 'Wednesday, April 22,',
    value: '2026-04-22',
    capacity: 45,
    musicians: ['In the spirit of this home, our musicians will roam throughout the evening—offering intimate, acoustic sets that unfold alongside the flow of tea and the rhythm of the room.'],
  },
  {
    id: 'apr-23',
    day: 'Thursday',
    dateTime: 'April 23, 7-11pm',
    label: 'Thursday, April 23,',
    value: '2026-04-23',
    capacity: 45,
    musicians: ['In the spirit of this home, our musicians will roam throughout the evening—offering intimate, acoustic sets that unfold alongside the flow of tea and the rhythm of the room.'],
  },
] as const satisfies readonly EventDate[]

export const specialEventTiers = [
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
