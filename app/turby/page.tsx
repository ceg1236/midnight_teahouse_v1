import { CarrdStylePage } from '../components/carrd-style-page'
import { getEventInviteContentBySlug } from '../../content/parse'
import { getAvailabilityForDates, getMockAvailabilityForDates } from '../../lib/sheets-availability'
import { getEventConfig } from '../../lib/event-registry'

export const dynamic = 'force-dynamic'

const TURBY_HERO_IMAGE = '/images/xf_flowers_tea/xf_teacup.jpg'

function firstString(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v[0] : v
}

export default async function TurbyEventPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const eventConfig = getEventConfig('turby-event')
  const welcomeContent = getEventInviteContentBySlug(eventConfig.welcomeContentSlug)
  const params = await searchParams

  let availability: Awaited<ReturnType<typeof getAvailabilityForDates>>
  const mockParam = firstString(params.mock)
  const availabilityOptions = { ticketFormats: eventConfig.ticketFormats }
  if (process.env.NODE_ENV === 'development' && mockParam?.startsWith('soldOut:')) {
    const ids = mockParam.replace('soldOut:', '').split(',').map((s) => s.trim()).filter(Boolean)
    availability = getMockAvailabilityForDates(eventConfig.dates, ids, availabilityOptions)
  } else if (process.env.NODE_ENV === 'development' && mockParam?.startsWith('soldOutTasting:')) {
    const ids = mockParam.replace('soldOutTasting:', '').split(',').map((s) => s.trim()).filter(Boolean)
    availability = getMockAvailabilityForDates(eventConfig.dates, [], {
      ...availabilityOptions,
      mockSoldOutTastingDateIds: ids,
    })
  } else {
    availability = await getAvailabilityForDates(eventConfig.dates, availabilityOptions)
  }

  const soldOutByDateId: Record<string, boolean> = {}
  const remainingByDateId: Record<string, number> = {}
  const ticketPoolByDateId: Record<string, Record<string, { remaining: number; soldOut: boolean }>> = {}
  if (availability) {
    for (const a of availability) {
      soldOutByDateId[a.dateId] = a.soldOut
      remainingByDateId[a.dateId] = Math.max(0, a.capacity - a.sold)
      if (a.ticketPools?.length) {
        ticketPoolByDateId[a.dateId] = {}
        for (const pool of a.ticketPools) {
          ticketPoolByDateId[a.dateId][pool.ticketType] = {
            remaining: pool.remaining,
            soldOut: pool.soldOut,
          }
        }
      }
    }
  }

  const ticket = firstString(params.ticket)

  return (
    <CarrdStylePage
      eventSlug={eventConfig.slug}
      eventTitle={eventConfig.title}
      welcomeContent={welcomeContent}
      dates={eventConfig.dates}
      tiers={eventConfig.tiers}
      countdownTarget={eventConfig.countdownTarget}
      showCountdown={eventConfig.showCountdown}
      dateRangeLabel={eventConfig.dateRangeLabel}
      timeLabel={eventConfig.timeLabel}
      locationLabel={eventConfig.locationLabel}
      hostSectionTitle={eventConfig.hostSectionTitle}
      hostSectionDescription={eventConfig.hostSectionDescription}
      soldOutByDateId={soldOutByDateId}
      remainingByDateId={remainingByDateId}
      ticketPoolByDateId={ticketPoolByDateId}
      initialTicket={ticket ?? undefined}
      heroImage={TURBY_HERO_IMAGE}
      ticketFormats={eventConfig.ticketFormats}
    />
  )
}
