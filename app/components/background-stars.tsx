'use client'

import Image from 'next/image'

/** 6 stars: 4 in corners, 2 in a diagonal pair (upper-left). */
const STAR_CONFIG = [
  { src: '/images/star1_jenny.png', size: 24, opacity: 0.75 },
  { src: '/images/star2_jenny.png', size: 20, opacity: 0.7 },
  { src: '/images/star1_jenny.png', size: 22, opacity: 0.8 },
  { src: '/images/star2_jenny.png', size: 24, opacity: 0.7 },
  { src: '/images/star1_jenny.png', size: 20, opacity: 0.65 },
  { src: '/images/star2_jenny.png', size: 22, opacity: 0.72 },
] as const

/** Positions (0–1): corners + diagonal pair near each other. */
const STAR_POSITIONS: Array<[number, number]> = [
  [0.12, 0.14],   // top-left
  [0.78, 0.14],   // top-right
  [0.93, 0.29],   // top-center
  [0.88, 0.89],   // bottom-right
  [0.08, 0.91],   // bottom-left
  [0.18, 0.22],   // diagonal pair
  [0.26, 0.30],   // diagonal pair (near above)
]

const FIXED_POSITIONS = STAR_POSITIONS.map(([x, y]) => ({
  left: `${x * 100}%`,
  top: `${y * 100}%`,
}))

export function BackgroundStars() {
  return (
    <div className="page-bg-stars" aria-hidden>
      {STAR_CONFIG.map((star, i) => {
        const pos = FIXED_POSITIONS[i]
        if (!star || !pos) return null
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
