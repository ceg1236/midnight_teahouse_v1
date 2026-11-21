export type EventDate = {
  id: string
  day: string
  dateTime: string
  label: string
  value: string
  capacity?: number
  musicians: readonly string[]
  /** Short always-visible credit line on the date card (e.g. "Music by X & Y"); full bio stays in `blurb`, revealed via "More". */
  musicianTitle?: string
  blurb?: string
  websiteUrl?: string
  websiteLabel?: string
  instagramUrl?: string
  instagramLabel?: string
  spotifyUrl?: string
  spotifyLabel?: string
  /** Extra named links beyond websiteUrl/instagramUrl (e.g. a second performer's social on a shared date). */
  extraLinks?: readonly { label: string; url: string }[]
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
  /** Restricts this format to specific event date ids (e.g. tasting only offered Wed/Thu). Omit to offer on every date. */
  availableDateIds?: readonly string[]
}
