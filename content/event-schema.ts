export type EventDate = {
  id: string
  day: string
  dateTime: string
  label: string
  value: string
  capacity?: number
  musicians: readonly string[]
  blurb?: string
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
