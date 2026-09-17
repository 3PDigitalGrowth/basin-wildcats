import Link from 'next/link'
import React from 'react'

import type { CardGridBlock as Props } from '@/payload-types'
import { hrefFromLink } from '@/utilities/hrefFromLink'

export const CardGridBlock: React.FC<Props> = ({ title, titleHollow, kicker, cards }) => {
  const list = cards || []
  if (list.length === 0) return null

  const hasFeature = list.some((c) => c.feature)
  const gridClass =
    list.length === 2
      ? 'cols-2'
      : list.length >= 4
        ? 'cols-4'
        : hasFeature
          ? ''
          : 'even'

  return (
    <section className="join">
      <div className="wrap">
        {(title || kicker) && (
          <div className="section-head">
            {title && (
              <h2 className="section-title reveal">
                {title} {titleHollow && <em>{titleHollow}</em>}
              </h2>
            )}
            {kicker && <p className="section-kicker reveal reveal-d1">{kicker}</p>}
          </div>
        )}
        <div className={`join-cards ${gridClass}`}>
          {list.map((card, i) => {
            const href = card.hasLink !== false ? hrefFromLink(card.link) : null
            const delay = i % 3 === 0 ? '' : ` reveal-d${i % 3}`
            return (
              <article
                className={`join-card reveal${card.feature ? ' feature' : ''}${delay}`}
                key={i}
              >
                {card.tag && <span className="join-tag">{card.tag}</span>}
                <h3>{card.title}</h3>
                {card.body && <p>{card.body}</p>}
                {href && card.link?.label && (
                  <Link
                    className={`btn ${card.feature ? 'btn-red' : 'btn-dark'}`}
                    href={href}
                    {...(card.link.newTab ? { target: '_blank', rel: 'noopener' } : {})}
                  >
                    {card.link.label}
                  </Link>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
