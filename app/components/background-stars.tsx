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

const EDGE_MARGIN = 0.1            // 10% from page border
const ICON_KEEP_AWAY = 0.1         // stars cannot be within this distance of any icon (10% of viewport)
const MIN_STAR_DIST = 0.08         // min distance between any two stars (8% of viewport)
const CANDIDATE_COUNT = 100        // try this many candidates per star; pick the one in most open space

/** Icon positions on the circle (12, 3, 6, 9 o'clock) in normalized 0–1 coords */
const ICON_CENTERS: Array<[number, number]> = [
  [0.5, 0.12],   // top
  [0.88, 0.5],   // right
  [0.5, 0.88],   // bottom
  [0.12, 0.5],   // left
]

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1)
}

/** Min distance from (x,y) to any icon center; star is invalid if this < ICON_KEEP_AWAY */
function minDistToIcons(x: number, y: number): number {
  let d = Infinity
  for (const [ix, iy] of ICON_CENTERS) {
    d = Math.min(d, dist(x, y, ix, iy))
  }
  return d
}

/** Distance from (x,y) to the "keep away" boundary of the nearest icon (0 if inside a keep-away zone) */
function distToIconZones(x: number, y: number): number {
  return Math.max(0, minDistToIcons(x, y) - ICON_KEEP_AWAY)
}

/** Distance from (x,y) to nearest page edge (within valid margin zone) */
function distToNearestEdge(x: number, y: number): number {
  return Math.min(
    x - EDGE_MARGIN,
    1 - EDGE_MARGIN - x,
    y - EDGE_MARGIN,
    1 - EDGE_MARGIN - y
  )
}

/** Score for a candidate: how much "clear space" it has (min of dist to stars, icon zones, edges). */
function clearanceScore(
  x: number,
  y: number,
  existing: Array<{ x: number; y: number }>
): number {
  let minDist = distToNearestEdge(x, y)
  minDist = Math.min(minDist, distToIconZones(x, y))
  for (const p of existing) {
    minDist = Math.min(minDist, dist(x, y, p.x, p.y))
  }
  return minDist
}

/** Generate positions: valid zone, not too close to any icon (or edges/other stars); prefer open space. */
function generateValidPositions(): Array<{ left: string; top: string }> {
  const positions: Array<{ x: number; y: number }> = []

  for (let i = 0; i < STAR_CONFIG.length; i++) {
    let best: { x: number; y: number; score: number } | null = null

    for (let k = 0; k < CANDIDATE_COUNT; k++) {
      const x = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)
      const y = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)

      if (minDistToIcons(x, y) < ICON_KEEP_AWAY) continue
      const tooCloseToStar = positions.some((p) => dist(x, y, p.x, p.y) < MIN_STAR_DIST)
      if (tooCloseToStar) continue

      const score = clearanceScore(x, y, positions)
      if (score < MIN_STAR_DIST) continue
      if (!best || score > best.score) best = { x, y, score }
    }

    if (best) {
      positions.push({ x: best.x, y: best.y })
    } else {
      // Fallback: random point in valid zone (not in any icon keep-away)
      for (let attempt = 0; attempt < 50; attempt++) {
        const x = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)
        const y = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)
        if (minDistToIcons(x, y) >= ICON_KEEP_AWAY) {
          positions.push({ x, y })
          break
        }
        if (attempt === 49) {
          const angle = (i / STAR_CONFIG.length) * Math.PI * 2 + Math.random() * 0.5
          const r = 0.35 + Math.random() * 0.15
          positions.push({
            x: Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.cos(angle) * r)),
            y: Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.sin(angle) * r)),
          })
        }
      }
    }
  }

  const result = positions.map(({ x, y }) => ({
    left: `${x * 100}%`,
    top: `${y * 100}%`,
  }))
  while (result.length < STAR_CONFIG.length) {
    const angle = (result.length / STAR_CONFIG.length) * Math.PI * 2
    const r = 0.35 + Math.random() * 0.15
    const x = Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.cos(angle) * r))
    const y = Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.sin(angle) * r))
    result.push({ left: `${x * 100}%`, top: `${y * 100}%` })
  }
  return result
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
          className="star-wiggle absolute w-auto h-auto object-contain"
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
