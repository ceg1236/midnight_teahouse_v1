/**
 * Dev-only: Simulate refund sheet update without a real Stripe refund.
 * Use to test refund flow (row color, refund notes) without full checkout + refund cycle.
 *
 * POST /api/admin/test-refund
 * Body: { password, paymentId, refundReason?, refundNotes? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { applyRefundToSheet } from '../../../../lib/sheets-refund'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  let body: { password?: string; paymentId?: string; refundReason?: string; refundNotes?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const expected = process.env.ADMIN_PASSWORD
  if (!expected || body.password !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const paymentId = body.paymentId?.trim()
  if (!paymentId) {
    return NextResponse.json(
      { error: 'paymentId required (e.g. pi_xxx from column J)' },
      { status: 400 }
    )
  }

  const reason = body.refundReason?.trim() || 'requested by customer'
  const notes = body.refundNotes?.trim()
  const refundNotes = [
    `Reason: ${reason.replace(/_/g, ' ')}`,
    notes ? `Notes: ${notes}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const result = await applyRefundToSheet(paymentId, refundNotes)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    message: `Refund applied to row ${result.row}`,
    row: result.row,
  })
}
