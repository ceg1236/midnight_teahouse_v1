'use client'

import { useEffect, useRef } from 'react'

/** Autoplays when visible — same behavior as invite carrd page (iOS / mobile first-load). */
export function HeroVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const tryPlay = () => video.play().catch(() => {})
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) tryPlay()
      },
      { threshold: 0.01, rootMargin: '100px' }
    )
    observer.observe(video)
    const t = setTimeout(tryPlay, 150)
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)
    return () => {
      clearTimeout(t)
      observer.disconnect()
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
    }
  }, [])
  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={className}
    >
      <source src="/images/midnight_site_vid_hi_res.mp4" type="video/mp4" />
      <source src="/images/midnight_site_vid_hi_res.mov" type="video/quicktime" />
    </video>
  )
}
