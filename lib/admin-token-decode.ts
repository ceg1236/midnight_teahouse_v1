/**
 * Client-safe token payload decoder. No verification – for display/prefill only.
 * Verification happens server-side on checkout.
 */

export type AdminTokenPayload = {
  dateId?: string
  tierId?: string
  door?: boolean
  open?: boolean
  exp: number
}

export function decodeTokenPayload(token: string): AdminTokenPayload | null {
  try {
    const [payloadB64] = token.split('.')
    if (!payloadB64) return null
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = atob(padded)
    const payload = JSON.parse(json) as AdminTokenPayload
    return typeof payload.exp === 'number' ? payload : null
  } catch {
    return null
  }
}
