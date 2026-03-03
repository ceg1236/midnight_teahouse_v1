/**
 * Event invite config - edit dates and tiers for each event.
 */

export const eventDates = [
  { id: 'mar-18', day: 'Wednesday', dateTime: 'March 18, 7-11PM', label: 'Wednesday, March 18', value: '2026-03-18', musicians: ['Music by Daniel Berkman, Kora'], blurb: 'Daniel Berkman is a San Francisco–based composer and multi-instrumentalist known for his work on the kora, the 21-stringed West African harp. For over three decades, he has explored the instrument\'s expressive range, weaving intricate, cascading patterns with spacious, meditative passages. His music moves fluidly between acoustic tradition and subtle electronic texture, grounded yet expansive, rhythmic yet unhurried. He has composed extensively for dance, film, and immersive performance across the Bay Area, bringing a deep sensitivity to collaboration and live improvisation, and will shape the music in real time in response to the room and the ritual of tea—join us for an evening of luminous strings, quiet attention, and unfolding sound.', spotifyUrl: 'https://open.spotify.com/artist/61alTpjryjk7OUyNFGxrzV', spotifyLabel: "Listen to Daniel's music" },
  { id: 'mar-19', day: 'Thursday', dateTime: 'March 19, 7-11PM', label: 'Thursday, March 19', value: '2026-03-19', musicians: ['Music by Sasha Bayan, Sitar'], blurb: 'Sasha Bayan is a multifaceted musician known for his introspective songwriting and global musical influences. With a deep background in classical and world music, Sasha\'s work, including his album "enough", explores themes of love, loss, and self-discovery. As the bandleader and sitar player for High Tide, he fuses world music elements with contemporary composition, creating immersive musical experiences. Sasha\'s rich musical tapestry reflects his studies in guitar and composition at Northwestern University and his exploration of Flamenco, Brazilian, and Indian Classical music. His music offers a unique and heartfelt journey through the human experience.', spotifyUrl: 'https://open.spotify.com/artist/2cwKhNJE0AFNVtYKhHAgMc', spotifyLabel: "Listen to Sasha's music" },
  { id: 'mar-20', day: 'Friday', dateTime: 'March 20, 7-11PM', label: 'Friday, March 20', value: '2026-03-20', musicians: ['TBD'], blurb: '', spotifyUrl: '', spotifyLabel: '' },
] as const

export const eventTiers = [
  { id: 'supported', label: 'Supported', mainLine: 'Supported $20+', blurb: 'For guests who need financial support', price: 20 },
  { id: 'community', label: 'Community', mainLine: 'For most of our guests', blurb: 'This is our standard price to keep the teahouse financially sustainable.', price: 40 },
  { id: 'patron', label: 'Supporter', mainLine: 'For guests with additional capacity', blurb: 'If you are willing and able, please consider supporting our guests who would like supported tickets.', price: 60 },
] as const
