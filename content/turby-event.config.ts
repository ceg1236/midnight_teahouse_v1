import type { EventDate, EventTicketFormat, EventTier } from './event-schema'

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

export const turbyTicketFormats = [
  {
    id: 'open-teahouse',
    label: 'Open Teahouse, 11am',
    description:
      'Drop in anytime until 3pm. Includes unlimited gongfu tea & light snacks.\nLive music performance by multi-instrumentalist Daniel Berkman.',
    capacity: 45,
    capacityTicketType: 'standard',
  },
  {
    id: 'guided-tasting',
    label: 'Guided Tasting, 10am',
    description:
      'Deepen your tea experience in a quiet, intimate setting. Includes access to the Open Teahouse and take-home samples of premium teas.\nCapped at 6 guests.',
    capacity: 6,
    capacityTicketType: 'tasting',
    tiers: [
      {
        id: 'tasting',
        label: 'Tasting',
        mainLine: 'For most of our guests',
        blurb:
          'Includes an hour-long tasting, take-home samples of premium teas, and entry to the rest of the daytime teahouse.',
        price: 60,
      },
      {
        id: 'supported',
        label: 'Supported Tasting',
        mainLine: 'Supported $40+',
        blurb: 'For guests who need financial support',
        price: 40,
      },
    ],
  },
] as const satisfies readonly EventTicketFormat[]

export const turbyEventTiers = [
  {
    id: 'community',
    label: 'Community',
    mainLine: 'For most of our guests',
    blurb: 'This is our standard price to keep the teahouse financially sustainable.',
    price: 30,
  },
  {
    id: 'patron',
    label: 'Supporter',
    mainLine: 'For guests with additional capacity',
    blurb: 'If you are willing and able, please consider supporting our guests who would like supported tickets.',
    price: 45,
  },
  {
    id: 'supported',
    label: 'Supported',
    mainLine: 'Supported $15+',
    blurb: 'For guests who need financial support',
    price: 15,
  },
] as const satisfies readonly EventTier[]
