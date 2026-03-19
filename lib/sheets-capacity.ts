/**
 * Read/write capacity per date from Google Sheet "Config" tab.
 * Config sheet: A=DateId, B=Capacity. Row 1 = header.
 */

import { google } from 'googleapis'
import { eventDates } from '../content/event-invite.config'

const CONFIG_SHEET_NAME = 'Config'

function getSheetsClient() {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!credentialsJson && !credentialsPath) return null

  const auth = new google.auth.GoogleAuth(
    credentialsJson
      ? {
          credentials: JSON.parse(credentialsJson) as object,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        }
      : {
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        }
  )
  return google.sheets({ version: 'v4', auth })
}

/** Default capacity from event-invite.config */
export function getDefaultCapacity(): Record<string, number> {
  return Object.fromEntries(
    eventDates.map((d) => [
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
  const spreadsheetId = process.env.SPREADSHEET_ID
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
      const dateId = (row[0] ?? '').trim()
      const cap = parseInt(String(row[1] ?? ''), 10)
      if (dateId && !isNaN(cap) && cap >= 0) {
        capacityByDateId[dateId] = cap
      }
    }
    return Object.keys(capacityByDateId).length > 0 ? capacityByDateId : null
  } catch {
    return null
  }
}

/**
 * Write capacity to Config sheet. Creates sheet if missing.
 */
export async function writeCapacityToSheet(
  capacities: Record<string, number>
): Promise<{ ok: boolean; error?: string }> {
  const spreadsheetId = process.env.SPREADSHEET_ID
  if (!spreadsheetId) return { ok: false, error: 'SPREADSHEET_ID not set' }

  const sheets = getSheetsClient()
  if (!sheets) return { ok: false, error: 'Sheets not configured' }

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId })
    const configSheet = meta.data.sheets?.find(
      (s) => (s.properties?.title ?? '').trim() === CONFIG_SHEET_NAME
    )

    if (!configSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: CONFIG_SHEET_NAME },
              },
            },
          ],
        },
      })
    }

    const dateIds = eventDates.map((d) => d.id)
    const values: (string | number)[][] = [['DateId', 'Capacity']]
    for (const id of dateIds) {
      values.push([id, capacities[id] ?? 45])
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${CONFIG_SHEET_NAME}!A1:B${values.length}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    })

    return { ok: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, error: msg }
  }
}
