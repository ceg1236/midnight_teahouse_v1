'use client'

import Image from 'next/image'

const STAR_SOURCES = ['/images/star1_jenny.png', '/images/star2_jenny.png'] as const

/** Positions (0–1): corners, diagonal pairs, and many along left/right sides for long scroll. */
const STAR_POSITIONS: Array<[number, number]> = [
  [0.12, 0.14],
  [0.78, 0.14],
  [0.93, 0.29],
  [0.88, 0.89],
  [0.08, 0.91],
  [0.18, 0.22],
  [0.26, 0.3],
  // Left side
  [0.03, 0.15],
  [0.05, 0.28],
  [0.04, 0.42],
  [0.06, 0.55],
  [0.03, 0.68],
  [0.05, 0.82],
  [0.04, 0.95],
  // Right side
  [0.97, 0.18],
  [0.95, 0.32],
  [0.96, 0.48],
  [0.94, 0.62],
  [0.97, 0.75],
  [0.95, 0.88],
]

const STARS = STAR_POSITIONS.map((pos, i) => ({
  pos,
  src: STAR_SOURCES[i % STAR_SOURCES.length],
  size: 16 + (i % 5) * 2,
  opacity: 0.6 + (i % 4) * 0.05,
}))

export function BackgroundStars() {
  return (
    <div className="page-bg-stars" aria-hidden>
      {STARS.map((star, i) => (
        <Image
          key={i}
          src={star.src}
          alt=""
          width={star.size}
          height={star.size}
          className="star-wiggle star-twinkle absolute w-auto h-auto object-contain"
          style={{
            left: `${star.pos[0] * 100}%`,
            top: `${star.pos[1] * 100}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            transform: 'translate(-50%, -50%)',
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  )
}
