import React from 'react'

import type { Media } from '@/payload-types'

type Props = {
  media: Media | null | undefined
  /** CSS sizes hint, e.g. "(max-width: 1020px) 100vw, 33vw". */
  sizes?: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  /** Fallback intrinsic size when the media record has none. */
  fallbackWidth?: number
  fallbackHeight?: number
}

/**
 * Responsive image for Payload media stored on Vercel Blob. Builds a srcset
 * from the size variants Payload generated at upload (300 to 1920px wide), so
 * phones do not download the 1400px original. Plain <img>: no runtime
 * optimiser, no remotePatterns, and the CDN does the caching.
 */
export const srcSetFor = (media: Media): string | undefined => {
  const sizes = media.sizes
  if (!sizes) return undefined
  const entries = Object.values(sizes)
    .filter((s) => s && s.url && s.width)
    .map((s) => `${s!.url} ${s!.width}w`)
  if (media.url && media.width) entries.push(`${media.url} ${media.width}w`)
  return entries.length > 1 ? entries.join(', ') : undefined
}

export const Img: React.FC<Props> = ({
  media,
  sizes = '100vw',
  alt,
  className,
  style,
  priority,
  fallbackWidth = 1200,
  fallbackHeight = 900,
}) => {
  if (!media?.url) return null
  const srcSet = srcSetFor(media)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt ?? media.alt ?? ''}
      width={media.width || fallbackWidth}
      height={media.height || fallbackHeight}
      className={className}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding={priority ? 'sync' : 'async'}
    />
  )
}
