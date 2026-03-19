'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { eventDates, eventTiers } from '../../content/event-invite.config'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')

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

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-[#162143] px-6 pt-8">
        <p className="font-cursive text-xl text-[#D9D0BF]/90 mb-8 flex items-center gap-2">
          <span className="text-[#C4AF86]/70" aria-hidden>✶</span>
          Midnight Teahouse – Back of House
          <span className="text-[#C4AF86]/70" aria-hidden>✶</span>
        </p>
        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4 flex-1 flex flex-col justify-center">
          <h1 className="text-xl font-semibold text-[#FAEBD4]">Admin</h1>
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
    <div className="min-h-screen flex flex-col items-center bg-[#162143] px-6 py-12">
      <p className="font-cursive text-xl text-[#D9D0BF]/90 mb-6 flex items-center gap-2">
        <span className="text-[#C4AF86]/70" aria-hidden>✶</span>
        Midnight Teahouse – Back of House
        <span className="text-[#C4AF86]/70" aria-hidden>✶</span>
      </p>

      <div className="w-full max-w-md">
        <LinkTab password={password} />
      </div>
    </div>
  )
}

function LinkTab({ password }: { password: string }) {
  const [dateId, setDateId] = useState('')
  const [tierId, setTierId] = useState('')
  const [door, setDoor] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [generateError, setGenerateError] = useState('')

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerateError('')
    setGeneratedUrl('')
    const res = await fetch('/api/admin/generate-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password,
        door,
        ...(dateId && { dateId }),
        ...(tierId && { tierId }),
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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#FAEBD4]">Generate Purchase Link</h1>

      <form onSubmit={handleGenerate} className="space-y-4">
        <label className="flex items-center gap-2 text-[#FAEBD4] cursor-pointer">
          <input
            type="checkbox"
            checked={door}
            onChange={(e) => setDoor(e.target.checked)}
            className="accent-[#FAE0B9]"
          />
          <span className="text-sm text-[#D9D0BF]">Door (QR) – date inferred, tier defaults to Community</span>
        </label>

        {!door && (
          <>
            <label className="block">
              <span className="text-sm text-[#D9D0BF]">Pre-select date</span>
              <select
                value={dateId}
                onChange={(e) => {
                  setDateId(e.target.value)
                  setTierId('')
                }}
                className="mt-1 block w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] focus:border-[#FAE0B9] focus:outline-none"
              >
                <option value="">Any (guest chooses)</option>
                {eventDates.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            {dateId && (
              <label className="block">
                <span className="text-sm text-[#D9D0BF]">Pre-select tier</span>
                <select
                  value={tierId}
                  onChange={(e) => setTierId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-[#FAE0B9]/50 bg-[#2E0303]/50 px-4 py-3 text-[#FAEBD4] focus:border-[#FAE0B9] focus:outline-none"
                >
                  <option value="">Any (guest chooses)</option>
                  {eventTiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </>
        )}

        {generateError && <p className="text-sm text-red-300">{generateError}</p>}

        <button type="submit" className="carrd-btn px-6 py-2">
          Generate Link
        </button>
      </form>

      {generatedUrl && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-[#D9D0BF]">QR code</p>
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG value={generatedUrl} size={160} level="M" />
            </div>
          </div>
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
        </div>
      )}
    </div>
  )
}

