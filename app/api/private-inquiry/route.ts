import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml } from '../../../lib/escape-html'

const INQUIRY_TO = process.env.PRIVATE_INQUIRY_TO ?? 'midnight.teahouse.sf@gmail.com'
const MAX_LEN = { name: 200, email: 320, eventType: 200, isoDate: 10, message: 8000 }
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseIsoDate(s: string): number | null {
  if (!ISO_DATE.test(s)) return null
  const t = Date.parse(`${s}T12:00:00.000Z`)
  return Number.isNaN(t) ? null : t
}

function trimField(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

/**
 * Private event inquiry — delivered via Resend (address not exposed in static HTML).
 * Anti-spam: honeypot field must be empty; basic validation; HTML-escaped body.
 */
export async function POST(req: Request) {
  let body: {
    name?: string
    email?: string
    eventType?: string
    approximateDate?: string
    message?: string
    /** Honeypot — bots often fill this; humans never see it */
    company?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const company = typeof body.company === 'string' ? body.company.trim() : ''
  if (company.length > 0) {
    return NextResponse.json({ ok: true })
  }

  const name = trimField(body.name, MAX_LEN.name)
  const email = trimField(body.email, MAX_LEN.email)
  const eventType = trimField(body.eventType, MAX_LEN.eventType)
  const approximateDate = trimField(body.approximateDate, MAX_LEN.isoDate)
  const message = trimField(body.message, MAX_LEN.message)

  if (approximateDate && !parseIsoDate(approximateDate)) {
    return NextResponse.json({ error: 'Please use a valid approximate date.' }, { status: 400 })
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Please fill in your name, email, and a short message.' },
      { status: 400 }
    )
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('private-inquiry: RESEND_API_KEY not set')
    return NextResponse.json({ error: 'Email is not configured yet.' }, { status: 503 })
  }

  const from = process.env.RESEND_FROM ?? 'Midnight Teahouse <onboarding@resend.dev>'
  const resend = new Resend(apiKey)

  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeType = escapeHtml(eventType)
  const safeApproxDate = escapeHtml(approximateDate)
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br/>')

  const html = `
<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #222;">
  <p><strong>Private event inquiry</strong> (Midnight Teahouse site)</p>
  <table style="border-collapse: collapse;">
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Name</strong></td><td>${safeName}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Email</strong></td><td>${safeEmail}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Event type</strong></td><td>${safeType || '—'}</td></tr>
    <tr><td style="padding: 4px 12px 4px 0;"><strong>Approximate date</strong></td><td>${safeApproxDate || '—'}</td></tr>
  </table>
  <p><strong>Message</strong></p>
  <p style="white-space: pre-wrap;">${safeMessage}</p>
</body></html>`.trim()

  const subjectName = name.replace(/[\r\n]/g, ' ').slice(0, 80)
  const { error } = await resend.emails.send({
    from,
    to: [INQUIRY_TO],
    replyTo: email,
    subject: `Private event inquiry from ${subjectName}`,
    html,
  })

  if (error) {
    console.error('private-inquiry resend:', error)
    return NextResponse.json({ error: 'Could not send your message. Please try again later.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
