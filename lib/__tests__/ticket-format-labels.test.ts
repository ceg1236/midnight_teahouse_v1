import { describe, expect, it } from 'vitest'
import { formatSheetTicketType } from '../ticket-format-labels'
import { turbyEventTiers, turbyTicketFormats } from '../../content/turby-event.config'
import { getTiersForTicketFormat } from '../event-tiers'

const openTiers = getTiersForTicketFormat(turbyEventTiers, turbyTicketFormats, 'open-teahouse')
const tastingTiers = getTiersForTicketFormat(turbyEventTiers, turbyTicketFormats, 'guided-tasting')

describe('formatSheetTicketType', () => {
  it('writes open teahouse tier labels without format prefix', () => {
    expect(formatSheetTicketType('community:1', openTiers, 'open-teahouse')).toBe('Community')
    expect(formatSheetTicketType('patron:1', openTiers, 'open-teahouse')).toBe('Supporter')
  })

  it('includes chosen price for open teahouse supported tickets', () => {
    expect(formatSheetTicketType('supported:1', openTiers, 'open-teahouse', 20)).toBe('Supported $20')
  })

  it('writes tasting category for guided tasting full-price tickets', () => {
    expect(formatSheetTicketType('tasting:1', tastingTiers, 'guided-tasting')).toBe('Tasting')
  })

  it('writes tasting supported label with chosen price for guided tasting', () => {
    expect(formatSheetTicketType('supported:1', tastingTiers, 'guided-tasting', 45)).toBe(
      'Tasting · Supported $45'
    )
  })
})
