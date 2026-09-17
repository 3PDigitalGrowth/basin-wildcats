'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * Background video loop for the dark band. Rendered only on screens 768px and
 * wider (house rule: phones get the still image and never download the clip),
 * pauses off screen, and never autoplays under prefers-reduced-motion.
 */
export const BandVideo: React.FC<{ src: string; poster?: string }> = ({ src, poster }) => {
  const ref = useRef<HTMLVideoElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const update = () => setEnabled(wide.matches && !reduceMotion)
    update()
    wide.addEventListener('change', update)
    return () => wide.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video || !enabled || !('IntersectionObserver' in window)) return
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
  }, [enabled])

  if (!enabled) return null

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
