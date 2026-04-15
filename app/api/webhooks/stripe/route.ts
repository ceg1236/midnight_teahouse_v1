import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { google } from 'googleapis'
import { sendConfirmationEmail } from '../../../../lib/confirmation-email'
import { applyRefundToSheet } from '../../../../lib/sheets-refund'
import { getEventConfig } from '../../../../lib/event-registry'
import { getSheetsConfig, getStripeSecretKey, getStripeWebhookSecret } from '../../../../lib/payment-env'

function formatTicketType(orderStr: string, tierLabels: Record<string, string>): string {
  const parts: string[] = []
  for (const pair of orderStr.split(',')) {
    const [tierId] = pair.split(':')
    if (!tierId) continue
    const label = tierLabels[tierId] ?? tierId
    parts.push(label)
  }
  return Array.from(new Set(parts)).join(', ') || ''
}

function normalizeTicketDateLabel(value: string): string {
  // Guard against accidental trailing punctuation in config labels.
  return value.replace(/\s*,+\s*$/, '').trim()
}

function getAppendedRowNumber(updatedRange?: string | null): number | null {
  if (!updatedRange) return null
  const rowMatch = updatedRange.match(/!A(\d+):/)
  return rowMatch ? parseInt(rowMatch[1], 10) : null
}

async function applyWhiteRowBackground(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetName: string,
  appendedRow: number,
  endColumnIndex: number
) {
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
              endColumnIndex,
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

async function appendGuestlistRow({
  sheets,
  spreadsheetId,
  guestlistSheetName,
  paymentId,
  row,
  sessionId,
}: {
  sheets: ReturnType<typeof google.sheets>
  spreadsheetId: string
  guestlistSheetName: string
  paymentId: string
  row: string[]
  sessionId: string
}) {
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${guestlistSheetName}!J2:J`,
  })
  const paymentIds = (existing.data.values ?? []).flat()
  if (paymentIds.includes(paymentId)) {
    console.log(
      JSON.stringify({
        event: 'webhook_guestlist_duplicate',
        sessionId,
        paymentId,
        message: 'Payment already in guestlist, skipped',
      })
    )
    return
  }

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${guestlistSheetName}!A2:O`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })

  const appendedRow = getAppendedRowNumber(appendRes.data?.updates?.updatedRange)
  if (appendedRow != null) {
    await applyWhiteRowBackground(sheets, spreadsheetId, guestlistSheetName, appendedRow, 15)
    const meta = await sheets.spreadsheets.get({ spreadsheetId })
    const sheet = meta.data.sheets?.find(
      (s) => (s.properties?.title ?? '').trim() === guestlistSheetName.trim()
    )
    const sheetId = sheet?.properties?.sheetId ?? 0
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            setDataValidation: {
              range: {
                sheetId,
                startRowIndex: appendedRow - 1,
                endRowIndex: appendedRow,
                startColumnIndex: 12, // M = Checked in
                endColumnIndex: 13,
              },
              rule: {
                condition: { type: 'BOOLEAN' },
                strict: true,
                showCustomUi: true,
              },
            },
          },
        ],
      },
    })
  }

  console.log(
    JSON.stringify({
      event: 'webhook_guestlist_success',
      sessionId,
      paymentId,
      guestlistSheetName,
    })
  )
}

async function updateGuestlistRefundStatus(paymentId: string, refundNotes: string): Promise<void> {
  const { spreadsheetId, credentialsJson, credentialsPath, guestlistSheetName } = getSheetsConfig()
  if (!spreadsheetId || !guestlistSheetName || (!credentialsJson && !credentialsPath)) return

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
  const piTrimmed = paymentId.trim()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${guestlistSheetName}!A2:O`,
  })
  const rows = (res.data.values ?? []) as string[][]
  const rowIndex = rows.findIndex((row) => (row[9] ?? '').trim() === piTrimmed)
  if (rowIndex < 0) {
    console.log(
      JSON.stringify({
        event: 'refund_guestlist_not_found',
        paymentIntentId: piTrimmed,
        guestlistSheetName,
      })
    )
    return
  }

  const dataRow = rowIndex + 2
  const refundDate = new Date().toISOString().split('T')[0]
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${guestlistSheetName}!K${dataRow}:L${dataRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[refundDate, refundNotes]] },
  })
  console.log(
    JSON.stringify({
      event: 'refund_guestlist_updated',
      paymentIntentId: piTrimmed,
      row: dataRow,
      guestlistSheetName,
    })
  )
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

  try {
    const result = await applyRefundToSheet(piTrimmed, refundNotes)
    if (!result.ok) {
      console.log(
        JSON.stringify({
          event: 'refund_sheet_not_found',
          chargeId: charge.id,
          paymentIntentId: piTrimmed,
          message: result.error,
        })
      )
      try {
        await updateGuestlistRefundStatus(piTrimmed, refundNotes)
      } catch (guestErr) {
        const guestMsg = guestErr instanceof Error ? guestErr.message : String(guestErr)
        console.error(
          JSON.stringify({
            event: 'refund_guestlist_update_failed',
            paymentIntentId: piTrimmed,
            error: guestMsg,
          })
        )
      }
      return NextResponse.json({ received: true })
    }
    console.log(
      JSON.stringify({
        event: 'refund_sheet_updated',
        chargeId: charge.id,
        paymentIntentId: piTrimmed,
        row: result.row,
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

  try {
    await updateGuestlistRefundStatus(piTrimmed, refundNotes)
  } catch (guestErr) {
    const guestMsg = guestErr instanceof Error ? guestErr.message : String(guestErr)
    console.error(
      JSON.stringify({
        event: 'refund_guestlist_update_failed',
        paymentIntentId: piTrimmed,
        error: guestMsg,
      })
    )
  }

  return NextResponse.json({ received: true })
}

export async function POST(req: NextRequest) {
  const webhookSecret = getStripeWebhookSecret()
  const secretKey = getStripeSecretKey()
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

  const eventConfig = getEventConfig(metadata?.eventSlug)
  const tierLabels: Record<string, string> = Object.fromEntries(
    eventConfig.tiers.map((t) => [t.id, t.label])
  )
  const date = eventConfig.dates.find((d) => d.id === metadata.dateId)
  const ticketDate = normalizeTicketDateLabel((date?.label ?? metadata.dateId).replace(/\n/g, ' '))

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
      ? formatTicketType(metadata.order, tierLabels)
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

  const { spreadsheetId, credentialsJson, credentialsPath, sheetName, guestlistSheetName } = getSheetsConfig()
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

  // Idempotency on payments sheet (payment ID in column J)
  let paymentAlreadyWritten = false
  try {
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!J2:J`,
    })
    const paymentIds = (existing.data.values ?? []).flat()
    if (paymentIds.includes(paymentId)) {
      paymentAlreadyWritten = true
      console.log(
        JSON.stringify({
          event: 'webhook_sheet_duplicate',
          sessionId: session.id,
          paymentId,
          message: 'Payment already in sheet, skipped',
        })
      )
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

  if (!paymentAlreadyWritten) {
    // Append to data rows (A2:L) - includes Refunded and Refund Notes
    try {
      const appendRes = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A2:L`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [row] },
      })
      const appendedRow = getAppendedRowNumber(appendRes.data?.updates?.updatedRange)
      if (appendedRow != null) {
        await applyWhiteRowBackground(sheets, spreadsheetId, sheetName, appendedRow, 12)
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
  }

  if (guestlistSheetName) {
    const guestlistRow = [
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
      '', // Refunded
      '', // Refund notes
      'FALSE', // Checked in (checkbox)
      '', // Checked-in at
      '', // Checked-in notes
    ]

    try {
      await appendGuestlistRow({
        sheets,
        spreadsheetId,
        guestlistSheetName,
        paymentId,
        row: guestlistRow,
        sessionId: session.id,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const details = err && typeof err === 'object' && 'response' in err
        ? JSON.stringify((err as { response?: unknown }).response)
        : ''
      console.error(
        JSON.stringify({
          event: 'webhook_guestlist_write_failed',
          sessionId: session.id,
          paymentId,
          name: metadata.name,
          email: metadata.email,
          error: msg,
          details,
        })
      )
      return NextResponse.json(
        { error: 'Failed to write to guestlist sheet' },
        { status: 500 }
      )
    }
  }

  if (!paymentAlreadyWritten) {
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
  } else {
    console.log(
      JSON.stringify({
        event: 'webhook_confirmation_email_skipped_duplicate',
        sessionId: session.id,
        paymentId,
      })
    )
  }

  return NextResponse.json({ received: true })
}
