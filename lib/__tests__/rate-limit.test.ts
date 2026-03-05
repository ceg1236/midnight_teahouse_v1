import { describe, it, expect } from 'vitest'
import { checkRateLimit } from '../rate-limit'

function req(ip: string): Request {
  return new Request('http://localhost', {
    headers: { 'x-forwarded-for': ip },
  })
}

describe('checkRateLimit', () => {
  it('allows requests under the limit', () => {
    const ip = '192.168.1.100'
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(req(ip))
      expect(result.ok).toBe(true)
    }
  })

  it('blocks after 5 requests per IP per minute', () => {
    const ip = '192.168.1.200'
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req(ip)).ok).toBe(true)
    }
    const result = checkRateLimit(req(ip))
    expect(result.ok).toBe(false)
    expect(result.retryAfter).toBeDefined()
    expect(typeof result.retryAfter).toBe('number')
  })

  it('uses x-forwarded-for when present', () => {
    const ip1 = '10.0.0.1'
    const ip2 = '10.0.0.2'
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(req(ip1)).ok).toBe(true)
    }
    expect(checkRateLimit(req(ip1)).ok).toBe(false)
    expect(checkRateLimit(req(ip2)).ok).toBe(true)
  })
})
