export type EventDate = {
  id: string
  day: string
  dateTime: string
  label: string
  value: string
  capacity?: number
  musicians: readonly string[]
  blurb?: string
  websiteUrl?: string
  instagramUrl?: string
  spotifyUrl?: string
  spotifyLabel?: string
}

export type EventTier = {
  id: string
  label: string
  mainLine: string
  blurb: string
  price: number
}

/** Experience option before tier selection (e.g. Open Teahouse vs Guided Tasting). */
export type EventTicketFormat = {
  id: string
  label: string
  description: string
  /** When set, ticket step uses these tiers instead of the event default tiers. */
  tiers?: readonly EventTier[]
  /** Max seats for this experience; Config tab row with matching TicketType. */
  capacity?: number
  /** Config sheet TicketType key (col C); defaults to format id. */
  capacityTicketType?: string
}
