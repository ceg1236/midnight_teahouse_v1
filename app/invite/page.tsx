import { redirect } from 'next/navigation'

/**
 * /invite redirects to / with same search params (e.g. ?ticket=xxx for admin/door links).
 */
export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v != null) qs.set(k, Array.isArray(v) ? v[0] ?? '' : v)
  }
  const query = qs.toString()
  redirect(query ? `/?${query}` : '/')
}
