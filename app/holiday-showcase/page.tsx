import { redirect } from 'next/navigation'

/** Redirects already-shared /holiday-showcase links to the redesigned /make-a-wish page, preserving query params (e.g. door-sale ?ticket=). */
export default async function HolidayShowcaseRedirect({
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
  redirect(`/make-a-wish${qs ? `?${qs}` : ''}`)
}
