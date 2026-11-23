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
    musicians: [],
    musicianTitle: 'Music by Daniel Berkman',
    shortBio:
      'San Francisco composer and multi-instrumentalist on the kora, a 21-string West African harp.',
    blurb:
      'Daniel Berkman is a San Francisco–based composer and multi-instrumentalist known for his work on the kora, the 21-stringed West African harp.\n\nFor over three decades, he has explored the instrument\'s expressive range, weaving intricate, cascading patterns with spacious, meditative passages.\n\nDaniel brings a deep sensitivity to collaboration and live improvisation. Join us for an evening of luminous strings, quiet attention, and unfolding sound.',
    spotifyUrl: 'https://open.spotify.com/artist/61alTpjryjk7OUyNFGxrzV',
    spotifyLabel: "Listen to Daniel's music",
    websiteUrl: 'https://www.danielberkman.com/',
    instagramUrl: 'https://www.instagram.com/danielberkman/',
  },
  {
    id: 'dec-16',
    day: 'Wednesday',
    dateTime: 'December 16, 7-11pm',
    label: 'Wednesday, December 16',
    value: '2026-12-16',
    capacity: 45,
    musicians: [],
    musicianTitle: 'Music by Noah Solt & Xiao Zhang',
    shortBio: 'Enchanting duet by guitar and pipa, carrying stories and spirits from around the world.',
    blurb:
      'Noah Solt is a sea captain and folk musician whose music is deeply inspired by his time sailing around the world. For Noah, music is a point of reflection — a way to slow down and remember that he is whole in the midst of a distracted and extractive world that so often urges us to forget.\n\nXiao Zhang 張潇 is a Pipa artist whose music moves with both quiet stillness and vibrant expression. Rooted in classical tradition yet fluid in spirit, her playing reflects the Daoist ideal of harmonious contrast where sound arises from silence, and emotion flows in cycles.',
    websiteUrl: 'https://www.noahsolt.com/about',
    websiteLabel: "Noah's Website",
    instagramUrl: 'https://www.instagram.com/noahsolt/',
    instagramLabel: "Noah's Instagram",
    extraLinks: [{ label: "Xiao's Instagram", url: 'https://www.instagram.com/xiaozpipa/' }],
  },
  {
    id: 'dec-17',
    day: 'Thursday',
    dateTime: 'December 17, 7-11pm',
    label: 'Thursday, December 17',
    value: '2026-12-17',
    capacity: 45,
    musicians: [],
    musicianTitle: 'Music by Xuun',
    shortBio:
      'Vietnamese-American sound alchemist who live-loops guzheng, jaw harp and flute into synths, bass and drums, improvising every set in the moment.',
    blurb:
      'Xuun is a Vietnamese-American sound alchemist based in the Bay Area. He live-loops ancient instruments such as Chinese guzheng, jaw harp, and flute and weaves it together with electronic synths, bass, and drums.\n\nHe improvises every set in the moment, each show is unique and original — music shaped by the energy in the room, the people in it, and whatever wants to move through the field. His sound journeys hold space for dance, stillness, and everything in between.',
    websiteUrl: 'https://www.xuunlive.com/',
    instagramUrl: 'https://www.instagram.com/xuun.live',
  },
] as const satisfies readonly EventDate[]

/** Same tiers as Erstwhere / special-event. */
export const holidayShowcaseEventTiers = specialEventTiers
