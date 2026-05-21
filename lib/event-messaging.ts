import { getEventConfig } from './event-registry'
import { getTicketFormatLabels } from './ticket-format-labels'

export type PracticalNote = {
  label: string
  text: string
}

export const TURBY_OUTDOORS_NOTE =
  'The teahouse is outdoors in a half-sunny, half-shaded yard. Bring a hat, sunscreen, and a light jacket (as always in SF).'

export function getAddressMapUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function getExperienceLabel(eventSlug?: string, ticketFormat?: string): string | undefined {
  if (!ticketFormat) return undefined
  const event = getEventConfig(eventSlug)
  const labels = getTicketFormatLabels(event.ticketFormats)
  return labels[ticketFormat]
}

function getTurbyWhenNote(ticketFormat?: string): string {
  if (ticketFormat === 'guided-tasting') {
    return 'Your guided tasting begins at 10am. Afterward, you’re welcome to stay for the Open Teahouse until 3pm.'
  }
  if (ticketFormat === 'open-teahouse') {
    return 'Drop in anytime between 11am and 3pm.'
  }
  return 'We’re open from 11am to 3pm. Join us anytime in this window.'
}

export function getEventPracticalNotes(
  eventSlug?: string,
  ticketFormat?: string
): PracticalNote[] {
  const event = getEventConfig(eventSlug)
  const isDaytimeTurby = event.slug === 'turby-event'
  const experienceLabel = isDaytimeTurby ? getExperienceLabel(event.slug, ticketFormat) : undefined
  const notes: PracticalNote[] = []

  if (experienceLabel) {
    notes.push({ label: 'Experience', text: experienceLabel })
  }

  notes.push(
    {
      label: 'When',
      text: isDaytimeTurby
        ? getTurbyWhenNote(ticketFormat)
        : 'Doors open at 7pm, and the teahouse will remain open until 11pm.',
    },
    { label: 'Where', text: event.address },
    {
      label: 'Reservation',
      text: 'One reservation is for one person. If you made a reservation for someone else, please share this email with them.',
    },
    {
      label: 'Phones',
      text: isDaytimeTurby
        ? 'We invite you to keep phones and laptops tucked away while you’re with us.'
        : 'We invite you to keep phones and laptops tucked away for the evening.',
    }
  )

  if (isDaytimeTurby) {
    notes.push({ label: 'Outdoors', text: TURBY_OUTDOORS_NOTE })
  } else {
    notes.push({ label: 'Shoes', text: 'The teahouse is a shoes-free space. Bring cozy socks.' })
  }

  if (event.slug !== 'special-event' && event.slug !== 'turby-event') {
    notes.push({
      label: 'Rooftop',
      text: "There is a beautiful rooftop. If you're interested, bring a warm jacket or blanket!",
    })
  }

  notes.push({
    label: 'Tea & food',
    text: isDaytimeTurby
      ? 'We will be serving caffeinated and non-caffeinated teas, with light tea snacks.'
      : 'We will be serving caffeinated and non-caffeinated teas, and some light snacks.',
  })

  return notes
}

/** Google Calendar URL; Turby uses 10am–3pm for tasting, 11am–3pm for open teahouse. */
export function getGoogleCalendarUrl(
  dateValue: string,
  title: string,
  details: string,
  location: string,
  eventSlug?: string,
  ticketFormat?: string
): string {
  const event = getEventConfig(eventSlug)
  const isDaytimeTurby = event.slug === 'turby-event'
  let startHour = 19
  let endHour = 23
  if (isDaytimeTurby) {
    startHour = ticketFormat === 'guided-tasting' ? 10 : 11
    endHour = 15
  }
  const [y, m, d] = dateValue.split('-').map(Number)
  const pad = (n: number) => String(n).padStart(2, '0')
  const toGCal = (hour: number) => {
    const ms = Date.parse(`${y}-${pad(m)}-${pad(d)}T${pad(hour)}:00:00-07:00`)
    const dt = new Date(ms)
    return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`
  }
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}` +
    `&dates=${toGCal(startHour)}/${toGCal(endHour)}` +
    `&details=${encodeURIComponent(details)}` +
    `&location=${encodeURIComponent(location)}`
  )
}

export function getCalendarEventTitle(eventSlug?: string, ticketFormat?: string): string {
  const event = getEventConfig(eventSlug)
  const experienceLabel = getExperienceLabel(event.slug, ticketFormat)
  if (experienceLabel) {
    return `${event.calendarTitle} – ${experienceLabel}`
  }
  return event.calendarTitle
}

/** Opening paragraph in the Resend confirmation email (HTML). */
export function getConfirmationEmailIntro(eventSlug?: string, ticketFormat?: string): string {
  const event = getEventConfig(eventSlug)
  if (event.slug === 'turby-event') {
    if (ticketFormat === 'guided-tasting') {
      return "We're very excited to welcome you for a guided tasting at 10am—to slow down together, taste premium teas, and enjoy the garden."
    }
    if (ticketFormat === 'open-teahouse') {
      return "We're very excited to welcome you to the open teahouse—to slow down together, enjoy tea and light bites in the garden from 11am."
    }
    return "We're very excited to share this day with you—to slow down together, enjoy tea and light bites in the garden."
  }
  if (event.slug === 'special-event') {
    return "We're very excited to share this evening with you—to slow down together, enjoy tea and music, and settle into the parlors at Erstwhere."
  }
  return "We're very excited to share this evening with you—to slow down together, enjoy tea and music, settle into the night."
}

export function getCalendarDescription(
  eventSlug?: string,
  options?: { ticketFormat?: string; orderSummary?: string }
): string {
  const event = getEventConfig(eventSlug)
  const notes = getEventPracticalNotes(event.slug, options?.ticketFormat)
  const whenPhrase = event.slug === 'turby-event' ? 'this day with you' : 'this evening with you'
  const lines = [
    `Thank you for reserving a seat at ${event.title}.`,
    `We are excited to share ${whenPhrase}.`,
  ]
  if (options?.orderSummary) {
    lines.push('', `Reservation: ${options.orderSummary}`)
  }
  lines.push('', 'A few practical notes for your visit:', ...notes.map((n) => `${n.label}: ${n.text}`))
  return lines.join('\n')
}

export function getTurbySuccessWhenLine(ticketFormat?: string): string {
  if (ticketFormat === 'guided-tasting') {
    return 'Your guided tasting begins at 10am. You’re welcome to stay for the Open Teahouse until 3pm.'
  }
  if (ticketFormat === 'open-teahouse') {
    return 'Drop in anytime between 11am and 3pm.'
  }
  return 'We’re open from 11am to 3pm.'
}
