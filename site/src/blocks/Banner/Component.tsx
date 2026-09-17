import type { BannerBlock as BannerBlockProps } from 'src/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
  /** Set false when rendered inline inside rich text, which already sits in a `.wrap`. */
  enableGutter?: boolean
} & BannerBlockProps

export const BannerBlock: React.FC<Props> = ({ className, content, style, enableGutter = true }) => {
  return (
    <div className={cn(enableGutter && 'wrap', className)}>
      <div className={cn('banner-box', `banner-${style || 'info'}`)}>
        <RichText data={content} enableGutter={false} enableProse={false} />
      </div>
    </div>
  )
}
