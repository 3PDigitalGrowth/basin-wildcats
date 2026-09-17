import Link from 'next/link'
import React from 'react'

import type { Media, Page, SiteSetting } from '@/payload-types'

import { preload } from 'react-dom'

import { Img, srcSetFor } from '@/components/Img'
import RichText from '@/components/RichText'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { hrefFromLink } from '@/utilities/hrefFromLink'

/**
 * The approved homepage hero: dark card with faint court linework, condensed
 * display headline with an outlined word and a red word, player cut-out, and
 * a stat bar fed from Site settings. Header sits inside the same card.
 */
export const ClubHero: React.FC<Page['hero']> = async (props) => {
  const { eyebrow, title, titleKnock, titleAccent, richText, links, media, showStats, statsNote } =
    props || {}
  const settings = (await getCachedGlobal('site-settings', 0)()) as SiteSetting
  const image = media && typeof media === 'object' ? (media as Media) : null
  const stats = showStats !== false ? settings?.stats || [] : []
  const heroSizes = '(max-width: 1020px) 420px, 40vw'
  if (image?.url) {
    preload(image.url, { as: 'image', fetchPriority: 'high', imageSrcSet: srcSetFor(image), imageSizes: heroSizes })
  }

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
            <circle cx="120" cy="350" r="60" />
            <path d="M1400 40 A 560 560 0 0 0 1400 660" />
          </g>
        </svg>

        <div className="hero-grid">
          <div className="hero-copy">
            {eyebrow && <p className="hero-eyebrow reveal">{eyebrow}</p>}
            <h1 className="hero-title reveal reveal-d1">
              {title}
              {(titleKnock || titleAccent) && (
                <span className="line-2">
                  {titleKnock && <span className="knock">{titleKnock}</span>}{' '}
                  {titleAccent && <span className="accent">{titleAccent}</span>}
                </span>
              )}
            </h1>
            {richText && (
              <RichText
                className="hero-sub reveal reveal-d2"
                data={richText}
                enableGutter={false}
                enableProse={false}
              />
            )}
            {links && links.length > 0 && (
              <div className="hero-ctas reveal reveal-d3">
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
            <figure className="hero-figure reveal reveal-d2">
              <Img media={image} sizes={heroSizes} priority fallbackWidth={800} fallbackHeight={1000} />
            </figure>
          )}
        </div>

        {(stats.length > 0 || statsNote) && (
          <div className="hero-stats">
            {stats.map((s, i) => (
              <div className="stat" key={i}>
                <div className="stat-num">
                  <span data-count={s.value}>0</span>
                  {s.suffix}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
            {statsNote && <p className="hero-stats-note">{statsNote}</p>}
          </div>
        )}
      </section>
    </div>
  )
}
