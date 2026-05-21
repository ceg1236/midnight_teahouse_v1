import { describe, expect, it } from 'vitest'
import {
  getCalendarDescription,
  getCalendarEventTitle,
  getEventPracticalNotes,
  getGoogleCalendarUrl,
  getTurbySuccessWhenLine,
} from '../event-messaging'

describe('Turby event messaging', () => {
  it('includes experience-specific when notes', () => {
    const open = getEventPracticalNotes('turby-event', 'open-teahouse')
    const tasting = getEventPracticalNotes('turby-event', 'guided-tasting')

    expect(open.find((n) => n.label === 'Experience')?.text).toBe('Open Teahouse, 11am')
    expect(tasting.find((n) => n.label === 'Experience')?.text).toBe('Guided Tasting, 10am')
    expect(open.find((n) => n.label === 'When')?.text).toContain('11am')
    expect(tasting.find((n) => n.label === 'When')?.text).toContain('10am')
  })

  it('includes outdoor yard note', () => {
    const notes = getEventPracticalNotes('turby-event', 'open-teahouse')
    expect(notes.find((n) => n.label === 'Outdoors')?.text).toContain('half-sunny, half-shaded yard')
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

  it('returns success page when lines', () => {
    expect(getTurbySuccessWhenLine('guided-tasting')).toContain('10am')
    expect(getTurbySuccessWhenLine('open-teahouse')).toContain('11am')
  })
})
