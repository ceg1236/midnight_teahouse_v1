import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { google } from 'googleapis'
import { eventDates } from '../../../../content/event-invite.config'
import { sendConfirmationEmail } from '../../../../lib/confirmation-email'

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
  if (!metadata?.dateId || !metadata?.name || !metadata?.email) {
    console.error('Missing metadata in checkout session:', session.id)
    return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 })
  }

  const date = eventDates.find((d) => d.id === metadata.dateId)
  const ticketDate = (date?.label ?? metadata.dateId).replace(/\n/g, ' ')

  const amountPaid =
    session.amount_total != null ? `$${Math.round(session.amount_total / 100)}` : ''

  let totalQty: number
  if (metadata.order && typeof metadata.order === 'string') {
    totalQty = 0
    for (const pair of metadata.order.split(',')) {
      const [, qStr] = pair.split(':')
      const q = parseInt(qStr ?? '1', 10)
      if (!isNaN(q) && q >= 1) totalQty += q
    }
    if (totalQty === 0) totalQty = 1
  } else {
    totalQty = metadata.quantity ? parseInt(String(metadata.quantity), 10) || 1 : 1
  }

  const paymentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? session.id

  const qty = String(totalQty)
  const row = [
    new Date().toISOString(),
    String(metadata.name),
    String(metadata.email),
    String(ticketDate),
    String(amountPaid),
    String(qty),
    String(metadata.notes ?? ''),
    String(metadata.device ?? 'desktop'),
    String(paymentId),
  ]

  const spreadsheetId = process.env.SPREADSHEET_ID
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const sheetName = process.env.SPREADSHEET_SHEET_NAME || 'Sheet1'
  if (!spreadsheetId) {
    console.error('SPREADSHEET_ID not set')
    return NextResponse.json(
      { error: 'Sheets not configured' },
      { status: 500 }
    )
  }

  // Support both: GOOGLE_CREDENTIALS_JSON (Vercel) and GOOGLE_APPLICATION_CREDENTIALS (local file)
  if (!credentialsJson && !credentialsPath) {
    console.error('Neither GOOGLE_CREDENTIALS_JSON nor GOOGLE_APPLICATION_CREDENTIALS set')
    return NextResponse.json(
      { error: 'Sheets credentials not configured' },
      { status: 500 }
    )
  }
  const auth = new google.auth.GoogleAuth(
    credentialsJson
      ? {
          credentials: JSON.parse(credentialsJson) as object,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        }
      : {
          keyFile: credentialsPath,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        }
  )
  const sheets = google.sheets({ version: 'v4', auth })

  // Idempotency: skip if we've already processed this payment (payment ID in column I)
  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!I2:I`,
    })
    const paymentIds = (existing.data.values ?? []).flat()
    if (paymentIds.includes(paymentId)) {
      console.log(
        JSON.stringify({
          event: 'webhook_sheet_duplicate',
          sessionId: session.id,
          paymentId,
          message: 'Payment already in sheet, skipped',
        })
      )
      return NextResponse.json({ received: true })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(
      JSON.stringify({
        event: 'webhook_sheet_check_failed',
        sessionId: session.id,
        paymentId,
        error: msg,
      })
    )
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }

  // Append to data rows (A2:I) - Timestamp|Name|Email|Ticket date|Amount paid|Quantity|Notes|Device|Payment ID
  const range = `${sheetName}!A2:I`
  try {
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
    console.error(
      JSON.stringify({
        event: 'webhook_sheet_write_failed',
        sessionId: session.id,
        paymentId,
        name: metadata.name,
        email: metadata.email,
        error: msg,
        details,
      })
    )
    return NextResponse.json(
      { error: 'Failed to write to sheet' },
      { status: 500 }
    )
  }

  console.log(
    JSON.stringify({
      event: 'webhook_sheet_success',
      sessionId: session.id,
      paymentId,
      name: metadata.name,
      email: metadata.email,
      ticketDate,
      amountPaid,
      quantity: qty,
    })
  )

  // Send confirmation email (non-blocking; don't fail webhook if email fails)
  const emailResult = await sendConfirmationEmail(metadata as Record<string, string | undefined>, amountPaid, qty)
  if (!emailResult.ok) {
    console.error(
      JSON.stringify({
        event: 'webhook_confirmation_email_failed',
        sessionId: session.id,
        paymentId,
        error: emailResult.error,
      })
    )
  }

  return NextResponse.json({ received: true })
}
