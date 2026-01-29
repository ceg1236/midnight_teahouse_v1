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

/** Random position 10%–90% from each edge (avoid page border) */
function randomPosition() {
  return {
    left: `${10 + Math.random() * 80}%`,
    top: `${10 + Math.random() * 80}%`,
  }
}

export function BackgroundStars() {
  const [positions, setPositions] = useState<Array<{ left: string; top: string }> | null>(null)

  useEffect(() => {
    setPositions(
      Array.from({ length: STAR_CONFIG.length }, randomPosition)
    )
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
