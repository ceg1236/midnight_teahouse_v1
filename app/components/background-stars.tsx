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
] as const

const EDGE_MARGIN = 0.1       // 10% from page border
const ICON_CENTER_RADIUS = 0.22  // keep stars outside center icon circle (radius ~22% of viewport)
const MIN_STAR_DIST = 0.08   // min distance between any two stars (8% of viewport)

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1)
}

/** Generate 10 positions: 10% from edges, outside icon circle, min spacing between stars */
function generateValidPositions(): Array<{ left: string; top: string }> {
  const positions: Array<{ x: number; y: number }> = []
  const maxAttempts = 200

  for (let i = 0; i < STAR_CONFIG.length; i++) {
    let placed = false
    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      const x = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)
      const y = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)

      // Must be outside center icon circle
      if (dist(x, y, 0.5, 0.5) <= ICON_CENTER_RADIUS) continue

      // Must be at least MIN_STAR_DIST from every other star
      const tooClose = positions.some((p) => dist(x, y, p.x, p.y) < MIN_STAR_DIST)
      if (tooClose) continue

      positions.push({ x, y })
      placed = true
    }
    // Fallback: place on a ring outside icon circle if we couldn't find a spot (rare)
    if (!placed) {
      const angle = (i / STAR_CONFIG.length) * Math.PI * 2 + Math.random() * 0.5
      const r = ICON_CENTER_RADIUS + 0.12 + Math.random() * 0.15
      const x = Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.cos(angle) * r))
      const y = Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.sin(angle) * r))
      positions.push({ x, y })
    }
  }

  return positions.map(({ x, y }) => ({
    left: `${x * 100}%`,
    top: `${y * 100}%`,
  }))
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
      {STAR_CONFIG.map((star, i) => (
        <Image
          key={i}
          src={star.src}
          alt=""
          width={star.size}
          height={star.size}
          className="star-wiggle absolute w-auto h-auto object-contain"
          style={{
            left: positions[i].left,
            top: positions[i].top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            transform: 'translate(-50%, -50%)',
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
}
