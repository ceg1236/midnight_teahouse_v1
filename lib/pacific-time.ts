/**
 * Converts America/Los_Angeles wall-clock time to a UTC timestamp, correctly
 * handling the PST/PDT (-08:00 / -07:00) transition instead of assuming a
 * fixed offset. A fixed `-07:00` offset (PDT) is wrong for events between
 * early November and mid-March, when Pacific time is standard time (-08:00).
 */

const FALLBACK_OFFSET_MINUTES = -480 // PST, -08:00

function getLosAngelesOffsetMinutes(utcMs: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'shortOffset',
  }).formatToParts(new Date(utcMs))
  const tzName = parts.find((p) => p.type === 'timeZoneName')?.value
  const match = tzName?.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/)
  if (!match) return FALLBACK_OFFSET_MINUTES
  const sign = match[1] === '-' ? -1 : 1
  const hours = parseInt(match[2], 10)
  const minutes = match[3] ? parseInt(match[3], 10) : 0
  return sign * (hours * 60 + minutes)
}

/**
 * `year`/`month`/`day`/`hour`/`minute` are Pacific wall-clock time (1-indexed month).
 * Returns the UTC epoch milliseconds for that instant, with the correct
 * PST/PDT offset for that specific date.
 */
export function pacificWallTimeToUtcMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0
): number {
  // Guess the offset, then refine using the actual offset in effect at that
  // instant. One pass suffices: DST only shifts by one hour, and the guess
  // never lands on the other side of a transition for our event hours.
  let offsetMinutes = FALLBACK_OFFSET_MINUTES
  for (let i = 0; i < 2; i++) {
    const guessUtcMs = Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000
    offsetMinutes = getLosAngelesOffsetMinutes(guessUtcMs)
  }
  return Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000
}
