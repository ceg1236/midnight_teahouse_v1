import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { eventDates, eventTiers } from '../../../content/event-invite.config'
import { checkRateLimit } from '../../../lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MAX_LEN = 200
const NOTES_MAX_LEN = 1000

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  const { ok, retryAfter } = checkRateLimit(req)
  if (!ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter ?? 60) } }
    )
  }

  let body: {
    dateId?: string
    items?: Array<{ tierId: string; quantity: number; supportedPrice?: number }>
    supportedPrice?: number
    name?: string
    email?: string
    notes?: string
    device?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { dateId, items = [], supportedPrice, name, email, notes = '', device = 'desktop' } = body

  // Validate device (mobile | tablet | desktop)
  const validDevices = ['mobile', 'tablet', 'desktop'] as const
  const deviceType = validDevices.includes(device as (typeof validDevices)[number])
    ? (device as (typeof validDevices)[number])
    : 'desktop'

  // Validate date
  const date = eventDates.find((d) => d.id === dateId)
  if (!date) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  // Validate items
  const lineItems: Array<{ tier: (typeof eventTiers)[number]; quantity: number; unitAmount: number }> = []
  for (const item of items) {
    const tier = eventTiers.find((t) => t.id === item.tierId)
    if (!tier || !item.quantity || item.quantity < 1 || item.quantity > 4) continue
    const unitAmount =
      item.tierId === 'supported' && typeof (item.supportedPrice ?? supportedPrice) === 'number'
        ? Math.min(39, Math.max(20, Math.round(item.supportedPrice ?? supportedPrice ?? 20)))
        : tier.price
    lineItems.push({ tier, quantity: Math.min(4, Math.max(1, Math.round(item.quantity))), unitAmount })
  }
  if (lineItems.length === 0) {
    return NextResponse.json({ error: 'Select at least one ticket' }, { status: 400 })
  }
  const totalQty = lineItems.reduce((s, li) => s + li.quantity, 0)
  if (totalQty > 4) {
    return NextResponse.json({ error: 'Maximum 4 tickets per order' }, { status: 400 })
  }

  // Validate name
  const trimmedName = typeof name === 'string' ? name.trim() : ''
  if (!trimmedName) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (trimmedName.length > NAME_MAX_LEN) {
    return NextResponse.json({ error: 'Name is too long' }, { status: 400 })
  }

  // Validate email
  const trimmedEmail = typeof email === 'string' ? email.trim() : ''
  if (!trimmedEmail) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  if (notes.length > NOTES_MAX_LEN) {
    return NextResponse.json({ error: 'Notes are too long' }, { status: 400 })
  }

  const baseUrl = getBaseUrl()
  const successUrl =
    `${baseUrl}/invite/success?session_id={CHECKOUT_SESSION_ID}` +
    `&date_id=${encodeURIComponent(date.id)}` +
    `&name=${encodeURIComponent(trimmedName)}`
  const cancelUrl = `${baseUrl}`

  const orderStr = lineItems.map((li) => `${li.tier.id}:${li.quantity}`).join(',')
  const supportedInOrder = lineItems.find((li) => li.tier.id === 'supported')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems.map((li) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${date.label} · ${li.tier.label}`,
            description: `Spring Fling at the Teahouse – ${li.tier.label} tier`,
          },
          unit_amount: li.unitAmount * 100, // cents
        },
        quantity: li.quantity,
      })),
      metadata: {
        dateId: date.id,
        order: orderStr,
        name: trimmedName,
        email: trimmedEmail,
        notes: notes.slice(0, 500), // Stripe metadata values max 500 chars
        device: deviceType,
        ...(supportedInOrder && { supportedPrice: String(supportedInOrder.unitAmount) }),
      },
      payment_intent_data: {
        metadata: {
          dateId: date.id,
          name: trimmedName,
          email: trimmedEmail,
          device: deviceType,
        },
      },
      customer_email: trimmedEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
