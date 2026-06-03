'use client'

import { useEffect, useMemo, useState } from 'react'
import { CarrdStylePage } from './carrd-style-page'
import type { AvailabilityState } from '../../lib/availability-state'
import { buildAvailabilityState } from '../../lib/availability-state'
import type { EventConfig } from '../../lib/event-registry'

type DaytimeEventClientProps = {
  eventConfig: EventConfig
  welcomeContent: string
  initialTicket?: string
  initialAvailability?: AvailabilityState
  skipAvailabilityFetch?: boolean
}

export function DaytimeEventClient({
  eventConfig,
  welcomeContent,
  initialTicket,
  initialAvailability = buildAvailabilityState(null),
  skipAvailabilityFetch = false,
}: DaytimeEventClientProps) {
  const [availabilityLoading, setAvailabilityLoading] = useState(!skipAvailabilityFetch)
  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>(initialAvailability)

  useEffect(() => {
    if (skipAvailabilityFetch) {
      setAvailabilityState(initialAvailability)
      setAvailabilityLoading(false)
      return
    }

    let cancelled = false

    async function loadAvailability() {
      try {
        const res = await fetch(`/api/availability?eventSlug=${encodeURIComponent(eventConfig.slug)}`)
        const data = (await res.json()) as AvailabilityState
        if (!cancelled) {
          setAvailabilityState({
            soldOutByDateId: data.soldOutByDateId ?? {},
            remainingByDateId: data.remainingByDateId ?? {},
            ticketPoolByDateId: data.ticketPoolByDateId ?? {},
          })
        }
      } catch {
        if (!cancelled) {
          setAvailabilityState(buildAvailabilityState(null))
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false)
        }
      }
    }

    void loadAvailability()
    return () => {
      cancelled = true
    }
  }, [eventConfig.slug, initialAvailability, skipAvailabilityFetch])

  const pageProps = useMemo(
    () => ({
      eventSlug: eventConfig.slug,
      eventTitle: eventConfig.title,
      welcomeContent,
      dates: eventConfig.dates,
      tiers: eventConfig.tiers,
      countdownTarget: eventConfig.countdownTarget,
      showCountdown: eventConfig.showCountdown,
      dateRangeLabel: eventConfig.dateRangeLabel,
      timeLabel: eventConfig.timeLabel,
      locationLabel: eventConfig.locationLabel,
      hostSectionTitle: eventConfig.hostSectionTitle,
      hostSectionDescription: eventConfig.hostSectionDescription,
      heroImage: '/images/xf_flowers_tea/xf_teacup.jpg' as const,
      ticketFormats: eventConfig.ticketFormats,
      initialTicket,
      availabilityLoading,
      ...availabilityState,
    }),
    [availabilityLoading, availabilityState, eventConfig, initialTicket, welcomeContent]
  )

  return <CarrdStylePage {...pageProps} />
}
