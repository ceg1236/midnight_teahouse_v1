import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getPreviewHtml } from '../../../lib/confirmation-email'

/**
 * Send a test confirmation email to your own address.
 * Only works in development (NODE_ENV=development).
 *
 * POST /api/email-test
 * Body: { "to": "your@email.com", "name": "Alex", "ticketDate": "...", "orderSummary": "...", "amountPaid": "$25", "quantity": "1" }
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Email test only available in development' },
      { status: 403 }
    )
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY not set in .env' },
      { status: 500 }
    )
  }

  let body: {
    to?: string
    name?: string
    ticketDate?: string
    orderSummary?: string
    amountPaid?: string
    quantity?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const to = typeof body?.to === 'string' ? body.to.trim() : ''
  if (!to) {
    return NextResponse.json(
      { error: 'Body must include "to": "your@email.com"' },
      { status: 400 }
    )
  }

  const overrides: Record<string, string> = {
    to,
    name: typeof body?.name === 'string' ? body.name : 'Alex',
  }
  if (typeof body?.ticketDate === 'string') overrides.ticketDate = body.ticketDate
  if (typeof body?.orderSummary === 'string') overrides.orderSummary = body.orderSummary
  if (typeof body?.amountPaid === 'string') overrides.amountPaid = body.amountPaid
  if (typeof body?.quantity === 'string') overrides.quantity = body.quantity

  const html = getPreviewHtml(overrides)

  const from = process.env.RESEND_FROM ?? 'Midnight Teahouse <onboarding@resend.dev>'
  const replyTo = process.env.RESEND_REPLY_TO
  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    ...(replyTo && { replyTo }),
    subject: 'Confirmation: Crossing into Spring at Midnight Teahouse ✨',
    html,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, emailId: data?.id, to })
}
