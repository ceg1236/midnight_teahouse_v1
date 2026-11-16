import { CarrdStylePage } from '../components/carrd-style-page'
import { getEventInviteContentBySlug } from '../../content/parse'
import { buildAvailabilityState, getAvailabilityForDates, getMockAvailabilityForDates } from '../../lib/sheets-availability'
import { getEventConfig } from '../../lib/event-registry'

export const dynamic = 'force-dynamic'

function firstString(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v[0] : v
}

export default async function HolidayShowcaseEventPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const eventConfig = getEventConfig('holiday-showcase-event')
  const welcomeContent = getEventInviteContentBySlug(eventConfig.welcomeContentSlug)
  const params = await searchParams
  const availabilityOptions = { ticketFormats: eventConfig.ticketFormats }

  let availability: Awaited<ReturnType<typeof getAvailabilityForDates>>
  const mockParam = firstString(params.mock)
  if (process.env.NODE_ENV === 'development' && mockParam?.startsWith('soldOutTasting:')) {
    const ids = mockParam.replace('soldOutTasting:', '').split(',').map((s) => s.trim()).filter(Boolean)
    availability = getMockAvailabilityForDates(eventConfig.dates, [], {
      ...availabilityOptions,
      mockSoldOutTastingDateIds: ids,
    })
  } else if (process.env.NODE_ENV === 'development' && mockParam?.startsWith('soldOut:')) {
    const ids = mockParam.replace('soldOut:', '').split(',').map((s) => s.trim()).filter(Boolean)
    availability = getMockAvailabilityForDates(eventConfig.dates, ids, availabilityOptions)
  } else {
    availability = await getAvailabilityForDates(eventConfig.dates, availabilityOptions)
  }

  const { soldOutByDateId, remainingByDateId, ticketPoolByDateId } = buildAvailabilityState(availability)

  const ticket = firstString(params.ticket)

  return (
    <CarrdStylePage
      eventSlug={eventConfig.slug}
      eventTitle={eventConfig.title}
      welcomeContent={welcomeContent}
      dates={eventConfig.dates}
      tiers={eventConfig.tiers}
      ticketFormats={eventConfig.ticketFormats}
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
      heroImage={eventConfig.heroImage}
    />
  )
}
