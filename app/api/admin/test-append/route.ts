/**
 * Dev-only: Append a test row to the sheet.
 * Use to test new row color (white) without doing a full checkout.
 *
 * POST /api/admin/test-append
 * Body: { password }
 */

import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { eventDates } from '../../../../content/event-invite.config'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const expected = process.env.ADMIN_PASSWORD
  if (!expected || body.password !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const spreadsheetId = process.env.SPREADSHEET_ID
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const sheetName = process.env.SPREADSHEET_SHEET_NAME || 'Sheet1'

  if (!spreadsheetId || (!credentialsJson && !credentialsPath)) {
    return NextResponse.json({ error: 'Sheets not configured' }, { status: 500 })
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

  const testId = `pi_test_${Date.now()}`
  const date = eventDates[0]
  const row = [
    new Date().toISOString(),
    'Test User',
    'test@example.com',
    date?.label ?? 'Test Date',
    'Community',
    '$40',
    '1',
    'Test append - safe to delete',
    'desktop',
    testId,
    '', // Refunded
    '', // Refund Notes
  ]

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A2:L`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })

  const updatedRange = appendRes.data?.updates?.updatedRange
  let appendedRow: number | null = null
  if (updatedRange) {
    const rowMatch = updatedRange.match(/!A(\d+):/)
    appendedRow = rowMatch ? parseInt(rowMatch[1], 10) : null
    if (appendedRow != null) {
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
                  startRowIndex: appendedRow - 1,
                  endRowIndex: appendedRow,
                  startColumnIndex: 0,
                  endColumnIndex: 12,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: {
                      red: 1,
                      green: 1,
                      blue: 1,
                    },
                  },
                },
                fields: 'userEnteredFormat.backgroundColor',
              },
            },
          ],
        },
      })
    }
  }

  return NextResponse.json({
    ok: true,
    message: `Test row appended`,
    paymentId: testId,
    row: appendedRow,
    hint: `Use this paymentId with POST /api/admin/test-refund to test refund flow`,
  })
}
