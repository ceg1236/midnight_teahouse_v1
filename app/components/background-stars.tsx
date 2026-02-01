'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/** Star config (position comes from fixed STAR_POSITIONS) */
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
  { src: '/images/star1_jenny.png', size: 22, opacity: 0.7 },
] as const

/* ─── Fixed star positions (0–1). On resize, stars that collide with icons are hidden. ─── */
const COLLISION_THRESHOLD_PX = 80  // Star center within this many px of an icon center → hide star

/** 15 fixed positions: well-distributed, clear of edges (0.1 margin). */
const STAR_POSITIONS: Array<[number, number]> = [
  [0.12, 0.14], [0.88, 0.14], [0.88, 0.86], [0.12, 0.86],  // corners
  [0.5, 0.28], [0.78, 0.5], [0.5, 0.72], [0.22, 0.5],     // mid-edges (between icons)
  [0.28, 0.28], [0.72, 0.28], [0.72, 0.72], [0.28, 0.72], // inner quadrants
  [0.5, 0.5], [0.22, 0.28], [0.78, 0.72],                  // center + two more
]

const FIXED_POSITIONS: Array<{ left: string; top: string }> = STAR_POSITIONS.map(([x, y]) => ({
  left: `${x * 100}%`,
  top: `${y * 100}%`,
}))

function getIconCentersPx(): Array<[number, number]> {
  if (typeof document === 'undefined' || typeof window === 'undefined') return []
  const els = document.querySelectorAll<HTMLElement>('[data-background-obstacle="icon"]')
  return Array.from(els).map((el) => {
    const r = el.getBoundingClientRect()
    return [r.left + r.width / 2, r.top + r.height / 2] as [number, number]
  })
}

function starCenterPx(leftPct: number, topPct: number): [number, number] {
  if (typeof window === 'undefined') return [0, 0]
  return [
    (leftPct / 100) * window.innerWidth,
    (topPct / 100) * window.innerHeight,
  ]
}

function distPx(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(bx - ax, by - ay)
}

export function BackgroundStars() {
  const [hiddenIndices, setHiddenIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    function checkCollisions() {
      const iconCenters = getIconCentersPx()
      if (iconCenters.length === 0) {
        setHiddenIndices(new Set())
        return
      }
      const hidden = new Set<number>()
      FIXED_POSITIONS.forEach((pos, i) => {
        const [leftPct, topPct] = [parseFloat(pos.left), parseFloat(pos.top)]
        const [sx, sy] = starCenterPx(leftPct, topPct)
        const collides = iconCenters.some(
          ([ix, iy]) => distPx(sx, sy, ix, iy) < COLLISION_THRESHOLD_PX
        )
        if (collides) hidden.add(i)
      })
      setHiddenIndices(hidden)
    }

    checkCollisions()
    const delayed = setTimeout(checkCollisions, 150)
    window.addEventListener('resize', checkCollisions)
    return () => {
      clearTimeout(delayed)
      window.removeEventListener('resize', checkCollisions)
    }
  }, [])

  return (
    <div className="page-bg-stars" aria-hidden>
      {STAR_CONFIG.map((star, i) => {
        const pos = FIXED_POSITIONS[i]
        if (!pos) return null
        const hidden = hiddenIndices.has(i)
        return (
          <Image
            key={i}
            src={star.src}
            alt=""
            width={star.size}
            height={star.size}
            className="star-wiggle star-twinkle absolute w-auto h-auto object-contain transition-opacity duration-300"
            style={{
              left: pos.left,
              top: pos.top,
              width: star.size,
              height: star.size,
              opacity: hidden ? 0 : star.opacity,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.4}s`,
              pointerEvents: hidden ? 'none' : 'auto',
            }}
          />
        )
      })}
    </div>
  )
}
