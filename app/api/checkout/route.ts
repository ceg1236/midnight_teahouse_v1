import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyToken } from '../../../lib/admin-token'
import { checkRateLimit } from '../../../lib/rate-limit'
import { getAvailabilityForDates } from '../../../lib/sheets-availability'
import { getEventConfig } from '../../../lib/event-registry'
import { getStripeSecretKey } from '../../../lib/payment-env'
import type { EventTier } from '../../../content/event-schema'
import { clampSupportedPrice } from '../../../lib/supported-tier-price'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MAX_LEN = 200
const NOTES_MAX_LEN = 1000

function getRequestBaseUrl(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL

  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || req.headers.get('host')?.split(',')[0]?.trim()
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  if (host) {
    const proto = forwardedProto || req.nextUrl.protocol.replace(':', '') || 'https'
    return `${proto}://${host}`
  }

  if (req.nextUrl?.origin) return req.nextUrl.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function POST(req: NextRequest) {
  const stripeSecretKey = getStripeSecretKey()
  if (!stripeSecretKey) {
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
    eventSlug?: string
    dateId?: string
    items?: Array<{ tierId: string; quantity: number; supportedPrice?: number }>
    supportedPrice?: number
    name?: string
    email?: string
    notes?: string
    device?: string
    ticket?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    eventSlug,
    dateId,
    items = [],
    supportedPrice,
    name,
    email,
    notes = '',
    device = 'desktop',
    ticket,
  } = body
  const event = getEventConfig(eventSlug)

  // Bypass capacity if valid admin/door token
  const tokenPayload = ticket ? verifyToken(ticket) : null
  const bypassCapacity = !!tokenPayload

  // Validate device (mobile | tablet | desktop)
  const validDevices = ['mobile', 'tablet', 'desktop', 'door'] as const
  const deviceType = tokenPayload?.door
    ? 'door'
    : validDevices.includes(device as (typeof validDevices)[number])
      ? (device as (typeof validDevices)[number])
      : 'desktop'

  // Validate date
  const date = event.dates.find((d) => d.id === dateId)
  if (!date) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  // Validate items
  const lineItems: Array<{ tier: EventTier; quantity: number; unitAmount: number }> = []
  for (const item of items) {
    const tier = event.tiers.find((t) => t.id === item.tierId)
    if (!tier || !item.quantity || item.quantity < 1 || item.quantity > 4) continue
    const unitAmount =
      item.tierId === 'supported' && typeof (item.supportedPrice ?? supportedPrice) === 'number'
        ? clampSupportedPrice(event.tiers, item.supportedPrice ?? supportedPrice)
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

  // Capacity check (skip if valid admin/door token)
  if (!bypassCapacity) {
    const availability = await getAvailabilityForDates(event.dates)
    if (availability) {
      const dateAvail = availability.find((a) => a.dateId === dateId)
      if (dateAvail?.soldOut) {
        return NextResponse.json(
          { error: 'This date is sold out. Please choose another evening.' },
          { status: 409 }
        )
      }
      if (dateAvail && dateAvail.sold + totalQty > dateAvail.capacity) {
        return NextResponse.json(
          { error: `Only ${Math.max(0, dateAvail.capacity - dateAvail.sold)} ticket(s) left for this date.` },
          { status: 409 }
        )
      }
    }
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

  const baseUrl = getRequestBaseUrl(req)
  const successUrl =
    `${baseUrl}${event.successPath}?session_id={CHECKOUT_SESSION_ID}` +
    `&date_id=${encodeURIComponent(date.id)}` +
    `&name=${encodeURIComponent(trimmedName)}`
  const cancelUrl = `${baseUrl}${event.invitePath}`

  const orderStr = lineItems.map((li) => `${li.tier.id}:${li.quantity}`).join(',')
  const supportedInOrder = lineItems.find((li) => li.tier.id === 'supported')
  const stripe = new Stripe(stripeSecretKey)
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems.map((li) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${date.label} · ${li.tier.label}`,
            description: `${event.stripeDescriptionLabel} - ${li.tier.label} tier`,
          },
          unit_amount: li.unitAmount * 100, // cents
        },
        quantity: li.quantity,
      })),
      metadata: {
        eventSlug: event.slug,
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
          eventSlug: event.slug,
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
