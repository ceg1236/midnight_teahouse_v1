/**
 * Read capacity from Google Sheet "Config" tab.
 * Config sheet: A=DateId, B=Capacity, C=TicketType (optional). Row 1 = header, data from row 2.
 * Edit capacity directly in the sheet; no admin portal.
 *
 * When TicketType (col C) is empty, B is total capacity for invite-style events, or the
 * standard/Open Teahouse pool when the event uses separate experience formats (Turby).
 * When TicketType is set (e.g. `standard`, `tasting`), B is the cap for that pool only.
 */

import path from 'path'
import { google } from 'googleapis'
import { eventDates } from '../content/event-invite.config'
import type { EventDate, EventTicketFormat } from '../content/event-schema'
import { resolveConfigDateKey } from './config-date-key'
import { getFormatCapacityTicketType, STANDARD_CAPACITY_KEY } from './ticket-pool'
import { getSheetsConfig } from './payment-env'

const CONFIG_SHEET_NAME = 'Config'

export type CapacitySettings = {
  /** dateId -> total event capacity */
  byDateId: Record<string, number>
  /** dateId -> ticketType key -> pool capacity */
  byDateAndTicketType: Record<string, Record<string, number>>
}

function getSheetsClient() {
  const { credentialsJson, credentialsPath } = getSheetsConfig()
  if (credentialsJson) {
    return google.sheets({
      version: 'v4',
      auth: new google.auth.GoogleAuth({
        credentials: JSON.parse(credentialsJson) as object,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      }),
    })
  }
  if (!credentialsPath) return null
  return google.sheets({
    version: 'v4',
    auth: new google.auth.GoogleAuth({
      keyFile: path.isAbsolute(credentialsPath)
        ? credentialsPath
        : path.resolve(process.cwd(), credentialsPath),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    }),
  })
}

/** Default total capacity per date from event config. */
export function getDefaultCapacity(dates: readonly EventDate[] = eventDates): Record<string, number> {
  return Object.fromEntries(
    dates.map((d) => [
      d.id,
      typeof (d as { capacity?: number }).capacity === 'number'
        ? (d as { capacity: number }).capacity
        : 45,
    ])
  )
}

/** Defaults for total + optional ticket pools (e.g. tasting cap on Turby). */
export function getDefaultCapacitySettings(
  dates: readonly EventDate[],
  ticketFormats?: readonly EventTicketFormat[]
): CapacitySettings {
  const byDateId = getDefaultCapacity(dates)
  const byDateAndTicketType: Record<string, Record<string, number>> = {}

  if (ticketFormats?.length) {
    for (const date of dates) {
      for (const format of ticketFormats) {
        const ticketType = getFormatCapacityTicketType(format)
        if (!ticketType || typeof format.capacity !== 'number') continue
        byDateAndTicketType[date.id] ??= {}
        byDateAndTicketType[date.id][ticketType] = format.capacity
      }
    }
  }

  return { byDateId, byDateAndTicketType }
}

export function parseCapacityRows(rows: string[][]): CapacitySettings {
  const byDateId: Record<string, number> = {}
  const byDateAndTicketType: Record<string, Record<string, number>> = {}

  for (const row of rows) {
    const dateId = (row[0] ?? '').trim().toLowerCase()
    const cap = parseInt(String(row[1] ?? ''), 10)
    const ticketType = (row[2] ?? '').trim().toLowerCase()
    if (!dateId || isNaN(cap) || cap < 0) continue

    if (ticketType) {
      byDateAndTicketType[dateId] ??= {}
      byDateAndTicketType[dateId][ticketType] = cap
    } else {
      byDateId[dateId] = cap
    }
  }

  return { byDateId, byDateAndTicketType }
}

/**
 * For events with experience formats (Turby), tasting and standard caps are independent.
 * Config rows with empty TicketType become the standard pool; total byDateId caps are not used.
 */
export function mergeCapacityForTicketFormats(
  settings: CapacitySettings,
  dates: readonly EventDate[],
  ticketFormats?: readonly EventTicketFormat[]
): CapacitySettings {
  if (!ticketFormats?.length) return settings

  const byDateAndTicketType: Record<string, Record<string, number>> = {}

  for (const [key, pools] of Object.entries(settings.byDateAndTicketType)) {
    const dateId = resolveConfigDateKey(key, dates) ?? key
    byDateAndTicketType[dateId] = { ...(byDateAndTicketType[dateId] ?? {}), ...pools }
  }

  for (const [key, cap] of Object.entries(settings.byDateId)) {
    const dateId = resolveConfigDateKey(key, dates) ?? key
    byDateAndTicketType[dateId] ??= {}
    // Config empty TicketType row overrides event defaults (e.g. 5 from sheet, not 45 from config file).
    byDateAndTicketType[dateId][STANDARD_CAPACITY_KEY] = cap
  }

  return { byDateId: {}, byDateAndTicketType }
}

/**
 * Read capacity from Config sheet. Returns null if Config not found (use defaults).
 */
export async function getCapacityFromSheet(): Promise<CapacitySettings | null> {
  const { spreadsheetId } = getSheetsConfig()
  if (!spreadsheetId) return null

  const sheets = getSheetsClient()
  if (!sheets) return null

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${CONFIG_SHEET_NAME}!A2:C`,
    })
    const rows = (res.data.values ?? []) as string[][]
    const settings = parseCapacityRows(rows)
    const hasData =
      Object.keys(settings.byDateId).length > 0 ||
      Object.keys(settings.byDateAndTicketType).length > 0
    return hasData ? settings : null
  } catch (err: unknown) {
    console.error('[sheets-capacity] getCapacityFromSheet failed:', extractErrorMessage(err), err)
    return null
  }
}

/** Extract a useful error message from Google API or generic errors */
function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const g = err as Error & {
      response?: { data?: { error?: { message?: string; errors?: Array<{ message?: string }> } } }
      errors?: Array<{ message?: string }>
    }
    const apiErr = g.response?.data?.error
    const apiMsg = apiErr?.message ?? apiErr?.errors?.[0]?.message ?? g.errors?.[0]?.message
    if (apiMsg) return apiMsg
    return err.message
  }
  return String(err)
}
