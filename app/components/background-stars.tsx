'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/** Star config without position (position is random per load) */
const STAR_CONFIG = [
  { src: '/images/star1_jenny.png', size: 24, opacity: 0.75 },
  { src: '/images/star2_jenny.png', size: 20, opacity: 0.7 },
  { src: '/images/star1_jenny.png', size: 28, opacity: 0.65 },
  { src: '/images/star2_jenny.png', size: 22, opacity: 0.8 },
  { src: '/images/star1_jenny.png', size: 26, opacity: 0.7 },
  { src: '/images/star2_jenny.png', size: 20, opacity: 0.75 },
  { src: '/images/star1_jenny.png', size: 20, opacity: 0.6 },
  { src: '/images/star2_jenny.png', size: 22, opacity: 0.65 },
  { src: '/images/star1_jenny.png', size: 24, opacity: 0.7 },
  { src: '/images/star2_jenny.png', size: 20, opacity: 0.6 },
  { src: '/images/star1_jenny.png', size: 22, opacity: 0.7 },
  { src: '/images/star2_jenny.png', size: 20, opacity: 0.65 },
  { src: '/images/star1_jenny.png', size: 24, opacity: 0.68 },
  { src: '/images/star2_jenny.png', size: 22, opacity: 0.72 },
] as const

/* ─── Star placement: seed + jitter (values in 0–1, fraction of viewport) ─── */
const EDGE_MARGIN = 0.1            // Stars stay at least this far from page edges
const JITTER = 0.025               // Max random offset per axis on each load (±2.5% for variety)

/** Icon positions (12, 3, 6, 9 o'clock). Seed positions are chosen to stay clear of these. */
const ICON_CENTERS: Array<[number, number]> = [
  [0.5, 0.12],   // top
  [0.88, 0.5],   // right
  [0.5, 0.88],   // bottom
  [0.12, 0.5],   // left
]

/** Fixed seed: 14 positions that are well-distributed, clear of icons and edges, and spaced apart. */
const SEED_POSITIONS: Array<[number, number]> = [
  [0.15, 0.15], [0.85, 0.15], [0.85, 0.85], [0.15, 0.85],  // corners
  [0.5, 0.32], [0.68, 0.5], [0.5, 0.68], [0.32, 0.5],    // mid-edges (between icons)
  [0.3, 0.3], [0.7, 0.3], [0.7, 0.7], [0.3, 0.7],        // inner quadrants
  [0.5, 0.5], [0.25, 0.25],                               // center + one more
]

function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x))
}

/** Seed positions + small random jitter, clamped to [EDGE_MARGIN, 1-EDGE_MARGIN]. */
function generateValidPositions(): Array<{ left: string; top: string }> {
  return SEED_POSITIONS.map(([x, y]) => {
    const jitteredX = clamp(x + (Math.random() * 2 - 1) * JITTER, EDGE_MARGIN, 1 - EDGE_MARGIN)
    const jitteredY = clamp(y + (Math.random() * 2 - 1) * JITTER, EDGE_MARGIN, 1 - EDGE_MARGIN)
    return {
      left: `${jitteredX * 100}%`,
      top: `${jitteredY * 100}%`,
    }
  })
}

export function BackgroundStars() {
  const [positions, setPositions] = useState<Array<{ left: string; top: string }> | null>(null)

  useEffect(() => {
    setPositions(generateValidPositions())
  }, [])

  if (!positions) {
    return <div className="page-bg-stars" aria-hidden />
  }

  return (
    <div className="page-bg-stars" aria-hidden>
      {STAR_CONFIG.map((star, i) => {
        const pos = positions[i]
        if (!pos) return null
        return (
        <Image
          key={i}
          src={star.src}
          alt=""
          width={star.size}
          height={star.size}
          className="star-wiggle star-twinkle absolute w-auto h-auto object-contain"
          style={{
            left: pos.left,
            top: pos.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            transform: 'translate(-50%, -50%)',
            animationDelay: `${i * 0.4}s`,
          }}
        />
        )
      })}
    </div>
  )
}
