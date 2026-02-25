'use client'

import { useEffect, useState } from 'react'

type CountdownTimerProps = {
  /** Unix timestamp (seconds) for the target date */
  targetTimestamp: number
  /** Show days, hours, minutes (or include seconds) */
  length?: 3 | 4
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

export function CountdownTimer({ targetTimestamp, length = 3 }: CountdownTimerProps) {
  const [diff, setDiff] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000)
      let remaining = targetTimestamp - now
      if (remaining < 0) remaining = 0
      const days = Math.floor(remaining / 86400)
      remaining %= 86400
      const hours = Math.floor(remaining / 3600)
      remaining %= 3600
      const minutes = Math.floor(remaining / 60)
      const seconds = remaining % 60
      setDiff({ days, hours, minutes, seconds })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetTimestamp])

  if (!diff) return null

  return (
    <ul className="flex items-center justify-center gap-2 text-center" style={{ fontFamily: "'Aboreto', cursive" }}>
      <li className="flex flex-col items-center min-w-[2.5rem]">
        <span className="text-[#D9D0BF] text-2xl md:text-4xl leading-tight tabular-nums">
          {pad(diff.days)}
        </span>
        <span className="text-[#D9D0BF] text-sm mt-1" style={{ fontFamily: "'Amiri', serif" }}>
          Days
        </span>
      </li>
      <li className="text-[#D9D0BF] text-2xl md:text-4xl">:</li>
      <li className="flex flex-col items-center min-w-[2.5rem]">
        <span className="text-[#D9D0BF] text-2xl md:text-4xl leading-tight tabular-nums">
          {pad(diff.hours)}
        </span>
        <span className="text-[#D9D0BF] text-sm mt-1" style={{ fontFamily: "'Amiri', serif" }}>
          Hrs
        </span>
      </li>
      <li className="text-[#D9D0BF] text-2xl md:text-4xl">:</li>
      <li className="flex flex-col items-center min-w-[2.5rem]">
        <span className="text-[#D9D0BF] text-2xl md:text-4xl leading-tight tabular-nums">
          {pad(diff.minutes)}
        </span>
        <span className="text-[#D9D0BF] text-sm mt-1" style={{ fontFamily: "'Amiri', serif" }}>
          Mins
        </span>
      </li>
      {length === 4 && (
        <>
          <li className="text-[#D9D0BF] text-2xl md:text-4xl">:</li>
          <li className="flex flex-col items-center min-w-[2.5rem]">
            <span className="text-[#D9D0BF] text-2xl md:text-4xl leading-tight tabular-nums">
              {pad(diff.seconds)}
            </span>
            <span className="text-[#D9D0BF] text-sm mt-1" style={{ fontFamily: "'Amiri', serif" }}>
              Secs
            </span>
          </li>
        </>
      )}
    </ul>
  )
}
