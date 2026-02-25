import { CarrdStylePage } from './components/carrd-style-page'
import { getEventInviteContent } from '../content/parse'
import { eventDates, eventTiers } from '../content/event-invite.config'

/** Unix timestamp for first event at 7pm Pacific (March 18, 2026) */
function getCountdownTarget(): number {
  // March 18, 2026 7pm PDT (DST starts March 8)
  const d = new Date('2026-03-18T19:00:00-07:00')
  return Math.floor(d.getTime() / 1000)
}

export default function Page() {
  const welcomeContent = getEventInviteContent()
  const countdownTarget = getCountdownTarget()
  return (
    <CarrdStylePage
      welcomeContent={welcomeContent}
      dates={eventDates}
      tiers={eventTiers}
      countdownTarget={countdownTarget}
    />
  )
}
