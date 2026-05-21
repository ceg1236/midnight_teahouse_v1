import type { EventTier } from '../content/event-schema'

export function getSupportedPriceBounds(tiers: readonly EventTier[]) {
  const supportedMin = tiers.find((t) => t.id === 'supported')?.price ?? 20
  const communityPrice = tiers.find((t) => t.id === 'community')?.price
  const supportedMax =
    communityPrice ??
    tiers.filter((t) => t.id !== 'supported').reduce((max, t) => Math.max(max, t.price), 40)
  return { supportedMin, supportedMax }
}

export function clampSupportedPrice(
  tiers: readonly EventTier[],
  raw: number | undefined | null
): number {
  const { supportedMin, supportedMax } = getSupportedPriceBounds(tiers)
  return Math.min(supportedMax, Math.max(supportedMin, Math.round(raw ?? supportedMin)))
}

export function isSupportedPriceInRange(tiers: readonly EventTier[], value: number): boolean {
  const { supportedMin, supportedMax } = getSupportedPriceBounds(tiers)
  return value >= supportedMin && value <= supportedMax
}
