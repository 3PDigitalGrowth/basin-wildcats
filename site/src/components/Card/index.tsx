import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Media } from '@/payload-types'

/**
 * Loose shape shared by Post-sourced cards (news archive, related posts)
 * and Search-collection results (which denormalise categories and don't
 * carry heroImage/excerpt/publishedAt). Both satisfy this structurally.
 */
export type CardPostData = {
  slug?: string | null
  title?: string | null
  excerpt?: string | null
  publishedAt?: string | null
  heroImage?: (number | null) | Media
  meta?: {
    title?: string | null
    description?: string | null
    image?: (number | null) | Media
  } | null
  categories?: ({ title?: string | null } | number)[] | null
}

const formatCardDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const Card: React.FC<{
  className?: string
  doc?: CardPostData
  relationTo?: 'posts' | 'pages'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const {
    className,
    doc,
    relationTo = 'posts',
    showCategories = true,
    title: titleFromProps,
  } = props

  const { slug, categories, meta, title, excerpt, publishedAt, heroImage } = doc || {}

  const heroMedia = heroImage && typeof heroImage === 'object' ? heroImage : null
  const metaMedia = meta?.image && typeof meta.image === 'object' ? meta.image : null
  const image = heroMedia || metaMedia

  const description = excerpt || meta?.description
  const titleToUse = titleFromProps || title || 'Untitled'
  const dateLabel = formatCardDate(publishedAt)

  const firstCategory =
    showCategories && Array.isArray(categories)
      ? categories.find((category) => typeof category === 'object' && category?.title)
      : null
  const tagLabel = firstCategory && typeof firstCategory === 'object' ? firstCategory.title : null

  if (!slug) return null

  const href =
    relationTo === 'pages' ? (slug === 'home' ? '/' : `/${slug}`) : `/news/${slug}`

  return (
    <Link className={cn('news-card', className)} href={href}>
      {image?.url && (
        <div className="news-card-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.url}
            alt={image.alt || ''}
            loading="lazy"
            width={image.width || 800}
            height={image.height || 600}
          />
          {tagLabel && <span className="join-tag">{tagLabel}</span>}
        </div>
      )}
      <div className="news-card-body">
        {dateLabel && <p className="news-card-date">{dateLabel}</p>}
        <h3>{titleToUse}</h3>
        {description && <p>{description}</p>}
      </div>
    </Link>
  )
}
