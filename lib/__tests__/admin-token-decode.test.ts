import { describe, it, expect } from 'vitest'
import { decodeTokenPayload } from '../admin-token-decode'

/**
 * Creates a valid JWT-like payload (base64 only, no signature verification).
 * decodeTokenPayload only parses the payload; it does not verify the signature.
 */
function makePayloadB64(obj: object): string {
  const json = JSON.stringify(obj)
  return Buffer.from(json, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function makeToken(payload: object): string {
  return `${makePayloadB64(payload)}.fake-signature`
}

describe('decodeTokenPayload', () => {
  it('decodes door payload', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const payload = decodeTokenPayload(makeToken({ door: true, exp }))
    expect(payload).toEqual({ door: true, exp })
  })

  it('decodes open payload', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const payload = decodeTokenPayload(makeToken({ open: true, exp }))
    expect(payload).toEqual({ open: true, exp })
  })

  it('decodes dateId + tierId payload', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const payload = decodeTokenPayload(makeToken({ dateId: 'mar-18', tierId: 'community', exp }))
    expect(payload).toEqual({ dateId: 'mar-18', tierId: 'community', exp })
  })

  it('decodes dateId-only payload', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    const payload = decodeTokenPayload(makeToken({ dateId: 'mar-19', exp }))
    expect(payload).toEqual({ dateId: 'mar-19', exp })
  })

  it('returns null for invalid token', () => {
    expect(decodeTokenPayload('')).toBe(null)
    expect(decodeTokenPayload('not-a-valid-token')).toBe(null)
    expect(decodeTokenPayload('!!!.!!!')).toBe(null)
  })

  it('returns null when payload has no exp', () => {
    const token = makeToken({ door: true })
    expect(decodeTokenPayload(token)).toBe(null)
  })
})
