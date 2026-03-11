/**
 * Signed tokens for admin links and door sales.
 * Payload: { dateId?, tierId?, door?, exp }
 * - Specific: dateId (+ optional tierId) – pre-selects date/tier
 * - Door: door: true – generic bypass, date inferred, tier defaults to Community
 */

import { createHmac, timingSafeEqual } from 'crypto'

export type AdminTokenPayload = {
  dateId?: string
  tierId?: string
  door?: boolean
  exp: number
}

const DEFAULT_TTL_SEC = 7 * 24 * 60 * 60 // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_LINK_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_LINK_SECRET must be set and at least 16 characters')
  }
  return secret
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64url')
}

function base64UrlDecode(str: string): Buffer {
  return Buffer.from(str, 'base64url')
}

export function signToken(payload: Omit<AdminTokenPayload, 'exp'>, ttlSec = DEFAULT_TTL_SEC): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSec
  const full: AdminTokenPayload = { ...payload, exp }
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(full)))
  const sig = createHmac('sha256', getSecret()).update(payloadB64).digest()
  return `${payloadB64}.${base64UrlEncode(sig)}`
}

export function verifyToken(token: string): AdminTokenPayload | null {
  try {
    const secret = process.env.ADMIN_LINK_SECRET
    if (!secret || secret.length < 16) return null
    const [payloadB64, sigB64] = token.split('.')
    if (!payloadB64 || !sigB64) return null

    const expectedSig = createHmac('sha256', secret!).update(payloadB64).digest()
    const actualSig = base64UrlDecode(sigB64)
    if (expectedSig.length !== actualSig.length || !timingSafeEqual(expectedSig, actualSig)) {
      return null
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as AdminTokenPayload
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}
