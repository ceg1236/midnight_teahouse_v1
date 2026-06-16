import type { EventDate } from './event-schema'
import { specialEventTiers } from './special-event.config'

export const midsummerEventDates = [
  {
    id: 'midsummer-jun-25',
    day: 'Thursday',
    dateTime: 'June 25, 8pm-12am',
    label: 'Thursday, June 25',
    value: '2026-06-25',
    capacity: 45,
    musicians: [],
    blurb:
      'Daniel Riera is a Latin-Grammy nominated multi-instrumentalist, producer, and composer based in San Francisco, CA, who plays the flute, wind-controller, modular synthesizer, guitar, and bass. He performs both solo and with the Daniel Riera Ensemble, fusing jazz, electronic, and Afro-Cuban styles. His versatile work as a beatmaker and songwriter has been featured on NPR\'s Tiny Desk Contest and podcasts like Snap Judgment.',
    websiteUrl: 'https://www.danielrieramusic.com',
    instagramUrl: 'https://www.instagram.com/tito_tunes/',
  },
  {
    id: 'midsummer-jun-26',
    day: 'Friday',
    dateTime: 'June 26, 8pm-12am',
    label: 'Friday, June 26',
    value: '2026-06-26',
    capacity: 45,
    musicians: [],
    blurb:
      'Noah Solt is a sea captain and folk musician whose music is deeply inspired by his time sailing around the world. For Noah, music is a point of reflection — a way to slow down and remember that he is whole in the midst of a distracted and extractive world that so often urges us to forget.',
    websiteUrl: 'https://www.noahsolt.com/about',
    instagramUrl: 'https://www.instagram.com/noahsolt/',
  },
  {
    id: 'midsummer-jun-27',
    day: 'Saturday',
    dateTime: 'June 27, 8pm-12am',
    label: 'Saturday, June 27',
    value: '2026-06-27',
    capacity: 45,
    musicians: [],
    blurb:
      'Bernice Yu is a classical pianist based in the San Francisco Bay Area who combines refined technique with an improvisational spirit. Her performances draw from contemporary classical, jazz, film scores, and electronic music to create melodic, evocative soundscapes. Bernice loves bringing her live piano to magical gatherings, and is a beloved regular at the teahouse.',
    websiteUrl: 'https://www.berniceyu.com/',
    instagramUrl: 'https://www.instagram.com/berniceyuck',
  },
] as const satisfies readonly EventDate[]

/** Same tiers as Erstwhere / special-event. */
export const midsummerEventTiers = specialEventTiers
