import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

type Props = MediaBlockProps & {
  captionClassName?: string
  className?: string
  /** Set false when rendered inline inside rich text, which already sits in a `.wrap`. */
  enableGutter?: boolean
  imgClassName?: string
}

export const MediaBlock: React.FC<Props> = (props) => {
  const { captionClassName, className, enableGutter = true, imgClassName, media } = props

  const image = media && typeof media === 'object' ? media : null
  const caption = image?.caption

  if (!image?.url) return null

  return (
    <div className={cn('media-block', enableGutter && 'wrap', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={cn('media-block-img', imgClassName)}
        src={image.url}
        alt={image.alt || ''}
        loading="lazy"
        width={image.width || 1200}
        height={image.height || 800}
      />
      {caption && (
        <div className={cn('media-block-caption', captionClassName)}>
          <RichText data={caption} enableGutter={false} enableProse={false} />
        </div>
      )}
    </div>
  )
}
