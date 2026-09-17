'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Adds `.is-in` to `.reveal` elements as they scroll into view and runs the
 * stat count-up on `[data-count]`. Respects prefers-reduced-motion. Re-runs on
 * navigation so new pages animate too.
 */
export const RevealInit: React.FC = () => {
  const pathname = usePathname()

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)'))
    const counters = Array.from(document.querySelectorAll<HTMLElement>('[data-count]'))

    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach((el) => el.classList.add('is-in'))
      counters.forEach((el) => (el.textContent = el.dataset.count || ''))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    reveals.forEach((el) => io.observe(el))

    const animateCount = (el: HTMLElement) => {
      const target = parseInt(el.dataset.count || '0', 10)
      const duration = 1400
      let start: number | null = null
      const step = (ts: number) => {
        if (start === null) start = ts
        const progress = Math.min((ts - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        el.textContent = String(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target as HTMLElement)
            cio.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 },
    )
    counters.forEach((el) => cio.observe(el))

    // Elements above the fold on a fresh load can be observed before layout settles.
    const t = window.setTimeout(() => {
      reveals.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in')
      })
    }, 300)

    return () => {
      io.disconnect()
      cio.disconnect()
      window.clearTimeout(t)
    }
  }, [pathname])

  return null
}
