import { NextResponse } from 'next/server'

const MAILERLITE_URL = 'https://connect.mailerlite.com/api/subscribers'

function trimEmail(v: unknown): string {
  if (typeof v !== 'string') return ''
  return v.trim().toLowerCase().slice(0, 320)
}

/**
 * Create/upsert subscriber via MailerLite (see https://developers.mailerlite.com/docs/subscribers.html#create-upsert-subscriber).
 * `groups` is optional in the API; we only send it when MAILERLITE_GROUP_ID is set.
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
  if (!apiKey) {
    console.error('newsletter: MAILERLITE_API_KEY not set')
    return NextResponse.json({ error: 'Newsletter signup is not configured yet.' }, { status: 503 })
  }

  const groupId = process.env.MAILERLITE_GROUP_ID?.trim()
  const payload: { email: string; groups?: string[] } = { email }
  if (groupId) {
    payload.groups = [groupId]
  }

  const res = await fetch(MAILERLITE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  // 200 = updated existing subscriber; 201 = created (per MailerLite docs)
  if (res.ok || res.status === 201) {
    return NextResponse.json({ ok: true })
  }

  const text = await res.text()
  console.error('newsletter mailerlite:', res.status, text)

  return NextResponse.json({ error: 'Could not subscribe right now. Please try again later.' }, { status: 502 })
}
