'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'

export type HeroVideoSource = {
  src: string
  type: string
}

export const HOME_HERO_SOURCES: HeroVideoSource[] = [
  { src: '/images/midnight_site_vid_hi_res.mp4', type: 'video/mp4' },
  { src: '/images/midnight_site_vid_hi_res.mov', type: 'video/quicktime' },
]

/** First frame of `midnight_site_vid_hi_res.mp4` — regenerate with `pnpm posters:extract` after replacing that video. */
export const HOME_HERO_POSTER = '/images/midnight_site_vid_hi_res_poster.jpg'

/**
 * Full-bleed looping hero video.
 * Sources are in the DOM immediately so cold loads start fetching right away (no IntersectionObserver delay).
 * Poster stays until `loadeddata`; then the browser paints video instead.
 */
export function HeroVideo({
  className,
  wrapperClassName,
  sources = HOME_HERO_SOURCES,
  poster = HOME_HERO_POSTER,
}: {
  className?: string
  /** Outer wrapper; default fills parent (e.g. aspect-ratio box). */
  wrapperClassName?: string
  sources?: HeroVideoSource[]
  poster?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useLayoutEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const tryPlay = () => video.play().catch(() => {})
    tryPlay()
    const t = window.setTimeout(tryPlay, 0)
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)
    return () => {
      window.clearTimeout(t)
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
    }
  }, [])

  const wrapClass = wrapperClassName ?? 'h-full w-full min-h-0'

  return (
    <div className={wrapClass}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        className={className}
      >
        {sources.map((source) => (
          <source key={`${source.src}-${source.type}`} src={source.src} type={source.type} />
        ))}
      </video>
    </div>
  )
}
