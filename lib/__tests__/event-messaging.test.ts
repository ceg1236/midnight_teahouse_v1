import { describe, expect, it } from 'vitest'
import {
  getConfirmationEmailIntro,
  getCalendarDescription,
  getCalendarEventTitle,
  getEventPracticalNotes,
  getGoogleCalendarUrl,
  getTurbyBookingNotes,
  getTurbySuccessPageNotes,
  getTurbySuccessWhenLine,
} from '../event-messaging'

describe('Turby event messaging', () => {
  it('includes experience-specific when notes', () => {
    const open = getEventPracticalNotes('turby-event', 'open-teahouse')
    const tasting = getEventPracticalNotes('turby-event', 'guided-tasting')

    expect(open.find((n) => n.label === 'Experience')?.text).toBe('Open Teahouse, 11am')
    expect(tasting.find((n) => n.label === 'Experience')?.text).toBe('Guided Tasting, 10am')
    expect(open.find((n) => n.label === 'When')?.text).toContain('11am')
    expect(open.find((n) => n.label === 'When')?.text).toContain('3pm')
    expect(tasting.find((n) => n.label === 'When')?.text).toContain('10am')
  })

  it('includes outdoor, kids, pets, and ticket policies', () => {
    const notes = getEventPracticalNotes('turby-event', 'open-teahouse')
    expect(notes.find((n) => n.label === 'Outdoors')?.text).toContain('half-sunny, half-shaded yard')
    expect(notes.find((n) => n.label === 'Kids')?.text).toContain('kid-friendly')
    expect(notes.find((n) => n.label === 'Pets')?.text).toContain('delicate teaware')
    expect(notes.find((n) => n.label === 'Tickets')?.text).toContain('transfer to a friend')
    expect(notes.find((n) => n.label === 'Tea & food')?.text).toContain('unlimited tea')
    expect(notes.find((n) => n.label === 'Phones')?.text).toContain('phone and laptop-free')
  })

  it('uses different calendar times for tasting vs open teahouse', () => {
    const openUrl = getGoogleCalendarUrl(
      '2026-05-30',
      'title',
      'details',
      'location',
      'turby-event',
      'open-teahouse'
    )
    const tastingUrl = getGoogleCalendarUrl(
      '2026-05-30',
      'title',
      'details',
      'location',
      'turby-event',
      'guided-tasting'
    )

    expect(openUrl).toContain('20260530T180000Z/20260530T220000Z')
    expect(tastingUrl).toContain('20260530T170000Z/20260530T220000Z')
  })

  it('builds calendar title and description with experience', () => {
    expect(getCalendarEventTitle('turby-event', 'guided-tasting')).toContain('Guided Tasting, 10am')
    expect(getCalendarDescription('turby-event', { ticketFormat: 'open-teahouse' })).toContain(
      'Open Teahouse, 11am'
    )
  })

  it('omits guided tasting hours from open teahouse booking notes', () => {
    const openNotes = getTurbyBookingNotes('open-teahouse')
    const tastingNotes = getTurbyBookingNotes('guided-tasting')
    expect(openNotes.some((n) => n.includes('Guided tasting begins at 10am'))).toBe(false)
    expect(tastingNotes[0]).toContain('Guided tasting begins at 10am')
    expect(tastingNotes.some((n) => n.includes('Doors open at 11am'))).toBe(false)
  })

  it('returns success page when lines', () => {
    expect(getTurbySuccessWhenLine('guided-tasting')).toContain('10am')
    expect(getTurbySuccessWhenLine('open-teahouse')).toContain('11am')
    expect(getTurbySuccessWhenLine('open-teahouse')).toContain('3pm')
  })

  it('formats Turby confirmation page notes separately from email', () => {
    const openNotes = getTurbySuccessPageNotes('open-teahouse')
    const emailNotes = getEventPracticalNotes('turby-event', 'open-teahouse')
    expect(openNotes[0]?.text).toContain('Our venue address is')
    expect(openNotes.some((n) => n.text === 'Ticket type: Open Teahouse, 11am')).toBe(true)
    expect(openNotes.some((n) => n.label === 'Where')).toBe(false)
    expect(emailNotes.find((n) => n.label === 'Experience')?.text).toBe('Open Teahouse, 11am')
  })
})

describe('Midsummer event messaging', () => {
  it('uses evening hours, Washburn address, and rooftop in email/gcal notes', () => {
    const notes = getEventPracticalNotes('midsummer-event')
    expect(notes.find((n) => n.label === 'When')?.text).toContain('7pm')
    expect(notes.find((n) => n.label === 'Where')?.text).toBe('54 Washburn st, San Francisco')
    expect(notes.find((n) => n.label === 'Shoes')?.text).toContain('shoes-free')
    expect(notes.find((n) => n.label === 'Rooftop')?.text).toContain('rooftop')
  })

  it('builds calendar title and description for Midsummer Dream', () => {
    expect(getCalendarEventTitle('midsummer-event')).toBe('Midsummer Dream')
    const description = getCalendarDescription('midsummer-event')
    expect(description).toContain('Midsummer Dream')
    expect(description).toContain('Where: 54 Washburn st, San Francisco')
    expect(description).toContain('this evening with you')
  })

  it('uses 7–11pm Pacific in Google Calendar URL', () => {
    const url = getGoogleCalendarUrl(
      '2026-06-25',
      'Midsummer Dream',
      'details',
      '54 Washburn st, San Francisco',
      'midsummer-event'
    )
    expect(url).toContain('20260626T020000Z/20260626T060000Z')
    expect(url).toContain(encodeURIComponent('54 Washburn st, San Francisco'))
  })

  it('uses a Midsummer-specific confirmation email intro', () => {
    expect(getConfirmationEmailIntro('midsummer-event')).toContain('SoMa teahouse')
  })
})
