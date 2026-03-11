import { describe, it, expect } from 'vitest'
import { resolveDoorDate } from '../door-date'

const dates = [
  { id: 'mar-18', value: '2026-03-18' },
  { id: 'mar-19', value: '2026-03-19' },
  { id: 'mar-20', value: '2026-03-20' },
]

describe('resolveDoorDate', () => {
  it('returns matching date when today matches an event date', () => {
    expect(resolveDoorDate('2026-03-18', dates)).toBe('mar-18')
    expect(resolveDoorDate('2026-03-19', dates)).toBe('mar-19')
    expect(resolveDoorDate('2026-03-20', dates)).toBe('mar-20')
  })

  it('returns first date when today does not match any event', () => {
    expect(resolveDoorDate('2026-03-10', dates)).toBe('mar-18')
    expect(resolveDoorDate('2026-03-21', dates)).toBe('mar-18')
    expect(resolveDoorDate('2025-12-25', dates)).toBe('mar-18')
  })

  it('returns null when dates array is empty', () => {
    expect(resolveDoorDate('2026-03-18', [])).toBe(null)
  })

  it('returns first date when dates have no value field', () => {
    const datesNoValue = [{ id: 'mar-18' }, { id: 'mar-19' }]
    expect(resolveDoorDate('2026-03-18', datesNoValue)).toBe('mar-18')
  })
})
