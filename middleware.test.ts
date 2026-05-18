import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'
import { isTurbyEventPublic } from './lib/turby-event-public'

describe('middleware', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('passes through when there are no legacy query params', () => {
    const req = new NextRequest(new URL('http://localhost/'))
    const res = middleware(req)
    expect(res.headers.get('location')).toBeNull()
  })

  it('redirects /?ticket=… to /invite with ticket preserved', () => {
    const req = new NextRequest(new URL('http://localhost/?ticket=abc'))
    const res = middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/invite?ticket=abc')
  })

  it('does not forward mock= unless NODE_ENV is development', () => {
    const req = new NextRequest(new URL('http://localhost/?mock=soldOut:mar-18'))
    const res = middleware(req)
    expect(res.headers.get('location')).toBeNull()
  })

  it('redirects with ticket and mock when NODE_ENV is development', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const req = new NextRequest(new URL('http://localhost/?ticket=x&mock=soldOut:mar-18'))
    const res = middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost/invite?ticket=x&mock=soldOut%3Amar-18',
    )
  })

  it('redirects /turby to home in production when ENABLE_TURBY_EVENT is unset', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ENABLE_TURBY_EVENT', '')
    const req = new NextRequest(new URL('http://localhost/turby'))
    const res = middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('allows /turby in production when ENABLE_TURBY_EVENT=true', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ENABLE_TURBY_EVENT', 'true')
    const req = new NextRequest(new URL('http://localhost/turby'))
    const res = middleware(req)
    expect(res.headers.get('location')).toBeNull()
  })
})

describe('isTurbyEventPublic', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is true outside production', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(isTurbyEventPublic()).toBe(true)
  })

  it('is false in production without env flag', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ENABLE_TURBY_EVENT', '')
    expect(isTurbyEventPublic()).toBe(false)
  })
})
