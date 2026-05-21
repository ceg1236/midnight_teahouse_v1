import { describe, expect, it } from 'vitest'
import { turbyEventDates } from '../../content/turby-event.config'
import { getConfigDateAliases, resolveConfigDateKey } from '../config-date-key'
import { resolveCapacitySettings } from '../sheets-availability'
import { parseCapacityRows } from '../sheets-capacity'

describe('config date keys', () => {
  it('includes may-30 alias for Turby', () => {
    expect(getConfigDateAliases(turbyEventDates[0])).toContain('may-30')
  })

  it('resolves May-30 to turby-may-30', () => {
    expect(resolveConfigDateKey('May-30', turbyEventDates)).toBe('turby-may-30')
    expect(resolveConfigDateKey('may 30', turbyEventDates)).toBe('turby-may-30')
  })

  it('resolves capacity rows using short date keys', () => {
    const parsed = parseCapacityRows([
      ['May-30', '45', ''],
      ['May-30', '6', 'tasting'],
    ])
    const resolved = resolveCapacitySettings(parsed, turbyEventDates)
    expect(resolved.byDateId['turby-may-30']).toBe(45)
    expect(resolved.byDateAndTicketType['turby-may-30']?.tasting).toBe(6)
  })
})
