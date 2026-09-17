'use client'

import React, { useEffect, useRef } from 'react'

/**
 * Background video loop for the dark band. Pauses off screen and never
 * autoplays under prefers-reduced-motion. Hidden under 768px by CSS, where the
 * still image takes over (house rule).
 */
export const BandVideo: React.FC<{ src: string; poster?: string }> = ({ src, poster }) => {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      video.removeAttribute('autoplay')
      video.pause()
      return
    }
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) video.play().catch(() => {})
          else video.pause()
        })
      },
      { threshold: 0.1 },
    )
    io.observe(video)
    return () => io.disconnect()
  }, [])

  return (
    <video
      className="seasons-video"
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      aria-hidden="true"
      preload="metadata"
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
