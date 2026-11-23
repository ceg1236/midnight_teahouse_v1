import { redirect } from 'next/navigation'

/** Redirects already-shared /holiday-showcase/success links (e.g. Stripe return URLs) to /make-a-wish/success. */
export default async function HolidayShowcaseSuccessRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) query.append(key, v)
    } else if (value != null) {
      query.append(key, value)
    }
  }
  const qs = query.toString()
  redirect(`/make-a-wish/success${qs ? `?${qs}` : ''}`)
}
