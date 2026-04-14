/**
 * Read sold ticket counts from Google Sheets and compute availability per date.
 * Sheet columns: A=Timestamp, B=Name, C=Email, D=Ticket date, E=Ticket type, F=Amount paid, G=Quantity, H=Notes, I=Device, J=Stripe Payment ID, K=Refunded.
 * We sum Quantity (G) grouped by Ticket date (D), excluding rows where Refunded (K) is non-empty.
 */

import { google } from 'googleapis'
import { eventDates } from '../content/event-invite.config'
import { getCapacityFromSheet, getDefaultCapacity } from './sheets-capacity'
import type { EventDate } from '../content/event-schema'
import { getSheetsConfig } from './payment-env'

export type DateAvailability = {
  dateId: string
  label: string
  sold: number
  capacity: number
  soldOut: boolean
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

/**
 * Return mock availability for UI testing. Use with /invite?mock=soldOut:mar-18,mar-19 (dev only)
 */
export function getMockAvailability(soldOutDateIds: string[]): DateAvailability[] {
  return getMockAvailabilityForDates(eventDates, soldOutDateIds)
}

export function getMockAvailabilityForDates(
  dates: readonly EventDate[],
  soldOutDateIds: string[]
): DateAvailability[] {
  return dates.map((d) => {
    const capacity = typeof (d as { capacity?: number }).capacity === 'number'
      ? (d as { capacity: number }).capacity
      : 45
    const soldOut = soldOutDateIds.includes(d.id)
    const sold = soldOut ? capacity : Math.floor(capacity * 0.6) // fake "60% sold" for non-sold-out
    return {
      dateId: d.id,
      label: d.label,
      sold,
      capacity,
      soldOut,
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
  dates: readonly EventDate[]
): Promise<DateAvailability[] | null> {
  const { spreadsheetId, sheetName } = getSheetsConfig()
  if (!spreadsheetId) return null

  const sheets = getSheetsClient()
  if (!sheets) return null

  try {
    // Read D (Ticket date), G (Quantity), K (Refunded) - exclude refunded rows
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!D2:K`,
    })
    const rows = (res.data.values ?? []) as string[][]

    // soldByLabel: label -> total quantity sold (excluding refunded)
    const soldByLabel: Record<string, number> = {}
    for (const row of rows) {
      const refunded = (row[7] ?? '').trim() // K (0-indexed: D=0..K=7)
      if (refunded) continue

      const ticketDate = row[0]?.trim() ?? '' // D
      const qtyStr = row[3] ?? '1' // G (0-indexed: D=0, E=1, F=2, G=3)
      const qty = parseInt(qtyStr, 10) || 1
      if (ticketDate) {
        soldByLabel[ticketDate] = (soldByLabel[ticketDate] ?? 0) + qty
      }
    }

    const capacityByDateId = (await getCapacityFromSheet()) ?? getDefaultCapacity(dates)

    return dates.map((d) => {
      const capacity = capacityByDateId[d.id] ?? 999
      const sold = soldByLabel[d.label] ?? 0
      const soldOut = capacity > 0 && sold >= capacity

      return {
        dateId: d.id,
        label: d.label,
        sold,
        capacity,
        soldOut,
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
