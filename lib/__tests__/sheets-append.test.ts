import { describe, expect, it } from 'vitest'
import { getNextSheetDataRow } from '../sheets-append'

describe('getNextSheetDataRow', () => {
  const sheets = {
    spreadsheets: {
      values: {
        get: async ({ range }: { range: string }) => {
          if (range.endsWith('!A2:A')) {
            return {
              data: {
                values: [['2026-01-01'], [], ['2026-01-03']],
              },
            }
          }
          return { data: { values: [] } }
        },
      },
    },
  }

  it('returns the first empty row in column A', async () => {
    const row = await getNextSheetDataRow(
      sheets as never,
      'sheet-id',
      'Payments'
    )
    expect(row).toBe(3)
  })

  it('returns row 2 when sheet is empty', async () => {
    const emptySheets = {
      spreadsheets: {
        values: {
          get: async () => ({ data: { values: [] } }),
        },
      },
    }
    const row = await getNextSheetDataRow(emptySheets as never, 'sheet-id', 'Payments')
    expect(row).toBe(2)
  })
})
