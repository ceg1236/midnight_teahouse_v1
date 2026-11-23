import type { Metadata } from 'next'
import { getAvailabilityForDates, getMockAvailabilityForDates } from '../../lib/sheets-availability'
import { getEventConfig } from '../../lib/event-registry'
import { MwEventPage } from '../components/mw/mw-event-page'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Make a Wish',
  description:
    'Three evenings of gongfu tea, live music and candlelight. December 15–17, SoMa, San Francisco. By reservation.',
  openGraph: {
    title: 'Make a Wish · Midnight Teahouse',
    description:
      'Three evenings of gongfu tea, live music and candlelight. December 15–17, SoMa, San Francisco. By reservation.',
    images: ['/images/fire_tea_pouring_poster.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Make a Wish · Midnight Teahouse',
    description:
      'Three evenings of gongfu tea, live music and candlelight. December 15–17, SoMa, San Francisco. By reservation.',
    images: ['/images/fire_tea_pouring_poster.jpg'],
  },
}

function firstString(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v[0] : v
}

export default async function MakeAWishPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const eventConfig = getEventConfig('holiday-showcase-event')
  const params = await searchParams

  let availability: Awaited<ReturnType<typeof getAvailabilityForDates>>
  const mockParam = firstString(params.mock)
  if (process.env.NODE_ENV === 'development' && mockParam?.startsWith('soldOut:')) {
    const ids = mockParam.replace('soldOut:', '').split(',').map((s) => s.trim()).filter(Boolean)
    availability = getMockAvailabilityForDates(eventConfig.dates, ids)
  } else {
    availability = await getAvailabilityForDates(eventConfig.dates)
  }

  const soldOutByDateId: Record<string, boolean> = {}
  if (availability) {
    for (const a of availability) {
      soldOutByDateId[a.dateId] = a.soldOut
    }
  }

  const ticket = firstString(params.ticket)

  return (
    <MwEventPage
      eventSlug={eventConfig.slug}
      dates={eventConfig.dates}
      tiers={eventConfig.tiers}
      soldOutByDateId={soldOutByDateId}
      initialTicket={ticket}
    />
  )
}
