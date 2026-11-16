import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
  getConfirmationEmailSubject,
  getPreviewHtml,
  type PreviewEmailOptions,
} from '../../../lib/confirmation-email'
import { isKnownEventSlug } from '../../../lib/event-registry'

/**
 * Send a test confirmation email to your own address.
 * Only works in development (NODE_ENV=development).
 *
 * POST /api/email-test
 * Body: { "to": "your@email.com", "eventSlug": "midsummer-event", "dateId": "midsummer-jun-26", "name": "Alex" }
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

  let body: PreviewEmailOptions & { to?: string }
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

  if (body.eventSlug && !isKnownEventSlug(body.eventSlug)) {
    return NextResponse.json({ error: `Unknown eventSlug: ${body.eventSlug}` }, { status: 400 })
  }

  const options: PreviewEmailOptions = { ...body, to }
  const html = getPreviewHtml(options)
  const eventSlug = options.eventSlug ?? 'midsummer-event'

  const from = process.env.RESEND_FROM ?? 'Midnight Teahouse <onboarding@resend.dev>'
  const replyTo = process.env.RESEND_REPLY_TO
  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    ...(replyTo && { replyTo }),
    subject: getConfirmationEmailSubject(eventSlug),
    html,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, emailId: data?.id, to })
}
