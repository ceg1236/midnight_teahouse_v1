import { NextResponse } from 'next/server'

const MAILERLITE_URL = 'https://connect.mailerlite.com/api/subscribers'

function trimEmail(v: unknown): string {
  if (typeof v !== 'string') return ''
  return v.trim().toLowerCase().slice(0, 320)
}

/**
 * Add email to MailerLite group (double opt-in / compliance handled in MailerLite).
 * Anti-spam: honeypot field must be empty.
 */
export async function POST(req: Request) {
  let body: { email?: string; company?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const company = typeof body.company === 'string' ? body.company.trim() : ''
  if (company.length > 0) {
    return NextResponse.json({ ok: true })
  }

  const email = trimEmail(body.email)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const apiKey = process.env.MAILERLITE_API_KEY
  const groupId = process.env.MAILERLITE_GROUP_ID
  if (!apiKey || !groupId) {
    console.error('newsletter: MAILERLITE_API_KEY or MAILERLITE_GROUP_ID not set')
    return NextResponse.json({ error: 'Newsletter signup is not configured yet.' }, { status: 503 })
  }

  const res = await fetch(MAILERLITE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      groups: [groupId],
    }),
  })

  if (res.ok || res.status === 201) {
    return NextResponse.json({ ok: true })
  }

  const text = await res.text()
  console.error('newsletter mailerlite:', res.status, text)

  // Treat "already exists" style responses as success for UX
  if (res.status === 409 || res.status === 422) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Could not subscribe right now. Please try again later.' }, { status: 502 })
}
