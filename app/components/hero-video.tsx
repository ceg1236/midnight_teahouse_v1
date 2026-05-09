'use client'

import { useEffect, useRef, useState } from 'react'

export type HeroVideoSource = {
  src: string
  type: string
}

export const HOME_HERO_SOURCES: HeroVideoSource[] = [
  { src: '/images/midnight_site_vid_hi_res.mp4', type: 'video/mp4' },
  { src: '/images/midnight_site_vid_hi_res.mov', type: 'video/quicktime' },
]

/** Poster shown until video frames decode — improves LCP vs treating raw video as largest paint. */
export const HOME_HERO_POSTER = '/images/lovable_hero.jpg'

/**
 * Full-bleed looping hero video.
 * - poster + deferred `<source>` until near viewport (IntersectionObserver) avoids downloading ~MB until needed
 * - preload stays none/metadata instead of auto to reduce contention with first paint
 */
export function HeroVideo({
  className,
  wrapperClassName,
  sources = HOME_HERO_SOURCES,
  poster = HOME_HERO_POSTER,
  loadRootMargin = '200px',
}: {
  className?: string
  /** Outer wrapper; default fills parent (e.g. aspect-ratio box). */
  wrapperClassName?: string
  sources?: HeroVideoSource[]
  poster?: string
  /** IntersectionObserver rootMargin — larger values prefetch slightly earlier. */
  loadRootMargin?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mediaReady, setMediaReady] = useState(false)

  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setMediaReady(true)
      },
      { threshold: 0.01, rootMargin: loadRootMargin },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [loadRootMargin])

  useEffect(() => {
    if (!mediaReady) return
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.load()
    const tryPlay = () => video.play().catch(() => {})
    const t = window.setTimeout(tryPlay, 80)
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)
    return () => {
      window.clearTimeout(t)
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
    }
  }, [mediaReady])

  const wrapClass = wrapperClassName ?? 'h-full w-full min-h-0'

  return (
    <div ref={containerRef} className={wrapClass}>
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload={mediaReady ? 'metadata' : 'none'}
        poster={poster}
        className={className}
      >
        {mediaReady &&
          sources.map((source) => (
            <source key={`${source.src}-${source.type}`} src={source.src} type={source.type} />
          ))}
      </video>
    </div>
  )
}
