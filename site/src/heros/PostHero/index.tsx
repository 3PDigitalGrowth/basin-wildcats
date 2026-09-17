import React from 'react'

import type { Media, Post } from '@/payload-types'

/** Compact dark hero for a news post: joins the header card, same shell as PageHero. */
export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, publishedAt, title } = post

  const image = heroImage && typeof heroImage === 'object' ? (heroImage as Media) : null

  const categoryLabels = (categories || [])
    .map((category) => (typeof category === 'object' ? category.title : null))
    .filter(Boolean) as string[]

  const dateLabel = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="hero-shell">
      <section className="hero-card joined">
        <svg
          className="hero-lines"
          viewBox="0 0 1400 700"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g fill="none" stroke="#F6F2EA" strokeWidth="1.5">
            <circle cx="120" cy="350" r="190" />
            <path d="M1400 40 A 560 560 0 0 0 1400 660" />
          </g>
        </svg>
        <div className={`page-hero${image?.url ? '' : ' no-media'}`}>
          <div>
            {categoryLabels.length > 0 && (
              <p className="hero-eyebrow reveal">{categoryLabels.join(', ')}</p>
            )}
            <h1 className="page-hero-title reveal reveal-d1">{title}</h1>
            {dateLabel && (
              <p className="page-hero-sub reveal reveal-d2">
                <time dateTime={publishedAt || undefined}>{dateLabel}</time>
              </p>
            )}
          </div>
          {image?.url && (
            <figure className="page-hero-figure reveal reveal-d2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || ''}
                width={image.width || 1200}
                height={image.height || 900}
                fetchPriority="high"
              />
            </figure>
          )}
        </div>
      </section>
    </div>
  )
}
