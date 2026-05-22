import { describe, expect, it } from 'vitest'
import type { EventTicketFormat } from '../../content/event-schema'
import { mergeCapacityForTicketFormats, parseCapacityRows } from '../sheets-capacity'
import { turbyEventDates } from '../../content/turby-event.config'
import {
  getFormatCapacityState,
  getMaxSelectableForExperience,
  isTastingSheetTicketType,
  STANDARD_CAPACITY_KEY,
} from '../ticket-pool'

const guidedTastingFormat = {
  id: 'guided-tasting',
  label: 'Guided Tasting, 10am',
  capacity: 6,
  capacityTicketType: 'tasting',
} as const satisfies EventTicketFormat

const openTeahouseFormat = {
  id: 'open-teahouse',
  label: 'Open Teahouse, 11am',
  capacity: 45,
  capacityTicketType: 'standard',
} as const satisfies EventTicketFormat

describe('parseCapacityRows', () => {
  it('parses total date capacity when TicketType is empty', () => {
    expect(
      parseCapacityRows([
        ['turby-may-30', '45', ''],
        ['mar-18', '45'],
      ])
    ).toEqual({
      byDateId: { 'turby-may-30': 45, 'mar-18': 45 },
      byDateAndTicketType: {},
    })
  })

  it('parses ticket pool capacity when TicketType is set', () => {
    expect(parseCapacityRows([['turby-may-30', '6', 'tasting']])).toEqual({
      byDateId: {},
      byDateAndTicketType: { 'turby-may-30': { tasting: 6 } },
    })
  })
})

describe('mergeCapacityForTicketFormats', () => {
  it('maps empty TicketType rows to the standard pool for format events', () => {
    expect(
      mergeCapacityForTicketFormats(
        parseCapacityRows([
          ['May-30', '5', ''],
          ['May-30', '6', 'tasting'],
        ]),
        turbyEventDates,
        [openTeahouseFormat, guidedTastingFormat]
      )
    ).toEqual({
      byDateId: {},
      byDateAndTicketType: {
        'turby-may-30': { [STANDARD_CAPACITY_KEY]: 5, tasting: 6 },
      },
    })
  })

  it('Config standard cap overrides the 45 default from event config', () => {
    expect(
      mergeCapacityForTicketFormats(
        {
          byDateId: { 'turby-may-30': 5 },
          byDateAndTicketType: {
            'turby-may-30': { [STANDARD_CAPACITY_KEY]: 45, tasting: 6 },
          },
        },
        turbyEventDates,
        [openTeahouseFormat, guidedTastingFormat]
      )
    ).toEqual({
      byDateId: {},
      byDateAndTicketType: {
        'turby-may-30': { [STANDARD_CAPACITY_KEY]: 5, tasting: 6 },
      },
    })
  })
})

describe('isTastingSheetTicketType', () => {
  it('matches current and legacy tasting ticket type labels', () => {
    expect(isTastingSheetTicketType('Tasting')).toBe(true)
    expect(isTastingSheetTicketType('Tasting Supported')).toBe(true)
    expect(isTastingSheetTicketType('Tasting · Supported $45')).toBe(true)
    expect(isTastingSheetTicketType('Guided Tasting · Tasting')).toBe(true)
    expect(isTastingSheetTicketType('Community')).toBe(false)
    expect(isTastingSheetTicketType('Supported $20')).toBe(false)
  })
})

describe('getFormatCapacityState', () => {
  const dateId = 'turby-may-30'
  const ticketPoolByDateId = {
    [dateId]: {
      tasting: { remaining: 2, soldOut: false },
      standard: { remaining: 0, soldOut: true },
    },
  }

  it('uses only the tasting pool for guided tasting (independent of standard)', () => {
    expect(
      getFormatCapacityState(guidedTastingFormat, dateId, {}, ticketPoolByDateId)
    ).toEqual({
      poolRemaining: 2,
      remaining: 2,
      soldOut: false,
    })
  })

  it('uses only the standard pool for open teahouse', () => {
    expect(
      getFormatCapacityState(openTeahouseFormat, dateId, {}, ticketPoolByDateId)
    ).toEqual({
      poolRemaining: 0,
      remaining: 0,
      soldOut: true,
    })
  })

  it('uses venue capacity only for invite-style events without pools', () => {
    const inviteFormat = {
      id: 'evening',
      label: 'Evening',
    } as const satisfies EventTicketFormat

    expect(
      getFormatCapacityState(inviteFormat, dateId, { [dateId]: 4 }, ticketPoolByDateId)
    ).toEqual({
      venueRemaining: 4,
      remaining: 4,
      soldOut: false,
    })
  })
})

describe('getMaxSelectableForExperience', () => {
  const dateId = 'turby-may-30'
  const ticketPoolByDateId = {
    [dateId]: { tasting: { remaining: 5, soldOut: false } },
  }

  it('allows tasting bookings even when standard pool is full', () => {
    expect(
      getMaxSelectableForExperience(
        guidedTastingFormat,
        dateId,
        { [dateId]: 0 },
        ticketPoolByDateId,
        false
      )
    ).toBe(4)
  })
})
