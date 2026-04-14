import { eventDates, eventTiers } from '../content/event-invite.config'
import { specialEventDates, specialEventTiers } from '../content/special-event.config'
import type { EventDate, EventTier } from '../content/event-schema'

export type EventConfig = {
  slug: string
  title: string
  invitePath: string
  successPath: string
  countdownTarget: number
  showCountdown: boolean
  dateRangeLabel: string
  timeLabel: string
  locationLabel: string
  address: string
  calendarTitle: string
  calendarDetails: string
  welcomeContentSlug: string
  stripeDescriptionLabel: string
  dates: readonly EventDate[]
  tiers: readonly EventTier[]
}

export const DEFAULT_EVENT_SLUG = 'crossing-into-spring'

const EVENTS: Record<string, EventConfig> = {
  'crossing-into-spring': {
    slug: 'crossing-into-spring',
    title: 'Crossing into Spring',
    invitePath: '/invite',
    successPath: '/invite/success',
    countdownTarget: Math.floor(new Date('2026-03-18T19:00:00-07:00').getTime() / 1000),
    showCountdown: true,
    dateRangeLabel: 'March 18-20, 2026',
    timeLabel: '7-11pm',
    locationLabel: 'SoMA, SF',
    address: '54 Washburn st, San Francisco',
    calendarTitle: 'Midnight Teahouse - Crossing into Spring',
    calendarDetails: 'An enchanted world hidden in San Francisco',
    welcomeContentSlug: 'event-invite',
    stripeDescriptionLabel: 'Crossing into Spring',
    dates: eventDates,
    tiers: eventTiers,
  },
  'special-event': {
    slug: 'special-event',
    title: 'Midnight Teahouse at Erstwhere',
    invitePath: '/events/special-event',
    successPath: '/events/special-event/success',
    countdownTarget: Math.floor(new Date('2026-04-21T19:00:00-07:00').getTime() / 1000),
    showCountdown: false,
    dateRangeLabel: 'April 21 - 23, 2026',
    timeLabel: '7-11pm',
    locationLabel: 'The Haight, SF',
    address: '29 Lyon St, San Francisco',
    calendarTitle: 'Midnight Teahouse at Erstwhere',
    calendarDetails: '',
    welcomeContentSlug: 'special-event-invite',
    stripeDescriptionLabel: 'Midnight Teahouse at Erstwhere',
    dates: specialEventDates,
    tiers: specialEventTiers,
  },
}

export function getEventConfig(slug?: string): EventConfig {
  if (slug && EVENTS[slug]) return EVENTS[slug]
  return EVENTS[DEFAULT_EVENT_SLUG]
}
