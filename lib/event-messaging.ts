import { getEventConfig, isDaytimeEvent } from './event-registry'
import { getTicketFormatLabels } from './ticket-format-labels'

export type PracticalNote = {
  label: string
  text: string
}

export const TURBY_OUTDOORS_NOTE =
  'The teahouse is outdoors in a half-sunny, half-shaded yard. Bring a hat, sunscreen, and a light jacket (as always in SF).'

export const TURBY_PHONES_NOTE = 'We are a phone and laptop-free space.'

export const TURBY_TEA_NOTE =
  'Your reservation includes unlimited tea and light tea snacks. We will be serving caffeinated and non-caffeinated teas.'

export const TURBY_TICKETS_NOTE =
  'Tickets are non-refundable, but feel free to transfer to a friend.'

export const TURBY_ADDRESS_BEFORE_BOOKING = 'The exact address will be shared after reservation.'

export const TURBY_KIDS_NOTE =
  'This is a kid-friendly gathering! Please feel free to bring your little ones — we’ll have non-caffeinated herbal tisanes for them to enjoy.'

export const TURBY_PETS_NOTE =
  'Though we love our animal friends, we sadly won’t be able to accommodate pets this time, as there will be delicate teaware throughout the space.'

export const TURBY_OPEN_HOURS_NOTE = 'Doors open at 11am and the teahouse closes at 3pm.'

export const TURBY_TASTING_HOURS_NOTE =
  'Guided tasting begins at 10am; you’re welcome to stay for the open teahouse until 3pm.'

/** Shown on daytime event checkout step before payment. */
export function getDaytimeBookingNotes(ticketFormat?: string): readonly string[] {
  const notes: string[] =
    ticketFormat === 'guided-tasting' ? [TURBY_TASTING_HOURS_NOTE] : [TURBY_OPEN_HOURS_NOTE]
  notes.push(
    TURBY_TEA_NOTE,
    TURBY_PHONES_NOTE,
    TURBY_TICKETS_NOTE,
    TURBY_ADDRESS_BEFORE_BOOKING,
    TURBY_KIDS_NOTE,
    TURBY_PETS_NOTE,
    TURBY_OUTDOORS_NOTE
  )
  return notes
}

/** @deprecated Use getDaytimeBookingNotes */
export function getTurbyBookingNotes(ticketFormat?: string): readonly string[] {
  return getDaytimeBookingNotes(ticketFormat)
}

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
    return TURBY_TASTING_HOURS_NOTE
  }
  if (ticketFormat === 'open-teahouse') {
    return TURBY_OPEN_HOURS_NOTE
  }
  return TURBY_OPEN_HOURS_NOTE
}

export function getEventPracticalNotes(
  eventSlug?: string,
  ticketFormat?: string
): PracticalNote[] {
  const event = getEventConfig(eventSlug)
  const daytime = isDaytimeEvent(event.slug)
  const experienceLabel = daytime ? getExperienceLabel(event.slug, ticketFormat) : undefined
  const notes: PracticalNote[] = []

  if (experienceLabel) {
    notes.push({ label: 'Experience', text: experienceLabel })
  }

  notes.push(
    {
      label: 'When',
      text: daytime
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
      text: daytime ? TURBY_PHONES_NOTE : 'We invite you to keep phones and laptops tucked away for the evening.',
    }
  )

  if (daytime) {
    notes.push(
      { label: 'Outdoors', text: TURBY_OUTDOORS_NOTE },
      { label: 'Kids', text: TURBY_KIDS_NOTE },
      { label: 'Pets', text: TURBY_PETS_NOTE },
      { label: 'Tickets', text: TURBY_TICKETS_NOTE }
    )
  } else {
    notes.push({ label: 'Shoes', text: 'The teahouse is a shoes-free space. Bring cozy socks.' })
  }

  if (event.slug !== 'special-event' && !daytime) {
    notes.push({
      label: 'Rooftop',
      text: "There is a beautiful rooftop. If you're interested, bring a warm jacket or blanket!",
    })
  }

  notes.push({
    label: 'Tea & food',
    text: daytime ? TURBY_TEA_NOTE : 'We will be serving caffeinated and non-caffeinated teas, and some light snacks.',
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
  const daytime = isDaytimeEvent(event.slug)
  let startHour = 19
  let endHour = 23
  if (daytime) {
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
  if (isDaytimeEvent(event.slug)) {
    if (ticketFormat === 'guided-tasting') {
      return "We're very excited to welcome you for a guided tasting at 10am—to slow down together, taste premium teas, and enjoy the backyard."
    }
    if (ticketFormat === 'open-teahouse') {
      return "We're very excited to welcome you to the open teahouse—to slow down together, enjoy tea and light bites in the backyard from 11am."
    }
    return "We're very excited to share this day with you—to slow down together, enjoy tea and light bites."
  }
  if (event.slug === 'special-event') {
    return "We're very excited to share this evening with you—to slow down together, enjoy tea and music, and settle into the parlors at Erstwhere."
  }
  if (event.slug === 'midsummer-event') {
    return "We're very excited to share this evening with you—to slow down together, enjoy tea and music, and settle into our SoMa teahouse."
  }
  return "We're very excited to share this evening with you—to slow down together, enjoy tea and music, settle into the night."
}

export function getCalendarDescription(
  eventSlug?: string,
  options?: { ticketFormat?: string; orderSummary?: string }
): string {
  const event = getEventConfig(eventSlug)
  const notes = getEventPracticalNotes(event.slug, options?.ticketFormat)
  const whenPhrase = isDaytimeEvent(event.slug) ? 'this day with you' : 'this evening with you'
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
  return getTurbyWhenNote(ticketFormat)
}

/** Confirmation page only — email and gcal use getEventPracticalNotes. */
export function getDaytimeSuccessExperienceLine(eventSlug: string, ticketFormat?: string): string | undefined {
  const label = getExperienceLabel(eventSlug, ticketFormat)
  if (!label) return undefined
  if (ticketFormat === 'open-teahouse') {
    return 'Ticket type: Open Teahouse, 11am'
  }
  return label
}

/** @deprecated Use getDaytimeSuccessExperienceLine */
export function getTurbySuccessExperienceLine(ticketFormat?: string): string | undefined {
  return getDaytimeSuccessExperienceLine('turby-event', ticketFormat)
}

export function getDaytimeSuccessPageNotes(eventSlug: string, ticketFormat?: string): PracticalNote[] {
  const event = getEventConfig(eventSlug)
  const notes = getEventPracticalNotes(eventSlug, ticketFormat)
  const result: PracticalNote[] = [
    { label: 'Address', text: `Our venue address is ${event.address}.` },
  ]

  for (const note of notes) {
    if (note.label === 'Where') continue
    if (note.label === 'Experience') {
      const line = getDaytimeSuccessExperienceLine(eventSlug, ticketFormat)
      if (line) result.push({ label: 'Ticket type', text: line })
      continue
    }
    result.push(note)
  }

  return result
}

export function getTurbySuccessPageNotes(ticketFormat?: string): PracticalNote[] {
  return getDaytimeSuccessPageNotes('turby-event', ticketFormat)
}
