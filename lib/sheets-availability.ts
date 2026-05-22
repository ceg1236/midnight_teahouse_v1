/**
 * Read sold ticket counts from Google Sheets and compute availability per date.
 * Sheet columns: A=Timestamp, B=Name, C=Email, D=Ticket date, E=Ticket type, F=Amount paid, G=Quantity, H=Notes, I=Device, J=Stripe Payment ID, K=Refunded.
 * We sum Quantity (G) grouped by Ticket date (D), excluding rows where Refunded (K) is non-empty.
 */

import { google } from 'googleapis'
import { eventDates } from '../content/event-invite.config'
import { getCapacityFromSheet, getDefaultCapacitySettings, mergeCapacityForTicketFormats } from './sheets-capacity'
import type { CapacitySettings } from './sheets-capacity'
import type { EventDate, EventTicketFormat } from '../content/event-schema'
import { resolveConfigDateKey } from './config-date-key'
import { getFormatCapacityKeys, isTastingSheetTicketType, STANDARD_CAPACITY_KEY } from './ticket-pool'
import { getSheetsConfig } from './payment-env'
import { buildAvailabilityState } from './availability-state'

export { buildAvailabilityState } from './availability-state'
export type { AvailabilityState } from './availability-state'

/** Map Config sheet date keys (e.g. May-30) to canonical event date ids. */
export function resolveCapacitySettings(
  settings: CapacitySettings,
  dates: readonly EventDate[]
): CapacitySettings {
  const byDateId: Record<string, number> = {}
  const byDateAndTicketType: Record<string, Record<string, number>> = {}

  for (const [key, cap] of Object.entries(settings.byDateId)) {
    const dateId = resolveConfigDateKey(key, dates) ?? key
    byDateId[dateId] = cap
  }

  for (const [key, pools] of Object.entries(settings.byDateAndTicketType)) {
    const dateId = resolveConfigDateKey(key, dates) ?? key
    byDateAndTicketType[dateId] ??= {}
    Object.assign(byDateAndTicketType[dateId], pools)
  }

  return { byDateId, byDateAndTicketType }
}

export type TicketPoolAvailability = {
  ticketType: string
  sold: number
  capacity: number
  soldOut: boolean
  remaining: number
}

export type DateAvailability = {
  dateId: string
  label: string
  sold: number
  capacity: number
  soldOut: boolean
  /** Optional per-ticket-type pools (e.g. tasting cap of 6). */
  ticketPools?: TicketPoolAvailability[]
}

export type AvailabilityOptions = {
  ticketFormats?: readonly EventTicketFormat[]
  /** Dev mock: dateIds where tasting pool is sold out */
  mockSoldOutTastingDateIds?: string[]
}

function getSheetsClient() {
  const { credentialsJson, credentialsPath } = getSheetsConfig()
  if (!credentialsJson && !credentialsPath) return null

  const auth = new google.auth.GoogleAuth(
    credentialsJson
      ? {
          credentials: JSON.parse(credentialsJson) as object,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        }
      : {
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        }
  )
  return google.sheets({ version: 'v4', auth })
}

function buildTicketPools(
  dateId: string,
  soldByTicketType: Record<string, number>,
  capacitySettings: ReturnType<typeof getDefaultCapacitySettings>,
  poolKeys: string[],
  mockSoldOutTastingDateIds?: string[]
): TicketPoolAvailability[] {
  const pools: TicketPoolAvailability[] = []
  const poolCaps = capacitySettings.byDateAndTicketType[dateId] ?? {}

  for (const ticketType of poolKeys) {
    const capacity = poolCaps[ticketType]
    if (typeof capacity !== 'number') continue

    const sold =
      ticketType === 'tasting' && mockSoldOutTastingDateIds?.includes(dateId)
        ? capacity
        : (soldByTicketType[ticketType] ?? 0)
    const remaining = Math.max(0, capacity - sold)
    pools.push({
      ticketType,
      sold,
      capacity,
      soldOut: capacity > 0 && sold >= capacity,
      remaining,
    })
  }

  return pools
}

function countSoldByTicketType(
  ticketType: string,
  qty: number,
  soldByTicketType: Record<string, number>,
  independentPools: boolean
) {
  if (isTastingSheetTicketType(ticketType)) {
    soldByTicketType.tasting = (soldByTicketType.tasting ?? 0) + qty
  } else if (independentPools) {
    soldByTicketType[STANDARD_CAPACITY_KEY] =
      (soldByTicketType[STANDARD_CAPACITY_KEY] ?? 0) + qty
  }
}

/** Google Sheets may return dates as serial numbers (e.g. 46172) instead of labels. */
function sheetsSerialToIso(serial: number): string | null {
  const days = Math.floor(serial)
  if (days <= 0) return null
  const utc = new Date(Date.UTC(1899, 11, 30) + days * 86_400_000)
  return utc.toISOString().slice(0, 10)
}

/** Normalize Payments col D to the canonical event date label for sold-count grouping. */
export function resolvePaymentTicketDate(
  ticketDate: string,
  dates: readonly EventDate[]
): string {
  const trimmed = ticketDate.trim()
  if (!trimmed) return trimmed

  for (const d of dates) {
    if (trimmed === d.label) return d.label
  }

  const serial = Number(trimmed)
  if (!Number.isNaN(serial) && /^\d+(\.\d+)?$/.test(trimmed)) {
    const iso = sheetsSerialToIso(serial)
    if (iso) {
      const match = dates.find((d) => d.value === iso)
      if (match) return match.label
    }
  }

  return trimmed
}

function mergeCapacitySettings(
  dates: readonly EventDate[],
  defaultCapacity: ReturnType<typeof getDefaultCapacitySettings>,
  capacityFromSheet: ReturnType<typeof resolveCapacitySettings>,
  ticketFormats?: readonly EventTicketFormat[]
) {
  const merged = {
    byDateId: {
      ...defaultCapacity.byDateId,
      ...capacityFromSheet.byDateId,
    },
    byDateAndTicketType: { ...defaultCapacity.byDateAndTicketType } as Record<
      string,
      Record<string, number>
    >,
  }

  for (const [dateId, pools] of Object.entries(capacityFromSheet.byDateAndTicketType)) {
    merged.byDateAndTicketType[dateId] = {
      ...(merged.byDateAndTicketType[dateId] ?? {}),
      ...pools,
    }
  }

  return mergeCapacityForTicketFormats(merged, dates, ticketFormats)
}

/**
 * Return mock availability for UI testing. Use with /invite?mock=soldOut:mar-18,mar-19 (dev only)
 */
export function getMockAvailability(soldOutDateIds: string[]): DateAvailability[] {
  return getMockAvailabilityForDates(eventDates, soldOutDateIds)
}

export function getMockAvailabilityForDates(
  dates: readonly EventDate[],
  soldOutDateIds: string[],
  options?: AvailabilityOptions
): DateAvailability[] {
  const capacitySettings = mergeCapacitySettings(
    dates,
    getDefaultCapacitySettings(dates, options?.ticketFormats),
    { byDateId: {}, byDateAndTicketType: {} },
    options?.ticketFormats
  )
  const poolKeys = getFormatCapacityKeys(options?.ticketFormats)
  const independentPools = (options?.ticketFormats?.length ?? 0) > 0

  return dates.map((d) => {
    const standardCap =
      capacitySettings.byDateAndTicketType[d.id]?.[STANDARD_CAPACITY_KEY] ??
      capacitySettings.byDateId[d.id] ??
      45
    const capacity = independentPools ? standardCap : (capacitySettings.byDateId[d.id] ?? 45)
    const soldOut = soldOutDateIds.includes(d.id)
    const sold = soldOut ? capacity : Math.floor(capacity * 0.6)
    const ticketPools = buildTicketPools(
      d.id,
      {},
      capacitySettings,
      poolKeys,
      options?.mockSoldOutTastingDateIds
    )

    return {
      dateId: d.id,
      label: d.label,
      sold,
      capacity,
      soldOut,
      ticketPools: ticketPools.length > 0 ? ticketPools : undefined,
    }
  })
}

/**
 * Fetch sold counts from Sheet and return availability per date.
 * Returns null if Sheets not configured (caller should treat all dates as available).
 */
export async function getAvailability(): Promise<DateAvailability[] | null> {
  return getAvailabilityForDates(eventDates)
}

export async function getAvailabilityForDates(
  dates: readonly EventDate[],
  options?: AvailabilityOptions
): Promise<DateAvailability[] | null> {
  const { spreadsheetId, sheetName } = getSheetsConfig()
  if (!spreadsheetId) return null

  const sheets = getSheetsClient()
  if (!sheets) return null

  const poolKeys = getFormatCapacityKeys(options?.ticketFormats)
  const defaultCapacity = getDefaultCapacitySettings(dates, options?.ticketFormats)
  const independentPools = (options?.ticketFormats?.length ?? 0) > 0

  try {
    const [paymentsRes, capacityFromSheet] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!D2:K`,
      }),
      getCapacityFromSheet(),
    ])
    const rows = (paymentsRes.data.values ?? []) as string[][]

    const soldByLabel: Record<string, number> = {}
    const soldByLabelAndTicketType: Record<string, Record<string, number>> = {}

    for (const row of rows) {
      const refunded = (row[7] ?? '').trim()
      if (refunded) continue

      const ticketDate = resolvePaymentTicketDate(row[0]?.trim() ?? '', dates)
      const ticketType = row[1]?.trim() ?? ''
      const qtyStr = row[3] ?? '1'
      const qty = parseInt(qtyStr, 10) || 1
      if (!ticketDate) continue

      soldByLabel[ticketDate] = (soldByLabel[ticketDate] ?? 0) + qty

      soldByLabelAndTicketType[ticketDate] ??= {}
      countSoldByTicketType(
        ticketType,
        qty,
        soldByLabelAndTicketType[ticketDate],
        independentPools
      )
    }

    const capacitySettings = mergeCapacitySettings(
      dates,
      defaultCapacity,
      resolveCapacitySettings(
        capacityFromSheet ?? { byDateId: {}, byDateAndTicketType: {} },
        dates
      ),
      options?.ticketFormats
    )

    return dates.map((d) => {
      const standardCap = capacitySettings.byDateAndTicketType[d.id]?.[STANDARD_CAPACITY_KEY]
      const capacity = independentPools
        ? (standardCap ?? defaultCapacity.byDateId[d.id] ?? 999)
        : (capacitySettings.byDateId[d.id] ?? 999)
      const sold = independentPools
        ? (soldByLabelAndTicketType[d.label]?.[STANDARD_CAPACITY_KEY] ?? 0)
        : (soldByLabel[d.label] ?? 0)
      const soldOut = capacity > 0 && sold >= capacity
      const ticketPools = buildTicketPools(
        d.id,
        soldByLabelAndTicketType[d.label] ?? {},
        capacitySettings,
        poolKeys,
        options?.mockSoldOutTastingDateIds
      )

      return {
        dateId: d.id,
        label: d.label,
        sold,
        capacity,
        soldOut,
        ticketPools: ticketPools.length > 0 ? ticketPools : undefined,
      }
    })
  } catch (err) {
    console.error(
      JSON.stringify({
        event: 'availability_fetch_failed',
        error: err instanceof Error ? err.message : String(err),
      })
    )
    return null
  }
}

export function getTicketPoolAvailability(
  availability: DateAvailability[] | null | undefined,
  dateId: string,
  ticketType: string
): TicketPoolAvailability | undefined {
  const dateAvail = availability?.find((a) => a.dateId === dateId)
  return dateAvail?.ticketPools?.find((p) => p.ticketType === ticketType)
}
