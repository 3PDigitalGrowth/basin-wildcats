import React from 'react'

import type { Media, TicketGalleryBlock as Props } from '@/payload-types'

export const TicketGalleryBlock: React.FC<Props> = ({ title, titleHollow, kicker, cards }) => {
  const list = cards || []
  if (list.length === 0) return null
  const cols = list.length === 2 ? 'cols-2' : list.length >= 4 ? 'cols-4' : ''

  return (
    <section className="gallery" id="gallery">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title reveal">
            {title} {titleHollow && <em>{titleHollow}</em>}
          </h2>
          {kicker && <p className="section-kicker reveal reveal-d1">{kicker}</p>}
        </div>
        <div className={`gallery-grid ${cols}`}>
          {list.map((card, i) => {
            const image = card.image && typeof card.image === 'object' ? (card.image as Media) : null
            if (!image?.url) return null
            return (
              <article className={`ticket reveal${i % 3 ? ` reveal-d${i % 3}` : ''}`} key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt || card.caption}
                  loading="lazy"
                  width={image.width || 800}
                  height={image.height || 920}
                />
                {card.tag && <span className="ticket-tag">{card.tag}</span>}
                <div className="ticket-cap">
                  {card.caption}
                  {card.sub && <small>{card.sub}</small>}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
