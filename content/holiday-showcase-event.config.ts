import type { EventDate } from './event-schema'
import { specialEventTiers } from './special-event.config'

export const holidayShowcaseEventDates = [
  {
    id: 'dec-15',
    day: 'Tuesday',
    dateTime: 'December 15, 7-11pm',
    label: 'Tuesday, December 15',
    value: '2026-12-15',
    capacity: 45,
    musicians: ['Music by Daniel Berkman, Kora'],
    blurb:
      'Daniel Berkman is a San Francisco–based composer and multi-instrumentalist known for his work on the kora, the 21-stringed West African harp.\n\nFor over three decades, he has explored the instrument\'s expressive range, weaving intricate, cascading patterns with spacious, meditative passages.\n\nDaniel brings a deep sensitivity to collaboration and live improvisation. Join us for an evening of luminous strings, quiet attention, and unfolding sound.',
    spotifyUrl: 'https://open.spotify.com/artist/61alTpjryjk7OUyNFGxrzV',
    spotifyLabel: "Listen to Daniel's music",
  },
  {
    id: 'dec-16',
    day: 'Wednesday',
    dateTime: 'December 16, 7-11pm',
    label: 'Wednesday, December 16',
    value: '2026-12-16',
    capacity: 45,
    musicians: ['Music by Noah Solt & Xiao'],
    blurb:
      'Noah Solt is a sea captain and folk musician whose music is deeply inspired by his time sailing around the world. For Noah, music is a point of reflection — a way to slow down and remember that he is whole in the midst of a distracted and extractive world that so often urges us to forget.\n\nJoined this evening by Xiao.',
    websiteUrl: 'https://www.noahsolt.com/about',
    instagramUrl: 'https://www.instagram.com/noahsolt/',
  },
  {
    id: 'dec-17',
    day: 'Thursday',
    dateTime: 'December 17, 7-11pm',
    label: 'Thursday, December 17',
    value: '2026-12-17',
    capacity: 45,
    musicians: ['Music by Xuun'],
    blurb: 'Xuun – live-looping',
  },
] as const satisfies readonly EventDate[]

/** Same tiers as Erstwhere / special-event. */
export const holidayShowcaseEventTiers = specialEventTiers
