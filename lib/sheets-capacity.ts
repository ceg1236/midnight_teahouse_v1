/**
 * Read capacity per date from Google Sheet "Config" tab.
 * Config sheet: A=DateId, B=Capacity. Row 1 = header, data from row 2.
 * Edit capacity directly in the sheet; no admin portal.
 */

import path from 'path'
import { google } from 'googleapis'
import { eventDates } from '../content/event-invite.config'
import type { EventDate } from '../content/event-schema'
import { getSheetsConfig } from './payment-env'

const CONFIG_SHEET_NAME = 'Config'

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

/** Default capacity from event-invite.config */
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

/**
 * Read capacity from Config sheet. Returns null if Config not found (use defaults).
 */
export async function getCapacityFromSheet(): Promise<Record<string, number> | null> {
  const { spreadsheetId } = getSheetsConfig()
  if (!spreadsheetId) return null

  const sheets = getSheetsClient()
  if (!sheets) return null

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${CONFIG_SHEET_NAME}!A2:B`,
    })
    const rows = (res.data.values ?? []) as string[][]
    const capacityByDateId: Record<string, number> = {}
    for (const row of rows) {
      const dateId = (row[0] ?? '').trim().toLowerCase()
      const cap = parseInt(String(row[1] ?? ''), 10)
      if (dateId && !isNaN(cap) && cap >= 0) {
        capacityByDateId[dateId] = cap
      }
    }
    return Object.keys(capacityByDateId).length > 0 ? capacityByDateId : null
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
