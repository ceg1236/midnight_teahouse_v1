import type { EventDate } from '../content/event-schema'

const MONTH_NAMES: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
}

const MONTH_ABBR = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** Normalize Config tab date keys: trim, lowercase, spaces → hyphens. */
export function normalizeConfigDateKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, '-')
}

function monthDayKey(month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  return `${MONTH_ABBR[month - 1]}-${day}`
}

function monthDayKeyFromText(text: string): string | null {
  const match = text.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+(\d{1,2})\b/i
  )
  if (!match) return null
  const month = MONTH_NAMES[match[1].toLowerCase()]
  const day = parseInt(match[2], 10)
  if (!month || isNaN(day)) return null
  return monthDayKey(month, day)
}

/** All keys accepted in Config col A for this event date. */
export function getConfigDateAliases(date: EventDate): string[] {
  const aliases = new Set<string>()
  aliases.add(normalizeConfigDateKey(date.id))

  const isoMatch = date.value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const month = parseInt(isoMatch[2], 10)
    const day = parseInt(isoMatch[3], 10)
    const key = monthDayKey(month, day)
    if (key) aliases.add(key)
  }

  for (const text of [date.dateTime, date.label]) {
    const key = monthDayKeyFromText(text)
    if (key) aliases.add(key)
  }

  return Array.from(aliases)
}

/** Map a Config tab date key to the canonical event date id. */
export function resolveConfigDateKey(rawKey: string, dates: readonly EventDate[]): string | null {
  const normalized = normalizeConfigDateKey(rawKey)
  if (!normalized) return null

  for (const date of dates) {
    if (getConfigDateAliases(date).includes(normalized)) {
      return date.id
    }
  }

  return null
}
