'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/** Pollen config for day mode – position is random per load */
const POLLEN_CONFIG = [
  { src: '/images/pollen1_jenny.png', size: 28, opacity: 0.5 },
  { src: '/images/pollen2_jenny.png', size: 24, opacity: 0.45 },
  { src: '/images/pollen1_jenny.png', size: 24, opacity: 0.55 },
  { src: '/images/pollen2_jenny.png', size: 30, opacity: 0.4 },
  { src: '/images/pollen1_jenny.png', size: 26, opacity: 0.5 },
  { src: '/images/pollen2_jenny.png', size: 22, opacity: 0.48 },
  { src: '/images/pollen1_jenny.png', size: 28, opacity: 0.42 },
  { src: '/images/pollen2_jenny.png', size: 26, opacity: 0.52 },
  { src: '/images/pollen1_jenny.png', size: 24, opacity: 0.46 },
  { src: '/images/pollen2_jenny.png', size: 28, opacity: 0.44 },
] as const

const EDGE_MARGIN = 0.1
const ICON_KEEP_AWAY = 0.1
const MIN_POLLEN_DIST = 0.08
const CANDIDATE_COUNT = 100

const ICON_CENTERS: Array<[number, number]> = [
  [0.5, 0.12],
  [0.88, 0.5],
  [0.5, 0.88],
  [0.12, 0.5],
]

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1)
}

function minDistToIcons(x: number, y: number): number {
  let d = Infinity
  for (const [ix, iy] of ICON_CENTERS) {
    d = Math.min(d, dist(x, y, ix, iy))
  }
  return d
}

function distToIconZones(x: number, y: number): number {
  return Math.max(0, minDistToIcons(x, y) - ICON_KEEP_AWAY)
}

function distToNearestEdge(x: number, y: number): number {
  return Math.min(
    x - EDGE_MARGIN,
    1 - EDGE_MARGIN - x,
    y - EDGE_MARGIN,
    1 - EDGE_MARGIN - y
  )
}

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

function generateValidPositions(): Array<{ left: string; top: string }> {
  const positions: Array<{ x: number; y: number }> = []
  const count = POLLEN_CONFIG.length

  for (let i = 0; i < count; i++) {
    let best: { x: number; y: number; score: number } | null = null

    for (let k = 0; k < CANDIDATE_COUNT; k++) {
      const x = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)
      const y = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)

      if (minDistToIcons(x, y) < ICON_KEEP_AWAY) continue
      const tooClose = positions.some((p) => dist(x, y, p.x, p.y) < MIN_POLLEN_DIST)
      if (tooClose) continue

      const score = clearanceScore(x, y, positions)
      if (score < MIN_POLLEN_DIST) continue
      if (!best || score > best.score) best = { x, y, score }
    }

    if (best) {
      positions.push({ x: best.x, y: best.y })
    } else {
      for (let attempt = 0; attempt < 50; attempt++) {
        const x = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)
        const y = EDGE_MARGIN + Math.random() * (1 - 2 * EDGE_MARGIN)
        if (minDistToIcons(x, y) >= ICON_KEEP_AWAY) {
          positions.push({ x, y })
          break
        }
        if (attempt === 49) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
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
  while (result.length < count) {
    const angle = (result.length / count) * Math.PI * 2
    const r = 0.35 + Math.random() * 0.15
    const x = Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.cos(angle) * r))
    const y = Math.max(EDGE_MARGIN, Math.min(1 - EDGE_MARGIN, 0.5 + Math.sin(angle) * r))
    result.push({ left: `${x * 100}%`, top: `${y * 100}%` })
  }
  return result
}

export function BackgroundPollen() {
  const [positions, setPositions] = useState<Array<{ left: string; top: string }> | null>(null)

  useEffect(() => {
    setPositions(generateValidPositions())
  }, [])

  if (!positions) {
    return <div className="page-bg-pollen" aria-hidden />
  }

  return (
    <div className="page-bg-pollen" aria-hidden>
      {POLLEN_CONFIG.map((pollen, i) => {
        const pos = positions[i]
        if (!pos) return null
        return (
          <Image
            key={i}
            src={pollen.src}
            alt=""
            width={pollen.size}
            height={pollen.size}
            className="pollen-float absolute w-auto h-auto object-contain"
            style={{
              left: pos.left,
              top: pos.top,
              width: pollen.size,
              height: pollen.size,
              opacity: pollen.opacity,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.5}s`,
            }}
          />
        )
      })}
    </div>
  )
}
