import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockConstructEvent = vi.fn()
const mockChargesRetrieve = vi.fn()
const mockSheetsGet = vi.fn()
const mockSheetsAppend = vi.fn()
const mockSheetsUpdate = vi.fn()
const mockSpreadsheetsGet = vi.fn()
const mockSpreadsheetsBatchUpdate = vi.fn()

vi.mock('stripe', () => ({
  default: class MockStripe {
    webhooks = {
      constructEvent: mockConstructEvent,
    }
    charges = {
      retrieve: mockChargesRetrieve,
    }
  },
}))

vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: class MockGoogleAuth {},
    },
    sheets: vi.fn().mockReturnValue({
      spreadsheets: {
        get: mockSpreadsheetsGet,
        values: {
          get: mockSheetsGet,
          append: mockSheetsAppend,
          update: mockSheetsUpdate,
        },
        batchUpdate: mockSpreadsheetsBatchUpdate,
      },
    }),
  },
}))

vi.mock('../../../../../lib/confirmation-email', () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue({ ok: true }),
}))

const { POST } = await import('../route')

function req(body: string | object, overrides?: { headers?: Record<string, string> }) {
  return new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'whsec_test',
      ...overrides?.headers,
    },
  })
}

const validSession = {
  id: 'cs_test_123',
  metadata: {
    dateId: 'mar-18',
    order: 'community:2',
    name: 'Test User',
    email: 'test@example.com',
    notes: '',
    device: 'desktop',
  },
  amount_total: 8000,
  payment_intent: 'pi_test_123',
}

const validEvent = {
  type: 'checkout.session.completed',
  data: { object: validSession },
}

describe('POST /api/webhooks/stripe', () => {
  const env = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...env,
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
      STRIPE_SECRET_KEY: 'sk_test_xxx',
      SPREADSHEET_ID: 'test-sheet-id',
      GOOGLE_CREDENTIALS_JSON: '{"type":"service_account"}',
    }
    mockSheetsGet.mockResolvedValue({ data: { values: [] } })
    mockChargesRetrieve.mockResolvedValue({
      id: 'ch_refunded_123',
      payment_intent: 'pi_test_123',
      refunds: { data: [{ reason: 'requested_by_customer' }] },
    })
    mockSheetsAppend.mockResolvedValue({
      data: { updatedRange: 'Sheet1!A2:L2', updatedRows: 1, updatedColumns: 12 },
    })
    mockSheetsUpdate.mockResolvedValue({})
    mockSpreadsheetsGet.mockResolvedValue({
      data: { sheets: [{ properties: { sheetId: 0, title: 'Sheet1' } }] },
    })
    mockSpreadsheetsBatchUpdate.mockResolvedValue({})
  })

  it('returns 500 when STRIPE_WEBHOOK_SECRET is not set', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET
    const res = await POST(req('{}'))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Webhook not configured')
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    const res = await POST(req('{}', { headers: { 'stripe-signature': '' } }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Missing stripe-signature')
  })

  it('returns 400 for invalid signature', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature')
    })
    const res = await POST(req('{}'))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid signature')
  })

  it('returns 200 received for non-checkout events', async () => {
    mockConstructEvent.mockReturnValue({ type: 'payment_intent.succeeded', data: {} })
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
    expect(mockSheetsGet).not.toHaveBeenCalled()
  })

  it('returns 400 for missing metadata', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_1', metadata: null } },
    })
    const res = await POST(req('{}'))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe('Invalid session metadata')
  })

  it('returns 500 when SPREADSHEET_ID is not set', async () => {
    delete process.env.SPREADSHEET_ID
    mockConstructEvent.mockReturnValue(validEvent)
    const res = await POST(req('{}'))
    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json.error).toBe('Sheets not configured')
  })

  it('returns 200 and writes to sheet for valid checkout.session.completed', async () => {
    mockConstructEvent.mockReturnValue(validEvent)
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
    expect(mockSheetsGet).toHaveBeenCalled()
    expect(mockSheetsAppend).toHaveBeenCalled()
    const appendCall = mockSheetsAppend.mock.calls[0]
    expect(appendCall[0].requestBody.values[0]).toContain('Test User')
    expect(appendCall[0].requestBody.values[0]).toContain('test@example.com')
    expect(appendCall[0].requestBody.values[0]).toContain('Community')
  })

  it('returns 200 and skips duplicate payment ID', async () => {
    mockConstructEvent.mockReturnValue(validEvent)
    mockSheetsGet.mockResolvedValue({ data: { values: [['pi_test_123']] } })
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
    expect(mockSheetsAppend).not.toHaveBeenCalled()
  })

  it('returns 200 and updates sheet for charge.refunded', async () => {
    const chargeRefundedEvent = {
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_refunded_123',
          payment_intent: 'pi_test_123',
        },
      },
    }
    mockConstructEvent.mockReturnValue(chargeRefundedEvent)
    // Full rows A2:L - row 0 has pi_test_123 in col J (index 9)
    mockSheetsGet.mockResolvedValue({
      data: {
        values: [
          ['2026-03-12', 'Kiel', 'k@x.com', 'Fri Mar 20', 'Community', '$80', '2', '', 'mobile', 'pi_test_123', '', ''],
        ],
      },
    })
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
    expect(mockSheetsUpdate).toHaveBeenCalled()
    expect(mockSpreadsheetsBatchUpdate).toHaveBeenCalled()
  })

  it('returns 200 when charge.refunded but payment not found in sheet', async () => {
    const chargeRefundedEvent = {
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_refunded_123',
          payment_intent: 'pi_unknown',
        },
      },
    }
    mockConstructEvent.mockReturnValue(chargeRefundedEvent)
    mockChargesRetrieve.mockResolvedValue({
      id: 'ch_refunded_123',
      payment_intent: 'pi_unknown',
      refunds: { data: [] },
    })
    mockSheetsGet.mockResolvedValue({
      data: {
        values: [
          ['2026-03-12', 'Kiel', 'k@x.com', 'Fri Mar 20', 'Community', '$80', '2', '', 'mobile', 'pi_test_123', '', ''],
        ],
      },
    })
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.received).toBe(true)
    expect(mockSheetsUpdate).not.toHaveBeenCalled()
  })
})
