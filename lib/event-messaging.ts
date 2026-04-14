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
  const notes: PracticalNote[] = [
    { label: 'When', text: 'Doors open at 7pm, and the teahouse will remain open until 11pm.' },
    { label: 'Where', text: event.address },
    {
      label: 'Reservation',
      text: 'One reservation is for one person. If you made a reservation for someone else, please share this email with them.',
    },
    { label: 'Phones', text: 'We invite you to keep phones and laptops tucked away for the evening.' },
    { label: 'Shoes', text: 'The teahouse is a shoes-free space. Bring cozy socks.' },
  ]

  if (event.slug !== 'special-event') {
    notes.push({
      label: 'Rooftop',
      text: "There is a beautiful rooftop. If you're interested, bring a warm jacket or blanket!",
    })
  }

  notes.push({
    label: 'Tea & food',
    text: 'We will be serving caffeinated and non-caffeinated teas, and some light snacks.',
  })

  return notes
}

export function getCalendarDescription(eventSlug?: string): string {
  const event = getEventConfig(eventSlug)
  const notes = getEventPracticalNotes(event.slug)
  return [
    `Thank you for reserving a seat at ${event.title}.`,
    'We are excited to share this evening with you.',
    '',
    'A few practical notes for your visit:',
    ...notes.map((n) => `${n.label}: ${n.text}`),
  ].join('\n')
}
