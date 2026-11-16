import { NextResponse } from 'next/server'
import { getPreviewHtml, type PreviewEmailOptions } from '../../../lib/confirmation-email'
import { isKnownEventSlug } from '../../../lib/event-registry'

/**
 * Preview the confirmation email HTML in the browser.
 * Dev only – no auth; use for layout and copy iteration.
 *
 * GET /api/email-preview
 * GET /api/email-preview?eventSlug=midsummer-event
 * GET /api/email-preview?eventSlug=midsummer-event&dateId=midsummer-jun-26&name=Jordan
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const eventSlug = searchParams.get('eventSlug')
  if (eventSlug && !isKnownEventSlug(eventSlug)) {
    return NextResponse.json({ error: `Unknown eventSlug: ${eventSlug}` }, { status: 400 })
  }

  const options: PreviewEmailOptions = {}
  if (eventSlug) options.eventSlug = eventSlug
  const dateId = searchParams.get('dateId')
  if (dateId) options.dateId = dateId
  const name = searchParams.get('name')
  if (name) options.name = name
  const ticketDate = searchParams.get('ticketDate')
  if (ticketDate) options.ticketDate = ticketDate
  const amountPaid = searchParams.get('amountPaid')
  if (amountPaid) options.amountPaid = amountPaid
  const quantity = searchParams.get('quantity')
  if (quantity) options.quantity = quantity
  const orderSummary = searchParams.get('orderSummary')
  if (orderSummary) options.orderSummary = orderSummary
  const ticketFormat = searchParams.get('ticketFormat')
  if (ticketFormat) options.ticketFormat = ticketFormat

  const html = getPreviewHtml(options)
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
