import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD not configured' },
      { status: 500 }
    )
  }

  if (body.password === expected) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ ok: false }, { status: 401 })
}
