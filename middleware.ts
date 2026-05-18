import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { isTurbyEventPublic } from './lib/turby-event-public'

/**
 * Legacy query params on `/` redirect to /invite so the marketing homepage can be statically cached (ISR).
 * `/turby` is hidden in production until ENABLE_TURBY_EVENT=true.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/turby' || pathname.startsWith('/turby/')) {
    if (!isTurbyEventPublic()) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

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
  matcher: ['/', '/turby', '/turby/:path*'],
}
