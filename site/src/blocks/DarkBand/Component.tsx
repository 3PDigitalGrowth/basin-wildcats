import React from 'react'

import type { DarkBandBlock as Props, Media } from '@/payload-types'
import { Img } from '@/components/Img'

import { BandVideo } from './BandVideo'

const Eyes = () => (
  <svg className="season-eyes" viewBox="0 0 240 80" aria-hidden="true">
    <g fill="#D2312E">
      <path d="M4 52 Q34 6 102 14 Q80 30 76 54 Q38 66 4 52 Z" />
      <path d="M236 52 Q206 6 138 14 Q160 30 164 54 Q202 66 236 52 Z" />
    </g>
  </svg>
)

export const DarkBandBlock: React.FC<Props> = ({
  title,
  titleHollow,
  sub,
  cards,
  background,
  showEyes,
}) => {
  const video =
    background?.video && typeof background.video === 'object' ? (background.video as Media) : null
  const image =
    background?.image && typeof background.image === 'object' ? (background.image as Media) : null
  const list = cards || []
  const cols = list.length === 2 ? 'cols-2' : list.length === 4 ? 'cols-4' : ''

  return (
    <div className="seasons-shell">
      <section className="seasons" id="seasons">
        {video?.url && <BandVideo src={video.url} poster={image?.url || undefined} />}
        {image?.url && (
          // Still image: the only background under 768px, the poster behind the video above it.
          <Img
            media={image}
            alt=""
            sizes="100vw"
            className="seasons-fallback"
            style={video?.url ? undefined : { display: 'block' }}
          />
        )}
        {showEyes !== false && <Eyes />}
        <div className="wrap">
          <h2 className="seasons-title reveal">
            {title} {titleHollow && <em>{titleHollow}</em>}
          </h2>
          {sub && <p className="seasons-sub reveal reveal-d1">{sub}</p>}
          {list.length > 0 && (
            <div className={`season-cards ${cols}`}>
              {list.map((card, i) => (
                <div
                  className={`season-card reveal${i ? ` reveal-d${Math.min(i, 3)}` : ''}`}
                  key={i}
                >
                  <h3>
                    {card.title} {card.accent && <span>{card.accent}</span>}
                  </h3>
                  {card.body && <p>{card.body}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
