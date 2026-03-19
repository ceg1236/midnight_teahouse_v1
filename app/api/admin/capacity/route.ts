/**
 * GET /api/admin/capacity - Read capacity per date (from Config sheet or defaults)
 * POST /api/admin/capacity - Save capacity to Config sheet
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getCapacityFromSheet,
  getDefaultCapacity,
  writeCapacityToSheet,
} from '../../../../lib/sheets-capacity'
import { eventDates } from '../../../../content/event-invite.config'

export async function GET() {
  try {
    const fromSheet = await getCapacityFromSheet()
    const capacities = fromSheet ?? getDefaultCapacity()

    const dates = eventDates.map((d) => ({
      dateId: d.id,
      label: d.label,
      capacity: capacities[d.id] ?? 45,
    }))

    return NextResponse.json({ dates, fromSheet: !!fromSheet })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[api/admin/capacity] GET failed:', msg, err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: { password?: string; capacities?: Record<string, number> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const expected = process.env.ADMIN_PASSWORD
  if (!expected || body.password !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const capacities = body.capacities
  if (!capacities || typeof capacities !== 'object') {
    return NextResponse.json(
      { error: 'capacities required: { dateId: number, ... }' },
      { status: 400 }
    )
  }

  const result = await writeCapacityToSheet(capacities)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
