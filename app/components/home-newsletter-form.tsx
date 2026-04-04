'use client'

import { useState } from 'react'
import { apiPath } from '../../lib/client-api-url'

const honeypotClass =
  'absolute -left-[9999px] h-px w-px overflow-hidden opacity-0 [clip:rect(0,0,0,0)]'

export function HomeNewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setError('')
    setStatus('sending')
    const fd = new FormData(form)
    const payload = {
      email: String(fd.get('email') ?? ''),
      company: String(fd.get('company') ?? ''),
    }
    try {
      const res = await fetch(apiPath('/api/newsletter'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        setStatus('err')
        return
      }
      setStatus('ok')
      form.reset()
    } catch (err) {
      console.error('newsletter submit failed:', err)
      if (process.env.NODE_ENV === 'development' && err instanceof Error) {
        setError(`Could not reach the API (${err.message}). Check pnpm dev and POST ${apiPath('/api/newsletter')}.`)
      } else {
        setError('Could not reach the server. Check your connection and try again.')
      }
      setStatus('err')
    }
  }

  if (status === 'ok') {
    return (
      <p className="text-base text-[rgba(200,175,140,0.9)] md:text-lg" role="status">
        Thank you and welcome to the teahouse.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="relative flex min-w-[220px] flex-1 flex-wrap items-center gap-2">
      <p className={honeypotClass} aria-hidden="true">
        <label htmlFor="home-newsletter-company">Company</label>
        <input type="text" id="home-newsletter-company" name="company" tabIndex={-1} autoComplete="off" />
      </p>
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="your@email.com"
        className="min-w-0 flex-1 rounded border border-[rgba(180,140,110,0.35)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base text-[#d4b896] outline-none md:min-w-[180px] md:px-4"
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center justify-center border border-[rgba(180,140,110,0.45)] bg-[rgba(180,140,110,0.18)] px-5 py-2.5 text-sm font-normal uppercase tracking-[0.1em] text-[#e8d4b8] disabled:opacity-60"
      >
        {status === 'sending' ? '…' : 'Join'}
      </button>
      {error ? (
        <p className="w-full text-sm text-[#c9a080]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
