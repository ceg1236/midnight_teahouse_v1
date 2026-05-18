/**
 * Home page "Upcoming gatherings" teaser rows.
 * Each row drops off automatically after `endsAt` (America/Los_Angeles offsets in ISO strings).
 */

export type UpcomingGathering = {
  /** First instant for sort order (usually doors / start of first day). */
  startsAt: string
  /** After this instant the row is hidden from Upcoming gatherings. */
  endsAt: string
  monthShort: string
  dayNum: string
  title: string
  detailLine: string
  badge: string
  href: string
  ctaLabel: string
}

const UPCOMING_GATHERINGS = [
  {
    startsAt: '2026-04-16T18:30:00-07:00',
    endsAt: '2026-04-16T21:30:00-07:00',
    monthShort: 'Apr',
    dayNum: '16',
    title: 'After Dark: Altered States',
    detailLine: '6:30–9:30 pm · The Exploratorium · San Francisco',
    badge: 'Tea Lounge',
    href: 'https://www.exploratorium.edu/visit/calendar/after-dark-altered-states',
    ctaLabel: 'RSVP →',
  },
  {
    startsAt: '2026-04-21T19:00:00-07:00',
    endsAt: '2026-04-23T23:00:00-07:00',
    monthShort: 'Apr',
    dayNum: '21',
    title: 'Midnight Teahouse at Erstwhere',
    detailLine: 'April 21–23 · 7–11 pm · The Haight · San Francisco',
    badge: 'Tea Lounge',
    href: '/erstwhere',
    ctaLabel: 'Reserve →',
  },
] as const satisfies readonly UpcomingGathering[]

/**
 * Gatherings whose last day/time is still in the future relative to `referenceDate`.
 */
export function getUpcomingGatherings(referenceDate: Date = new Date()): UpcomingGathering[] {
  const t = referenceDate.getTime()
  return UPCOMING_GATHERINGS.filter((g) => new Date(g.endsAt).getTime() > t).sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )
}
