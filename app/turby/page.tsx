import { getEventInviteContentBySlug } from '../../content/parse'
import { buildAvailabilityState } from '../../lib/availability-state'
import { getEventConfig } from '../../lib/event-registry'
import { getMockAvailabilityForDates } from '../../lib/sheets-availability'
import { DaytimeEventClient } from '../components/daytime-event-client'

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
  const ticket = firstString(params.ticket)
  const mockParam = firstString(params.mock)
  const availabilityOptions = { ticketFormats: eventConfig.ticketFormats }

  let initialAvailability = buildAvailabilityState(null)
  let skipAvailabilityFetch = false

  if (process.env.NODE_ENV === 'development' && mockParam?.startsWith('soldOut:')) {
    const ids = mockParam.replace('soldOut:', '').split(',').map((s) => s.trim()).filter(Boolean)
    initialAvailability = buildAvailabilityState(
      getMockAvailabilityForDates(eventConfig.dates, ids, availabilityOptions)
    )
    skipAvailabilityFetch = true
  } else if (process.env.NODE_ENV === 'development' && mockParam?.startsWith('soldOutTasting:')) {
    const ids = mockParam.replace('soldOutTasting:', '').split(',').map((s) => s.trim()).filter(Boolean)
    initialAvailability = buildAvailabilityState(
      getMockAvailabilityForDates(eventConfig.dates, [], {
        ...availabilityOptions,
        mockSoldOutTastingDateIds: ids,
      })
    )
    skipAvailabilityFetch = true
  }

  return (
    <DaytimeEventClient
      eventConfig={eventConfig}
      welcomeContent={welcomeContent}
      initialTicket={ticket ?? undefined}
      initialAvailability={initialAvailability}
      skipAvailabilityFetch={skipAvailabilityFetch}
    />
  )
}
