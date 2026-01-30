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

const EDGE_MARGIN = 0.1           // 10% from page border
const ICON_CENTER_RADIUS = 0.4   // icon circle radius – keep stars outside where icons sit (12/3/6/9)
const MIN_STAR_DIST = 0.08       // min distance between any two stars (8% of viewport)
const CANDIDATE_COUNT = 100      // try this many candidates per star; pick the one in most open space

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1)
}

/** Distance from (x,y) to the icon circle boundary (0 if inside circle) */
function distToIconCircle(x: number, y: number): number {
  const d = dist(x, y, 0.5, 0.5)
  return Math.max(0, d - ICON_CENTER_RADIUS)
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

/** Score for a candidate: how much "clear space" it has (min of dist to stars, icon circle, edges). */
function clearanceScore(
  x: number,
  y: number,
  existing: Array<{ x: number; y: number }>
): number {
  let minDist = distToNearestEdge(x, y)
  minDist = Math.min(minDist, distToIconCircle(x, y))
  for (const p of existing) {
    minDist = Math.min(minDist, dist(x, y, p.x, p.y))
  }
  return minDist
}

/** Generate positions: valid zone only, outside icon circle, min spacing; prefer filling open space. */
function generateValidPositions(): Array<{ left: string; top: string }> {
  const positions: Array<{ x: number; y: number }> = []

  for (let i = 0; i < STAR_CONFIG.length; i++) {
    let best: { x: number; y: number; score: number } | null = null

    for (let k = 0; k < CANDIDATE_COUNT; k++) {
      const x = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)
      const y = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)

      if (dist(x, y, 0.5, 0.5) <= ICON_CENTER_RADIUS) continue
      const tooCloseToStar = positions.some((p) => dist(x, y, p.x, p.y) < MIN_STAR_DIST)
      if (tooCloseToStar) continue

      const score = clearanceScore(x, y, positions)
      if (score < MIN_STAR_DIST) continue
      if (!best || score > best.score) best = { x, y, score }
    }

    if (best) {
      positions.push({ x: best.x, y: best.y })
    } else {
      // Fallback: ring just outside icon circle
      const angle = (i / STAR_CONFIG.length) * Math.PI * 2 + Math.random() * 0.5
      const r = ICON_CENTER_RADIUS + 0.06 + Math.random() * 0.1
      const x = Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.cos(angle) * r))
      const y = Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.sin(angle) * r))
      positions.push({ x, y })
    }
  }

  const result = positions.map(({ x, y }) => ({
    left: `${x * 100}%`,
    top: `${y * 100}%`,
  }))
  // Ensure we always have one entry per star (pad with fallback if something went wrong)
  while (result.length < STAR_CONFIG.length) {
    const angle = (result.length / STAR_CONFIG.length) * Math.PI * 2
    const r = ICON_CENTER_RADIUS + 0.08 + Math.random() * 0.1
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
