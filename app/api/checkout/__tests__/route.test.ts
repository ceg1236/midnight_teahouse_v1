import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('stripe', () => {
  const mockCreate = vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test' })
  return {
    default: class MockStripe {
      checkout = { sessions: { create: mockCreate } }
    },
  }
})

vi.mock('../../../../lib/sheets-availability', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../lib/sheets-availability')>()
  return {
    ...actual,
    getAvailabilityForDates: vi.fn(),
  }
})

vi.mock('../../../../lib/admin-token', () => ({
  verifyToken: vi.fn(),
}))

import { POST } from '../route'
import { verifyToken } from '../../../../lib/admin-token'
import { getAvailabilityForDates } from '../../../../lib/sheets-availability'

const validBody = {
  dateId: 'mar-18',
  items: [{ tierId: 'community', quantity: 1 }],
  name: 'Test User',
  email: 'test@example.com',
}

let requestCount = 0
function req(body: object, overrides?: { headers?: Record<string, string> }) {
  requestCount++
  return new NextRequest('http://localhost/api/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': `127.0.0.${requestCount}`,
      ...overrides?.headers,
    },
  })
}

describe('POST /api/checkout', () => {
  const env = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...env, STRIPE_SECRET_KEY: 'sk_test_xxx' }
    vi.mocked(verifyToken).mockReturnValue(null)
    vi.mocked(getAvailabilityForDates).mockResolvedValue([
      { dateId: 'mar-18', label: 'Wednesday, March 18', sold: 0, capacity: 45, soldOut: false },
      { dateId: 'mar-19', label: 'Thursday, March 19', sold: 0, capacity: 45, soldOut: false },
      { dateId: 'mar-20', label: 'Friday, March 20', sold: 0, capacity: 45, soldOut: false },
    ])
  })

  it('returns 500 when STRIPE_SECRET_KEY is not set', async () => {
    delete process.env.STRIPE_SECRET_KEY
    const res = await POST(req(validBody))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Stripe is not configured')
  })

  it('returns 400 for invalid dateId', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_xxx'
    const res = await POST(req({ ...validBody, dateId: 'invalid' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid date')
  })

  it('returns 400 for missing name', async () => {
    const res = await POST(req({ ...validBody, name: '' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Name is required')
  })

  it('returns 400 for missing email', async () => {
    const res = await POST(req({ ...validBody, email: '' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Email is required')
  })

  it('returns 400 for invalid email format', async () => {
    const res = await POST(req({ ...validBody, email: 'not-an-email' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid email format')
  })

  it('returns 400 for empty items', async () => {
    const res = await POST(req({ ...validBody, items: [] }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Select at least one ticket')
  })

  it('returns 400 for invalid tier', async () => {
    const res = await POST(req({ ...validBody, items: [{ tierId: 'invalid', quantity: 1 }] }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Select at least one ticket')
  })

  it('returns 400 when total quantity exceeds 4', async () => {
    const res = await POST(
      req({
        ...validBody,
        items: [
          { tierId: 'community', quantity: 2 },
          { tierId: 'patron', quantity: 3 },
        ],
      })
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Maximum 4 tickets per order')
  })

  it('returns 400 for invalid JSON body', async () => {
    const badReq = new NextRequest('http://localhost/api/checkout', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(badReq)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid JSON body')
  })

  it('returns 200 with Stripe URL for valid request', async () => {
    const res = await POST(req(validBody))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBeDefined()
    expect(json.url).toContain('checkout.stripe.com')
    expect(res.ok).toBe(true)
  })

  it('returns 409 when date is sold out', async () => {
    vi.mocked(getAvailabilityForDates).mockResolvedValue([
      { dateId: 'mar-18', label: 'Wednesday, March 18', sold: 45, capacity: 45, soldOut: true },
      { dateId: 'mar-19', label: 'Thursday, March 19', sold: 0, capacity: 45, soldOut: false },
      { dateId: 'mar-20', label: 'Friday, March 20', sold: 0, capacity: 45, soldOut: false },
    ])
    const res = await POST(req(validBody))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('sold out')
  })

  it('returns 409 when order would exceed capacity', async () => {
    vi.mocked(getAvailabilityForDates).mockResolvedValue([
      { dateId: 'mar-18', label: 'Wednesday, March 18', sold: 43, capacity: 45, soldOut: false },
      { dateId: 'mar-19', label: 'Thursday, March 19', sold: 0, capacity: 45, soldOut: false },
      { dateId: 'mar-20', label: 'Friday, March 20', sold: 0, capacity: 45, soldOut: false },
    ])
    const res = await POST(req({ ...validBody, items: [{ tierId: 'community', quantity: 4 }] }))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toMatch(/only.*ticket.*left/i)
  })

  it('bypasses capacity when valid ticket provided', async () => {
    vi.mocked(getAvailabilityForDates).mockResolvedValue([
      { dateId: 'mar-18', label: 'Wednesday, March 18', sold: 45, capacity: 45, soldOut: true },
      { dateId: 'mar-19', label: 'Thursday, March 19', sold: 0, capacity: 45, soldOut: false },
      { dateId: 'mar-20', label: 'Friday, March 20', sold: 0, capacity: 45, soldOut: false },
    ])
    vi.mocked(verifyToken).mockReturnValue({ dateId: 'mar-18', exp: Math.floor(Date.now() / 1000) + 3600 })
    const res = await POST(req({ ...validBody, ticket: 'valid-token' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBeDefined()
  })

  it('returns 409 when guided tasting pool is sold out', async () => {
    vi.mocked(getAvailabilityForDates).mockResolvedValue([
      {
        dateId: 'turby-may-30',
        label: 'Saturday, May 30',
        sold: 10,
        capacity: 45,
        soldOut: false,
        ticketPools: [{ ticketType: 'tasting', sold: 6, capacity: 6, soldOut: true, remaining: 0 }],
      },
    ])
    const res = await POST(
      req({
        eventSlug: 'turby-event',
        dateId: 'turby-may-30',
        ticketFormat: 'guided-tasting',
        items: [{ tierId: 'tasting', quantity: 1 }],
        name: 'Test User',
        email: 'test@example.com',
      })
    )
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toMatch(/sold out/i)
  })

  it('returns 409 when guided tasting order exceeds pool capacity', async () => {
    vi.mocked(getAvailabilityForDates).mockResolvedValue([
      {
        dateId: 'turby-may-30',
        label: 'Saturday, May 30',
        sold: 10,
        capacity: 45,
        soldOut: false,
        ticketPools: [{ ticketType: 'tasting', sold: 5, capacity: 6, soldOut: false, remaining: 1 }],
      },
    ])
    const res = await POST(
      req({
        eventSlug: 'turby-event',
        dateId: 'turby-may-30',
        ticketFormat: 'guided-tasting',
        items: [{ tierId: 'tasting', quantity: 2 }],
        name: 'Test User',
        email: 'test@example.com',
      })
    )
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toMatch(/only 1/i)
  })

  it('allows guided tasting when standard pool is full but tasting pool has seats', async () => {
    vi.mocked(getAvailabilityForDates).mockResolvedValue([
      {
        dateId: 'turby-may-30',
        label: 'Saturday, May 30',
        sold: 5,
        capacity: 5,
        soldOut: true,
        ticketPools: [
          { ticketType: 'standard', sold: 5, capacity: 5, soldOut: true, remaining: 0 },
          { ticketType: 'tasting', sold: 1, capacity: 6, soldOut: false, remaining: 5 },
        ],
      },
    ])
    const res = await POST(
      req({
        eventSlug: 'turby-event',
        dateId: 'turby-may-30',
        ticketFormat: 'guided-tasting',
        items: [{ tierId: 'tasting', quantity: 1 }],
        name: 'Test User',
        email: 'test@example.com',
      })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBeDefined()
  })
})
