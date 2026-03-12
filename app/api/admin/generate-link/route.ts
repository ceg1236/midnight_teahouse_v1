import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '../../../../lib/admin-token'
import { eventDates, eventTiers } from '../../../../content/event-invite.config'

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function POST(req: NextRequest) {
  let body: { password?: string; dateId?: string; tierId?: string; door?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { password, dateId, tierId, door } = body
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || !password || password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  if (!process.env.ADMIN_LINK_SECRET) {
    return NextResponse.json(
      { error: 'ADMIN_LINK_SECRET not configured' },
      { status: 500 }
    )
  }

  try {
    let token: string
    if (door) {
      token = signToken({ door: true })
    } else if (dateId && eventDates.some((d) => d.id === dateId)) {
      const tierIdValid = !tierId || eventTiers.some((t) => t.id === tierId)
      token = signToken({
        dateId,
        ...(tierIdValid && tierId ? { tierId } : {}),
      })
    } else {
      token = signToken({ open: true })
    }

    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/invite?ticket=${encodeURIComponent(token)}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Admin generate-link error:', err)
    return NextResponse.json(
      { error: 'Failed to generate link' },
      { status: 500 }
    )
  }
}
