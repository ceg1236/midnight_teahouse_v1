import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('../../../../../lib/admin-token', () => ({
  signToken: vi.fn().mockReturnValue('mock-door-token'),
}))

import { POST } from '../route'
import { signToken } from '../../../../../lib/admin-token'

function req(body: object) {
  return new NextRequest('http://localhost/api/admin/generate-link', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/admin/generate-link', () => {
  const env = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = {
      ...env,
      ADMIN_PASSWORD: 'test-password',
      ADMIN_LINK_SECRET: 'a'.repeat(32),
      NEXT_PUBLIC_APP_URL: 'https://example.com',
    }
    vi.mocked(signToken).mockReturnValue('mock-door-token')
  })

  it('returns 401 for wrong password', async () => {
    const res = await POST(req({ password: 'wrong', door: true }))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Invalid password')
  })

  it('returns 401 for missing password', async () => {
    const res = await POST(req({ door: true }))
    expect(res.status).toBe(401)
  })

  it('generates door link with ticket param', async () => {
    const res = await POST(req({ password: 'test-password', door: true }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toContain('/invite?ticket=')
    expect(json.url).toContain('mock-door-token')
    expect(signToken).toHaveBeenCalledWith({ door: true })
  })

  it('generates open link when no date or door', async () => {
    const res = await POST(req({ password: 'test-password' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toContain('/invite?ticket=')
    expect(signToken).toHaveBeenCalledWith({ open: true })
  })

  it('generates specific link with dateId and optional tierId', async () => {
    const res = await POST(req({ password: 'test-password', dateId: 'mar-18', tierId: 'community' }))
    expect(res.status).toBe(200)
    expect(signToken).toHaveBeenCalledWith({ dateId: 'mar-18', tierId: 'community' })
  })
})
