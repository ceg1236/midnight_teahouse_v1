/**
 * Modal content - edit copy here, not in components.
 * Icon modal keys must match slot ids in app/page.tsx.
 */

export const iconModalContent = {
  tea: {
    body: 'Master cleanse austin mixtape etsy slow-carb synth food truck hell of lumbersexual deep v microdosing. Poke hella humblebrag farm-to-table tbh. Humblebrag gorpcore unicorn, poke flexitarian subway tile bicycle rights gatekeep VHS lo-fi ugh adaptogen cupping man bun chillwave. Brooklyn blog DIY, gochujang gorpcore neutra organic next level readymade four loko bruh intelligentsia.',
  },
  candle: {
    body: 'Ambiance content goes here.',
  },
  kora: {
    body: 'Music content goes here.',
  },
  table: {
    body: 'Booking content goes here.',
  },
} as const

export type IconModalId = keyof typeof iconModalContent

export const titleModalContent = {
  body: `Hi friend,

Welcome to the Midnight Teahouse — a little world being created by four friends in San Francisco, born from our shared love of tea, music, community, and beautiful spaces.

What is the Midnight Teahouse?

Our vision is to cultivate a place that becomes both a beloved gathering spot and an inviting home for creative exploration — for ourselves, our community, and the beautiful strangers we meet along the way.

We imagine a space to savor: where our body and mind can be softened, our senses delighted. For now, that takes the shape of a curated evening by reservation, with gongfu-style tea service, live music, and quiet corners.

Where can you find us?

We're starting by hosting a series of pop-ups to design and share our offering in community. If you'd like to join us for an evening, check out our upcoming pop-ups, or follow us @midnight_teahouse to stay in the loop.

Where are you headed?

Eventually, we hope to find a permanent home. We'd love to become a place where artists and musicians gather to play, where friends stop by after a long day or wander in on a quiet Friday looking for adventure.

Are you open to collaborators?

Yes! If you're interested in collaborating, sharing ideas, or offering support, we'd love to hear from you! Write us a note and we will follow up.

Thanks for visiting us. We hope to see you soon!`,
} as const
