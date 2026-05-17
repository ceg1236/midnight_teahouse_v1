import { CarrdStylePage } from '../components/carrd-style-page'
import { getEventInviteContentBySlug } from '../../content/parse'
import { getAvailabilityForDates, getMockAvailabilityForDates } from '../../lib/sheets-availability'
import { getEventConfig } from '../../lib/event-registry'

export const dynamic = 'force-dynamic'

const TURBY_HERO_IMAGE = '/images/xf_flowers_tea/xf_teacup.jpg'

const TURBY_BOOKING_NOTES = [
  'We’re open from 11am to 3pm. Join us anytime in this window.',
  'Reservation includes unlimited tea and light café bites.',
  'We invite you to keep phones and laptops tucked away while you’re with us.',
  'This is an outdoor garden café—dress for the weather.',
]

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
  if (process.env.NODE_ENV === 'development' && mockParam?.startsWith('soldOut:')) {
    const ids = mockParam.replace('soldOut:', '').split(',').map((s) => s.trim()).filter(Boolean)
    availability = getMockAvailabilityForDates(eventConfig.dates, ids)
  } else {
    availability = await getAvailabilityForDates(eventConfig.dates)
  }

  const soldOutByDateId: Record<string, boolean> = {}
  const remainingByDateId: Record<string, number> = {}
  if (availability) {
    for (const a of availability) {
      soldOutByDateId[a.dateId] = a.soldOut
      remainingByDateId[a.dateId] = Math.max(0, a.capacity - a.sold)
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
      initialTicket={ticket ?? undefined}
      heroImage={TURBY_HERO_IMAGE}
      bookingNotes={TURBY_BOOKING_NOTES}
    />
  )
}
