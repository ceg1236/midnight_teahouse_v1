'use client'

import { useState } from 'react'
import { apiPath } from '../../../lib/client-api-url'

const honeypotClass =
  'absolute -left-[9999px] h-px w-px overflow-hidden opacity-0 [clip:rect(0,0,0,0)]'

export function MwNewsletterForm() {
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
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
      setStatus('err')
    }
  }

  if (status === 'ok') {
    return (
      <p className="mw-font-body text-[17px] text-[var(--mw-gold)]" role="status">
        Thank you and welcome to the teahouse.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-[420px] flex-wrap items-center justify-center gap-3">
      <p className={honeypotClass} aria-hidden="true">
        <label htmlFor="mw-newsletter-company">Company</label>
        <input type="text" id="mw-newsletter-company" name="company" tabIndex={-1} autoComplete="off" />
      </p>
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="your@email.com"
        className="mw-input min-w-0 flex-1"
      />
      <button type="submit" disabled={status === 'sending'} className="mw-btn-primary" style={{ minHeight: '52px' }}>
        {status === 'sending' ? '…' : 'Join'}
      </button>
      {error ? (
        <p className="w-full text-sm" role="alert" style={{ color: 'var(--mw-error)' }}>
          {error}
        </p>
      ) : null}
    </form>
  )
}
