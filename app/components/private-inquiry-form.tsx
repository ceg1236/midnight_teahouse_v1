'use client'

import { useState } from 'react'
import { apiPath } from '../../lib/client-api-url'

const honeypotClass =
  'absolute -left-[9999px] h-px w-px overflow-hidden opacity-0 [clip:rect(0,0,0,0)]'

export function PrivateInquiryForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setStatus('sending')
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      eventType: String(fd.get('eventType') ?? ''),
      approximateDate: String(fd.get('approximateDate') ?? ''),
      message: String(fd.get('message') ?? ''),
      company: String(fd.get('company') ?? ''),
    }
    try {
      const res = await fetch(apiPath('/api/private-inquiry'), {
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
      e.currentTarget.reset()
    } catch (err) {
      console.error('private-inquiry fetch failed:', err)
      if (process.env.NODE_ENV === 'development' && err instanceof Error) {
        setError(
          `Could not reach the API (${err.message}). Use the same host/port as this page with pnpm dev running, and check the Network tab for POST ${apiPath('/api/private-inquiry')}.`
        )
      } else {
        setError('Could not reach the server. Check your connection and try again.')
      }
      setStatus('err')
    }
  }

  if (status === 'ok') {
    return (
      <p className="mt-4 text-center text-base text-[rgba(200,175,140,0.9)]" role="status">
        Thank you — we received your note and will be in touch soon.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="relative rounded border border-[rgba(180,140,110,0.25)] bg-[rgba(180,140,110,0.06)] p-7 md:p-8">
      <p className={honeypotClass} aria-hidden="true">
        <label htmlFor="home-inquiry-company">Company</label>
        <input type="text" id="home-inquiry-company" name="company" tabIndex={-1} autoComplete="off" />
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="home-inquiry-name"
            className="text-xs uppercase tracking-[0.14em] text-[rgba(200,175,140,0.75)] md:text-sm"
          >
            Name
          </label>
          <input
            id="home-inquiry-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            className="rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base text-[#d4b896] outline-none md:px-4"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="home-inquiry-email"
            className="text-xs uppercase tracking-[0.14em] text-[rgba(200,175,140,0.75)] md:text-sm"
          >
            Email
          </label>
          <input
            id="home-inquiry-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="your@email.com"
            className="rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base text-[#d4b896] outline-none md:px-4"
          />
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="home-inquiry-event-type"
            className="text-xs uppercase tracking-[0.14em] text-[rgba(200,175,140,0.75)] md:text-sm"
          >
            Event type
          </label>
          <input
            id="home-inquiry-event-type"
            name="eventType"
            type="text"
            placeholder="Wedding, corporate, party..."
            className="rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base text-[#d4b896] outline-none md:px-4"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="home-inquiry-approximate-date"
            className="text-xs uppercase tracking-[0.14em] text-[rgba(200,175,140,0.75)] md:text-sm"
          >
            Approximate Date
          </label>
          <input
            id="home-inquiry-approximate-date"
            name="approximateDate"
            type="date"
            className="min-h-[2.75rem] w-full rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2 text-base text-[#d4b896] outline-none [color-scheme:dark] md:min-h-0 md:px-4 md:py-2.5"
          />
        </div>
      </div>
      <textarea
        name="message"
        required
        placeholder="Tell us a little about your event — guest count, location, vision..."
        className="mt-3 h-28 w-full resize-none rounded border border-[rgba(180,140,110,0.3)] bg-[rgba(180,140,110,0.08)] px-3 py-2.5 text-base leading-relaxed text-[#d4b896] outline-none md:px-4"
      />
      {error ? (
        <p className="mt-3 text-sm text-[#c9a080]" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-4 inline-flex items-center justify-center border border-[rgba(180,140,110,0.45)] bg-[rgba(180,140,110,0.18)] px-6 py-2.5 text-sm font-normal uppercase tracking-[0.1em] text-[#e8d4b8] disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  )
}
