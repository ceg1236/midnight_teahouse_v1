/**
 * Simple in-memory rate limiter. Best-effort on serverless (per-instance).
 * For stricter limits, consider Upstash Redis.
 */
const store = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export function checkRateLimit(req: Request): { ok: boolean; retryAfter?: number } {
  const ip = getClientIp(req)
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true }
  }

  if (now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true }
  }

  entry.count++
  if (entry.count > MAX_REQUESTS) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { ok: true }
}
