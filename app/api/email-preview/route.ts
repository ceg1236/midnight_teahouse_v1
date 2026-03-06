import { NextResponse } from 'next/server'
import { getPreviewHtml } from '../../../lib/confirmation-email'

/**
 * Preview the confirmation email HTML in the browser.
 * Dev only – no auth; use for layout and copy iteration.
 *
 * GET /api/email-preview
 * GET /api/email-preview?name=Jordan&orderSummary=2+×+Community+$40
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const overrides: Record<string, string> = {}
  const name = searchParams.get('name')
  if (name) overrides.name = name
  const ticketDate = searchParams.get('ticketDate')
  if (ticketDate) overrides.ticketDate = ticketDate
  const amountPaid = searchParams.get('amountPaid')
  if (amountPaid) overrides.amountPaid = amountPaid
  const quantity = searchParams.get('quantity')
  if (quantity) overrides.quantity = quantity
  const orderSummary = searchParams.get('orderSummary')
  if (orderSummary) overrides.orderSummary = orderSummary

  const html = getPreviewHtml(overrides)
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
