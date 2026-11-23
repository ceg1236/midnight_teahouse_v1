'use client'

import { useId, useState } from 'react'
import { apiPath } from '../../../lib/client-api-url'

const BUDGET_OPTIONS = ['Under $1,000', '$1,000 – $2,000', 'Over $2,000']

const honeypotClass =
  'absolute -left-[9999px] h-px w-px overflow-hidden opacity-0 [clip:rect(0,0,0,0)]'

const labelClass = 'mw-font-body text-sm text-[var(--mw-text-muted)]'

export function PrivateQuoteForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle')
  const [error, setError] = useState('')
  const [budget, setBudget] = useState('')
  const formId = useId()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    setError('')
    setStatus('sending')
    const fd = new FormData(form)
    const payload = {
      firstName: String(fd.get('firstName') ?? ''),
      lastName: String(fd.get('lastName') ?? ''),
      email: String(fd.get('email') ?? ''),
      budget,
      approximateDate: String(fd.get('approximateDate') ?? ''),
      location: String(fd.get('location') ?? ''),
      headcount: String(fd.get('headcount') ?? ''),
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
      form.reset()
      setBudget('')
    } catch (err) {
      console.error('private-inquiry submit failed:', err)
      setError('Could not reach the server. Check your connection and try again.')
      setStatus('err')
    }
  }

  if (status === 'ok') {
    return (
      <div role="status" className="flex flex-col gap-2">
        <h3 className="mw-font-aboreto text-[22px] text-[var(--mw-text-strong)]">Thank you</h3>
        <p className="mw-font-body text-[18px] leading-relaxed text-[var(--mw-text-soft)]">
          We&rsquo;ve received your inquiry and will be in touch soon with a proposal.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="mw-font-body flex flex-col gap-5">
      <p className={honeypotClass} aria-hidden="true">
        <label htmlFor={`${formId}-company`}>Company</label>
        <input type="text" id={`${formId}-company`} name="company" tabIndex={-1} autoComplete="off" />
      </p>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>Name</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="firstName"
            type="text"
            required
            placeholder="First name (required)"
            aria-label="First name"
            className="mw-input"
          />
          <input name="lastName" type="text" placeholder="Last name" aria-label="Last name" className="mw-input" />
        </div>
      </fieldset>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email (required)"
          className="mw-input"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>Budget</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Budget">
          {BUDGET_OPTIONS.map((opt) => {
            const selected = budget === opt
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setBudget(selected ? '' : opt)}
                className="mw-font-body rounded-full border px-4 py-2 text-sm"
                style={{
                  borderColor: selected ? 'var(--mw-gold)' : 'var(--mw-line-input)',
                  background: selected ? 'var(--mw-selected-tint)' : 'transparent',
                  color: selected ? 'var(--mw-gold)' : 'var(--mw-text)',
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Approximate event date</span>
          <input name="approximateDate" type="text" className="mw-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Approximate event location</span>
          <input name="location" type="text" className="mw-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClass}>Headcount</span>
          <input name="headcount" type="number" min={1} placeholder="Approx. guests" className="mw-input" />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Event details</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Share your hopes, dreams, questions, and desires!"
          className="mw-input mw-textarea"
        />
      </label>

      {error ? (
        <p className="text-sm" style={{ color: 'var(--mw-error)' }} role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={status === 'sending'} className="mw-btn-primary self-start">
        {status === 'sending' ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  )
}
