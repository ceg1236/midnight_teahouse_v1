/**
 * Apply refund to a sheet row by payment ID.
 * Updates Refunded (K) and Refund Notes (L), applies coral background.
 */

import { google } from 'googleapis'
import { getSheetsConfig } from './payment-env'

export type ApplyRefundResult =
  | { ok: true; row: number }
  | { ok: false; error: string }

export async function applyRefundToSheet(
  paymentId: string,
  refundNotes: string
): Promise<ApplyRefundResult> {
  const { spreadsheetId, credentialsJson, credentialsPath, sheetName } = getSheetsConfig()

  if (!spreadsheetId || (!credentialsJson && !credentialsPath)) {
    return { ok: false, error: 'Sheets not configured' }
  }

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
  const sheets = google.sheets({ version: 'v4', auth })

  const piTrimmed = paymentId.trim()

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:L`,
  })
  const rows = (res.data.values ?? []) as string[][]
  const rowIndex = rows.findIndex((row) => (row[9] ?? '').trim() === piTrimmed)
  if (rowIndex < 0) {
    return { ok: false, error: `Payment ID not found in sheet: ${piTrimmed}` }
  }

  const dataRow = rowIndex + 2
  const refundDate = new Date().toISOString().split('T')[0]

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!K${dataRow}:L${dataRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[refundDate, refundNotes]] },
  })

  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const sheet = meta.data.sheets?.find(
    (s) => (s.properties?.title ?? '').trim() === sheetName.trim()
  )
  const sheetId = sheet?.properties?.sheetId ?? 0

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: dataRow - 1,
              endRowIndex: dataRow,
              startColumnIndex: 0,
              endColumnIndex: 12,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 255 / 255,
                  green: 204 / 255,
                  blue: 204 / 255,
                },
              },
            },
            fields: 'userEnteredFormat.backgroundColor',
          },
        },
      ],
    },
  })

  return { ok: true, row: dataRow }
}
