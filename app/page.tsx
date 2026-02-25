import { CarrdStylePage } from './components/carrd-style-page'
import { getEventInviteContent } from '../content/parse'
import { eventDates, eventTiers } from '../content/event-invite.config'

/** Unix timestamp for first event at 7pm Pacific */
function getCountdownTarget(): number {
  const firstDate = eventDates[0]
  if (!firstDate) return Math.floor(Date.now() / 1000) + 86400
  // 7pm Pacific on the event date
  const d = new Date(`${firstDate.value}T19:00:00-08:00`)
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
