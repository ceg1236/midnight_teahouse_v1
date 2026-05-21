import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'

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
})
