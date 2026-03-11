/**
 * Resolves which event date to use for door sales.
 * - If today's date (YYYY-MM-DD) matches a date's `value`, use that date.
 * - Otherwise fall back to the first event date.
 */

export function resolveDoorDate(
  today: string,
  dates: readonly { id: string; value?: string }[]
): string | null {
  if (!dates.length) return null
  const match = dates.find((d) => (d as { value?: string }).value === today)
  return match?.id ?? dates[0]?.id ?? null
}
