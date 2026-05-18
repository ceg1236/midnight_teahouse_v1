/** Turby reservation pages are dev-only until ENABLE_TURBY_EVENT=true in production. */
export function isTurbyEventPublic(): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  return process.env.ENABLE_TURBY_EVENT === 'true'
}
