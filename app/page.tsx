import { BackgroundStars } from './components/background-stars'
import { EventInviteWizard } from './components/event-invite-wizard'
import { getEventInviteContent } from '../content/parse'
import { eventDates, eventTiers } from '../content/event-invite.config'

export default function Page() {
  const welcomeContent = getEventInviteContent()
  return (
    <div className="page-bg">
      <div className="page-bg-night" aria-hidden />
      <div className="page-bg-day" aria-hidden />
      <BackgroundStars />
      <div className="relative z-10">
        <EventInviteWizard
          welcomeContent={welcomeContent}
          dates={eventDates}
          tiers={eventTiers}
        />
      </div>
    </div>
  )
}
