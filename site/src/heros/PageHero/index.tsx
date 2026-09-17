import Link from 'next/link'
import React from 'react'

import type { Media, Page } from '@/payload-types'

import RichText from '@/components/RichText'
import { hrefFromLink } from '@/utilities/hrefFromLink'

/** Compact dark hero for inner pages. Joins the header card above it. */
export const PageHero: React.FC<Page['hero']> = (props) => {
  const { eyebrow, title, titleAccent, richText, links, media } = props || {}
  const image = media && typeof media === 'object' ? (media as Media) : null

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
            {eyebrow && <p className="hero-eyebrow reveal">{eyebrow}</p>}
            <h1 className="page-hero-title reveal reveal-d1">
              {title} {titleAccent && <span className="accent">{titleAccent}</span>}
            </h1>
            {richText && (
              <RichText
                className="page-hero-sub reveal reveal-d2"
                data={richText}
                enableGutter={false}
                enableProse={false}
              />
            )}
            {links && links.length > 0 && (
              <div className="page-hero-ctas reveal reveal-d3">
                {links.map(({ link }, i) => {
                  const href = hrefFromLink(link)
                  if (!href) return null
                  return (
                    <Link
                      className={`btn ${i === 0 ? 'btn-red' : 'btn-ghost'}`}
                      href={href}
                      key={i}
                      {...(link?.newTab ? { target: '_blank', rel: 'noopener' } : {})}
                    >
                      {link?.label}
                    </Link>
                  )
                })}
              </div>
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
