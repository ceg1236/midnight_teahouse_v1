import { getEventConfig } from './event-registry'

export type PracticalNote = {
  label: string
  text: string
}

export function getAddressMapUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

export function getEventPracticalNotes(eventSlug?: string): PracticalNote[] {
  const event = getEventConfig(eventSlug)
  const isDaytimeTurby = event.slug === 'turby-event'
  const notes: PracticalNote[] = [
    {
      label: 'When',
      text: isDaytimeTurby
        ? 'We’re open from 11am to 3pm. Join us anytime in this window.'
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
    },
    ...(isDaytimeTurby
      ? [
          {
            label: 'Outdoors',
            text: 'This is an outdoor garden café—dress for the weather (sun hat, layers, or sunscreen as needed).',
          },
        ]
      : [{ label: 'Shoes', text: 'The teahouse is a shoes-free space. Bring cozy socks.' }]),
  ]

  if (event.slug !== 'special-event' && event.slug !== 'turby-event') {
    notes.push({
      label: 'Rooftop',
      text: "There is a beautiful rooftop. If you're interested, bring a warm jacket or blanket!",
    })
  }

  notes.push({
    label: 'Tea & food',
    text: isDaytimeTurby
      ? 'We will be serving caffeinated and non-caffeinated teas, with light café bites.'
      : 'We will be serving caffeinated and non-caffeinated teas, and some light snacks.',
  })

  return notes
}

/** Google Calendar URL; uses 11am–3pm Pacific for daytime Turby, 7–11pm otherwise. */
export function getGoogleCalendarUrl(
  dateValue: string,
  title: string,
  details: string,
  location: string,
  eventSlug?: string
): string {
  const event = getEventConfig(eventSlug)
  const isDaytimeTurby = event.slug === 'turby-event'
  const startHour = isDaytimeTurby ? 11 : 19
  const endHour = isDaytimeTurby ? 15 : 23
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

export function getCalendarDescription(eventSlug?: string): string {
  const event = getEventConfig(eventSlug)
  const notes = getEventPracticalNotes(event.slug)
  const whenPhrase = event.slug === 'turby-event' ? 'this afternoon with you' : 'this evening with you'
  return [
    `Thank you for reserving a seat at ${event.title}.`,
    `We are excited to share ${whenPhrase}.`,
    '',
    'A few practical notes for your visit:',
    ...notes.map((n) => `${n.label}: ${n.text}`),
  ].join('\n')
}
