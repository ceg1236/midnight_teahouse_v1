'use client'

import { useState } from 'react'
import { eventDates, eventTiers } from '../../../content/event-invite.config'

export default function AdminLinkPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [linkType, setLinkType] = useState<'specific' | 'open'>('specific')
  const [dateId, setDateId] = useState('')
  const [tierId, setTierId] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [generateError, setGenerateError] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (res.ok && data.ok) {
      setAuthenticated(true)
    } else {
      setAuthError('Invalid password')
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerateError('')
    setGeneratedUrl('')
    const res = await fetch('/api/admin/generate-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        open: linkType === 'open',
        ...(linkType === 'specific' && dateId && { dateId }),
        ...(linkType === 'specific' && tierId && { tierId }),
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setGenerateError(data.error ?? 'Failed to generate')
      return
    }
    setGeneratedUrl(data.url)
  }

  const handleCopy = async () => {
    if (!generatedUrl) return
    await navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#162143] px-6">
        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold text-[#FAEBD4]">Admin: Generate Link</h1>
          <label className="block">
            <span className="text-sm text-[#D9D0BF]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] focus:border-[#FAE0B9] focus:outline-none"
              required
            />
          </label>
          {authError && <p className="text-sm text-red-300">{authError}</p>}
          <button type="submit" className="carrd-btn px-6 py-2">
            Continue
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#162143] px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-xl font-semibold text-[#FAEBD4]">Generate Purchase Link</h1>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <span className="text-sm text-[#D9D0BF]">Link type</span>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-[#FAEBD4] cursor-pointer">
                <input
                  type="radio"
                  name="linkType"
                  checked={linkType === 'specific'}
                  onChange={() => setLinkType('specific')}
                  className="accent-[#FAE0B9]"
                />
                Specific date
              </label>
              <label className="flex items-center gap-2 text-[#FAEBD4] cursor-pointer">
                <input
                  type="radio"
                  name="linkType"
                  checked={linkType === 'open'}
                  onChange={() => setLinkType('open')}
                  className="accent-[#FAE0B9]"
                />
                Open (guest chooses)
              </label>
            </div>
          </div>

          {linkType === 'specific' && (
            <>
              <label className="block">
                <span className="text-sm text-[#D9D0BF]">Date</span>
                <select
                  value={dateId}
                  onChange={(e) => setDateId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] focus:border-[#FAE0B9] focus:outline-none"
                  required
                >
                  <option value="">Select…</option>
                  {eventDates.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-[#D9D0BF]">Tier (optional)</span>
                <select
                  value={tierId}
                  onChange={(e) => setTierId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] focus:border-[#FAE0B9] focus:outline-none"
                >
                  <option value="">Any</option>
                  {eventTiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {generateError && <p className="text-sm text-red-300">{generateError}</p>}

          <button type="submit" className="carrd-btn px-6 py-2">
            Generate Link
          </button>
        </form>

        {generatedUrl && (
          <div className="space-y-2">
            <p className="text-sm text-[#D9D0BF]">Copy and share:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="flex-1 rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-2 text-sm text-[#FAEBD4]"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="carrd-btn px-4 py-2 text-sm shrink-0"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
