import { eventDates, eventTiers } from '../content/event-invite.config'
import { midsummerEventDates, midsummerEventTiers } from '../content/midsummer-event.config'
import { specialEventDates, specialEventTiers } from '../content/special-event.config'
import { turbyEventDates, turbyEventTiers, turbyTicketFormats } from '../content/turby-event.config'
import type { EventDate, EventTicketFormat, EventTier } from '../content/event-schema'

export type EventTheme = 'daytime' | 'midsummer' | 'evening'

export type EventConfig = {
  slug: string
  title: string
  eventTheme?: EventTheme
  /** Static hero image instead of looping video. */
  heroImage?: string
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
  hostSectionTitle?: string
  hostSectionDescription?: string
  dates: readonly EventDate[]
  tiers: readonly EventTier[]
  /** Optional first reservation step (e.g. Open Teahouse vs Guided Tasting). */
  ticketFormats?: readonly EventTicketFormat[]
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
    invitePath: '/erstwhere',
    successPath: '/erstwhere/success',
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
    hostSectionTitle: 'About our host',
    hostSectionDescription:
      'Erstwhere is a budding hub for artists in Haight-Ashbury—a guesthouse for traveling artists and a gathering space for local creatives. Its beautiful corridors serve as a bridge between the worlds within and beyond our city.',
    dates: specialEventDates,
    tiers: specialEventTiers,
  },
  'turby-event': {
    slug: 'turby-event',
    eventTheme: 'daytime',
    title: 'Backyard Teahouse at Turby',
    invitePath: '/turby',
    successPath: '/turby/success',
    countdownTarget: Math.floor(new Date('2026-05-30T11:00:00-07:00').getTime() / 1000),
    showCountdown: false,
    dateRangeLabel: 'Saturday, May 30, 2026',
    timeLabel: '11am-3pm',
    locationLabel: 'The Mission, San Francisco',
    address: '1303A Alabama St, San Francisco',
    calendarTitle: 'Backyard Teahouse at Turby',
    calendarDetails: 'Backyard teahouse at Turby in the Mission.',
    welcomeContentSlug: 'turby-invite',
    stripeDescriptionLabel: 'Backyard Teahouse at Turby',
    hostSectionTitle: 'About our host',
    hostSectionDescription:
      'Turby is a community home shared by nine friends from all walks of life. Their beautiful backyard — featuring a once-functional wind turbine that inspired the house\'s name — has long been a beloved gathering place for friends, families, and neighbors — hosting potlucks, pop-up cafés, concerts, and even a wedding.',
    dates: turbyEventDates,
    tiers: turbyEventTiers,
    ticketFormats: turbyTicketFormats,
  },
  'midsummer-event': {
    slug: 'midsummer-event',
    eventTheme: 'midsummer',
    heroImage: '/images/midsummer_washburn.avif',
    title: 'Midsummer Dream',
    invitePath: '/midsummer',
    successPath: '/midsummer/success',
    countdownTarget: Math.floor(new Date('2026-06-25T19:00:00-07:00').getTime() / 1000),
    showCountdown: false,
    dateRangeLabel: 'June 25-27, 2026',
    timeLabel: '7-11pm',
    locationLabel: 'SoMa, San Francisco',
    address: '54 Washburn st, San Francisco',
    calendarTitle: 'Midsummer Dream',
    calendarDetails: 'An enchanted world hidden in San Francisco',
    welcomeContentSlug: 'midsummer-invite',
    stripeDescriptionLabel: 'Midsummer Dream',
    hostSectionTitle: 'About our space',
    hostSectionDescription:
      'Our teahouse is a hidden gathering place in SoMa — a shoe-free parlor and rooftop where we host slow evenings of tea, music, and conversation.',
    dates: midsummerEventDates,
    tiers: midsummerEventTiers,
  },
}

export function isDaytimeEvent(slug?: string): boolean {
  if (!slug) return false
  return EVENTS[slug]?.eventTheme === 'daytime'
}

export function getCarrdPageThemeClass(slug?: string): string {
  const theme = slug ? EVENTS[slug]?.eventTheme : undefined
  if (theme === 'daytime') return ' carrd-page--daytime'
  if (theme === 'midsummer') return ' carrd-page--midsummer'
  return ''
}

export function getEventConfig(slug?: string): EventConfig {
  if (slug && EVENTS[slug]) return EVENTS[slug]
  return EVENTS[DEFAULT_EVENT_SLUG]
}
