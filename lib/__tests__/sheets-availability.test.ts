import { describe, expect, it } from 'vitest'
import { turbyEventDates } from '../../content/turby-event.config'
import { resolvePaymentTicketDate } from '../sheets-availability'

describe('resolvePaymentTicketDate', () => {
  it('returns canonical labels for sheet serial date numbers', () => {
    expect(resolvePaymentTicketDate('46172', turbyEventDates)).toBe('Saturday, May 30')
  })

  it('passes through labels that already match', () => {
    expect(resolvePaymentTicketDate('Saturday, May 30', turbyEventDates)).toBe('Saturday, May 30')
  })
})
