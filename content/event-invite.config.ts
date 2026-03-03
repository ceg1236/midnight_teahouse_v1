/**
 * Event invite config - edit dates and tiers for each event.
 */

export const eventDates = [
  { id: 'mar-18', day: 'Wednesday', dateTime: 'March 18, 7-11PM', label: 'Wednesday, March 18', value: '2026-03-18', musicians: ['Daniel Berkeman, Kora'], blurb: 'Daniel Berkeman is a San Francisco–based composer and multi-instrumentalist known for his work on the kora, the 21-stringed West African harp. For over three decades, he has explored the instrument\'s expressive range, weaving intricate, cascading patterns with spacious, meditative passages. His music moves fluidly between acoustic tradition and subtle electronic texture, grounded yet expansive, rhythmic yet unhurried. He has composed extensively for dance, film, and immersive performance across the Bay Area, bringing a deep sensitivity to collaboration and live improvisation, and will shape the music in real time in response to the room and the ritual of tea—join us for an evening of luminous strings, quiet attention, and unfolding sound.' },
  { id: 'mar-19', day: 'Thursday', dateTime: 'March 19, 7-11PM', label: 'Thursday, March 19', value: '2026-03-19', musicians: ['Sasha Bayan, Sitar'], blurb: 'Sasha Bayan is a multifaceted musician known for his introspective songwriting and global musical influences. With a deep background in classical and world music, Sasha\'s work, including his album "enough", explores themes of love, loss, and self-discovery. As the bandleader and sitar player for High Tide, he fuses world music elements with contemporary composition, creating immersive musical experiences. Sasha\'s rich musical tapestry reflects his studies in guitar and composition at Northwestern University and his exploration of Flamenco, Brazilian, and Indian Classical music. His music offers a unique and heartfelt journey through the human experience.' },
  { id: 'mar-20', day: 'Friday', dateTime: 'March 20, 7-11PM', label: 'Friday, March 20', value: '2026-03-20', musicians: ['TBD'], blurb: '' },
] as const

export const eventTiers = [
  { id: 'supported', label: 'Supported', description: 'An accessible option, we don\'t want price to keep people out.', price: 20 },
  { id: 'community', label: 'Community', description: 'The heart of our gathering, your support sustains the experience.', price: 40 },
  { id: 'patron', label: 'Patron', description: 'Your generosity helps us grow and supports others to attend.', price: 60 },
] as const
