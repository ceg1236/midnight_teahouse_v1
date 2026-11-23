'use client'

import { useEffect, useState } from 'react'

const DESKTOP_COUNT = 60
const MOBILE_COUNT = 32

/** Deterministic PRNG so server and client render the same positions (no hydration mismatch). */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261215)

const fireflies = Array.from({ length: DESKTOP_COUNT }, (_, i) => {
  const size = 2 + rand() * 2.2
  return {
    top: `${(rand() * 100).toFixed(2)}%`,
    left: `${(rand() * 100).toFixed(2)}%`,
    size,
    desktopOnly: i >= MOBILE_COUNT,
    glowDur: `${(4.2 + rand() * 5.2).toFixed(2)}s`,
    glowDelay: `${(rand() * 7).toFixed(2)}s`,
    driftDur: `${(11 + rand() * 9).toFixed(2)}s`,
    dx: `${(rand() * 60 - 30).toFixed(1)}px`,
    dy: `${(rand() * 70 - 35).toFixed(1)}px`,
  }
})

/** One shooting star at a time, firing on a random interval; fixed within the layer, behind content. */
function ShootingStar() {
  const [star, setStar] = useState<null | { top: string; left: string; angle: number; dist: number; dur: number; key: number }>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let keyCounter = 0
    let timeoutId: ReturnType<typeof setTimeout>

    const fire = () => {
      const angle = 148 + Math.random() * 22
      const dist = 240 + Math.random() * 180
      const dur = 1.1 + Math.random() * 0.5
      keyCounter += 1
      setStar({
        top: `${(6 + Math.random() * 38).toFixed(1)}vh`,
        left: `${(40 + Math.random() * 52).toFixed(1)}vw`,
        angle,
        dist,
        dur,
        key: keyCounter,
      })
      const nextDelay = (35 + Math.random() * 45) * 1000
      timeoutId = setTimeout(fire, nextDelay)
    }

    const firstDelay = (9 + Math.random() * 12) * 1000
    timeoutId = setTimeout(fire, firstDelay)
    return () => clearTimeout(timeoutId)
  }, [])

  if (!star) return null

  return (
    <span
      key={star.key}
      className="mw-shooting-star"
      style={
        {
          top: star.top,
          left: star.left,
          '--mw-star-angle': `${star.angle}deg`,
          '--mw-star-dist': `${star.dist}px`,
          '--mw-star-dur': `${star.dur}s`,
        } as React.CSSProperties
      }
      aria-hidden
    />
  )
}

/** Shared ambient layer (fireflies + shooting star) for every mw- page. Render once, behind content. */
export function FirefliesLayer() {
  return (
    <div className="mw-fx-layer" aria-hidden>
      {fireflies.map((f, i) => (
        <span
          key={i}
          className={`mw-firefly ${f.desktopOnly ? 'mw-firefly--desktop-only' : ''}`}
          style={
            {
              top: f.top,
              left: f.left,
              width: `${f.size}px`,
              height: `${f.size}px`,
              boxShadow: `0 0 ${f.size * 3}px ${f.size * 1.2}px rgba(246,220,154,0.45)`,
              '--mw-glow-dur': f.glowDur,
              '--mw-glow-delay': f.glowDelay,
              '--mw-drift-dur': f.driftDur,
              '--mw-dx': f.dx,
              '--mw-dy': f.dy,
            } as React.CSSProperties
          }
        />
      ))}
      <ShootingStar />
    </div>
  )
}
