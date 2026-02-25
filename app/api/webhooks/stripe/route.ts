import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { google } from 'googleapis'
import { eventDates, eventTiers } from '../../../../content/event-invite.config'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!webhookSecret || !secretKey) {
    console.error('STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY is not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const stripe = new Stripe(secretKey)
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata
  if (!metadata?.dateId || !metadata?.tierId || !metadata?.name || !metadata?.email) {
    console.error('Missing metadata in checkout session:', session.id)
    return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
  }

  const date = eventDates.find((d) => d.id === metadata.dateId)
  const tier = eventTiers.find((t) => t.id === metadata.tierId)
  const ticketTier = date && tier ? `${date.label} · ${tier.label}` : metadata.tierId
  const paymentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? session.id

  const row = [
    new Date().toISOString(),
    String(metadata.name),
    String(metadata.email),
    String(ticketTier),
    String(metadata.notes ?? ''),
    String(metadata.device ?? 'desktop'),
    String(paymentId),
  ]

  const spreadsheetId = process.env.SPREADSHEET_ID
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const sheetName = process.env.SPREADSHEET_SHEET_NAME || 'Sheet1'
  if (!spreadsheetId || !credentialsPath) {
    console.error('SPREADSHEET_ID or GOOGLE_APPLICATION_CREDENTIALS not set')
    return NextResponse.json(
      { error: 'Sheets not configured' },
      { status: 500 }
    )
  }

  const range = `${sheetName}!A:G`
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const details = err && typeof err === 'object' && 'response' in err
      ? JSON.stringify((err as { response?: unknown }).response)
      : ''
    console.error('Failed to append to Google Sheet:', msg, details)
    return NextResponse.json(
      { error: 'Failed to write to sheet' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
