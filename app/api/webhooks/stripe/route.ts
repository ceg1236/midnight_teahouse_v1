import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { google } from 'googleapis'
import { eventDates, eventTiers } from '../../../../content/event-invite.config'
import { sendConfirmationEmail } from '../../../../lib/confirmation-email'

const TIER_LABELS: Record<string, string> = Object.fromEntries(
  eventTiers.map((t) => [t.id, t.label])
)

function formatTicketType(orderStr: string): string {
  const parts: string[] = []
  for (const pair of orderStr.split(',')) {
    const [tierId] = pair.split(':')
    if (!tierId) continue
    const label = TIER_LABELS[tierId] ?? tierId
    parts.push(label)
  }
  return Array.from(new Set(parts)).join(', ') || ''
}

async function handleChargeRefunded(
  event: Stripe.Event,
  stripe: Stripe
): Promise<NextResponse> {
  const charge = event.data.object as Stripe.Charge

  // Retrieve charge with refunds to get correct payment_intent and refund reason
  const chargeWithRefunds = await stripe.charges.retrieve(charge.id, {
    expand: ['refunds'],
  })
  const paymentIntentId =
    typeof chargeWithRefunds.payment_intent === 'string'
      ? chargeWithRefunds.payment_intent
      : chargeWithRefunds.payment_intent?.id
  if (!paymentIntentId) {
    console.error('charge.refunded: no payment_intent on charge', charge.id)
    return NextResponse.json({ received: true })
  }

  const piTrimmed = paymentIntentId.trim()

  // Build refund notes: Reason + Notes (Dashboard "Add more details" field)
  const refunds = chargeWithRefunds.refunds?.data ?? []
  const latestRefund = refunds[refunds.length - 1]
  const refundReason = latestRefund?.reason
    ? `Reason: ${latestRefund.reason.replace(/_/g, ' ')}`
    : ''
  const meta = latestRefund?.metadata ?? {}
  const notesKeys = ['comment', 'notes', 'refund_notes', 'details', 'reason_note', 'refund_reason']
  let notesValue = notesKeys
    .map((k) => meta[k])
    .find((v): v is string => typeof v === 'string' && v.trim() !== '')
  if (!notesValue && Object.keys(meta).length > 0) {
    notesValue = Object.entries(meta)
      .filter(([, v]) => typeof v === 'string' && (v as string).trim() !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
  }
  const refundNotesLine = notesValue?.trim()
    ? `Notes: ${notesValue.trim()}`
    : ''
  const refundNotes = [refundReason, refundNotesLine].filter(Boolean).join('\n') || ''

  if (Object.keys(meta).length > 0) {
    console.log(
      JSON.stringify({
        event: 'refund_metadata_debug',
        chargeId: charge.id,
        metadataKeys: Object.keys(meta),
        metadata: meta,
      })
    )
  }

  const spreadsheetId = process.env.SPREADSHEET_ID
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const sheetName = process.env.SPREADSHEET_SHEET_NAME || 'Sheet1'
  if (!spreadsheetId || (!credentialsJson && !credentialsPath)) {
    console.error('Sheets not configured for refund handling')
    return NextResponse.json({ received: true })
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

  try {
    // Read full data A2:L so row indices match sheet (J2:J alone can omit empty rows)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:L`,
    })
    const rows = (res.data.values ?? []) as string[][]
    const rowIndex = rows.findIndex((row) => (row[9] ?? '').trim() === piTrimmed)
    if (rowIndex < 0) {
      console.log(
        JSON.stringify({
          event: 'refund_sheet_not_found',
          chargeId: charge.id,
          paymentIntentId: piTrimmed,
          message: 'Payment ID not found in sheet',
        })
      )
      return NextResponse.json({ received: true })
    }

    const dataRow = rowIndex + 2 // 1-based, header is row 1
    const refundDate = new Date().toISOString().split('T')[0]

    // Update Refunded (K) and Refund Notes (L)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!K${dataRow}:L${dataRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[refundDate, refundNotes]] },
    })

    // Get sheet ID for batchUpdate (formatting)
    const meta = await sheets.spreadsheets.get({ spreadsheetId })
    const sheet = meta.data.sheets?.find(
      (s) => (s.properties?.title ?? '').trim() === sheetName.trim()
    )
    const sheetId = sheet?.properties?.sheetId ?? 0

    // Apply light gray background to refunded row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId,
                startRowIndex: dataRow - 1,
                endRowIndex: dataRow,
                startColumnIndex: 0,
                endColumnIndex: 12,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 255 / 255,
                    green: 204 / 255,
                    blue: 204 / 255,
                  },
                },
              },
              fields: 'userEnteredFormat.backgroundColor',
            },
          },
        ],
      },
    })

    console.log(
      JSON.stringify({
        event: 'refund_sheet_updated',
        chargeId: charge.id,
        paymentIntentId: piTrimmed,
        row: dataRow,
      })
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(
      JSON.stringify({
        event: 'refund_sheet_update_failed',
        chargeId: charge.id,
        paymentIntentId: piTrimmed,
        error: msg,
      })
    )
    return NextResponse.json(
      { error: 'Failed to update sheet for refund' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

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

  if (event.type === 'charge.refunded') {
    return handleChargeRefunded(event, stripe)
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
  const ticketType =
    metadata.order && typeof metadata.order === 'string'
      ? formatTicketType(metadata.order)
      : ''
  const row = [
    new Date().toISOString(),
    String(metadata.name),
    String(metadata.email),
    String(ticketDate),
    String(ticketType),
    String(amountPaid),
    String(qty),
    String(metadata.notes ?? ''),
    String(metadata.device ?? 'desktop'),
    String(paymentId),
    '', // Refunded (K) - empty for new sales
    '', // Refund Notes (L) - empty for new sales
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

  // Idempotency: skip if we've already processed this payment (payment ID in column J)
  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!J2:J`,
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

  // Append to data rows (A2:L) - includes Refunded and Refund Notes
  const range = `${sheetName}!A2:L`
  try {
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    })
    const updatedRange = appendRes.data?.updates?.updatedRange
    if (updatedRange) {
      const rowMatch = updatedRange.match(/!A(\d+):/)
      const appendedRow = rowMatch ? parseInt(rowMatch[1], 10) : null
      if (appendedRow != null) {
        const meta = await sheets.spreadsheets.get({ spreadsheetId })
        const sheet = meta.data.sheets?.find(
          (s) => (s.properties?.title ?? '').trim() === sheetName.trim()
        )
        const sheetId = sheet?.properties?.sheetId ?? 0
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId,
                    startRowIndex: appendedRow - 1,
                    endRowIndex: appendedRow,
                    startColumnIndex: 0,
                    endColumnIndex: 12,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: {
                        red: 1,
                        green: 1,
                        blue: 1,
                      },
                    },
                  },
                  fields: 'userEnteredFormat.backgroundColor',
                },
              },
            ],
          },
        })
      }
    }
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
  if (emailResult.ok) {
    console.log(
      JSON.stringify({
        event: 'webhook_confirmation_email_sent',
        sessionId: session.id,
        paymentId,
        to: metadata.email,
      })
    )
  } else {
    console.error(
      JSON.stringify({
        event: 'webhook_confirmation_email_failed',
        sessionId: session.id,
        paymentId,
        to: metadata.email,
        error: emailResult.error,
      })
    )
  }

  return NextResponse.json({ received: true })
}
