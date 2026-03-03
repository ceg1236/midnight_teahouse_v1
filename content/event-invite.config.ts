/**
 * Event invite config - edit dates and tiers for each event.
 */

export const eventDates = [
  { id: 'mar-18', day: 'Wednesday', dateTime: 'March 18, 7-11PM', label: 'Wednesday, March 18', value: '2026-03-18', musicians: ['Daniel Burkeman, Kora'], blurb: '' },
  { id: 'mar-19', day: 'Thursday', dateTime: 'March 19, 7-11PM', label: 'Thursday, March 19', value: '2026-03-19', musicians: ['Sasha Bayan, Sitar'], blurb: 'Sasha Bayan is a multifaceted musician known for his introspective songwriting and global musical influences. With a deep background in classical and world music, Sasha\'s work, including his album "enough", explores themes of love, loss, and self-discovery. As the bandleader and sitar player for High Tide, he fuses world music elements with contemporary composition, creating immersive musical experiences. Sasha\'s rich musical tapestry reflects his studies in guitar and composition at Northwestern University and his exploration of Flamenco, Brazilian, and Indian Classical music. His music offers a unique and heartfelt journey through the human experience.' },
  { id: 'mar-20', day: 'Friday', dateTime: 'March 20, 7-11PM', label: 'Friday, March 20', value: '2026-03-20', musicians: ['TBD'], blurb: '' },
] as const

export const eventTiers = [
  { id: 'supported', label: 'Supported', description: 'An accessible option, we don\'t want price to keep people out.', price: 20 },
  { id: 'community', label: 'Community', description: 'The heart of our gathering, your support sustains the experience.', price: 40 },
  { id: 'patron', label: 'Patron', description: 'Your generosity helps us grow and supports others to attend.', price: 60 },
] as const
