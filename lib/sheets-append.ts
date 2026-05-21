import type { sheets_v4 } from 'googleapis'

type SheetsClient = sheets_v4.Sheets

/**
 * Next data row (2+) for append. Uses column A (timestamp) and fills the first gap
 * instead of INSERT_ROWS, which can leave blank rows when the sheet has holes.
 */
export async function getNextSheetDataRow(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetName: string
): Promise<number> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A2:A`,
  })
  const rows = res.data.values ?? []
  for (let i = 0; i < rows.length; i++) {
    if (!(rows[i]?.[0] ?? '').trim()) {
      return i + 2
    }
  }
  return rows.length + 2
}

/** Write one row at the next data row; returns the 1-based sheet row number. */
export async function writeRowAtNextDataRow(
  sheets: SheetsClient,
  spreadsheetId: string,
  sheetName: string,
  row: string[]
): Promise<number> {
  const nextRow = await getNextSheetDataRow(sheets, spreadsheetId, sheetName)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${nextRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  })
  return nextRow
}
