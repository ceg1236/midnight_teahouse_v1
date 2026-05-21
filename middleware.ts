import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Legacy query params on `/` redirect to /invite so the marketing homepage can be statically cached (ISR).
 */
export function middleware(request: NextRequest) {
  const ticket = request.nextUrl.searchParams.get('ticket')
  const mock = request.nextUrl.searchParams.get('mock')
  const qs = new URLSearchParams()
  if (ticket) qs.set('ticket', ticket)
  if (process.env.NODE_ENV === 'development' && mock) qs.set('mock', mock)

  if (qs.toString()) {
    const url = request.nextUrl.clone()
    url.pathname = '/invite'
    url.search = qs.toString()
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
