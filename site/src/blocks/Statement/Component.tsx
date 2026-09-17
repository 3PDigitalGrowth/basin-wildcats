import React from 'react'

import type { Media, StatementBlock as Props } from '@/payload-types'

import { Img } from '@/components/Img'
import RichText from '@/components/RichText'

/** The about section: pill label, big condensed statement, two tilted photos. */
export const StatementBlock: React.FC<Props> = ({ tabLabel, statement, body, imageLeft, imageRight }) => {
  const left = imageLeft && typeof imageLeft === 'object' ? (imageLeft as Media) : null
  const right = imageRight && typeof imageRight === 'object' ? (imageRight as Media) : null
  const hasImages = Boolean(left?.url || right?.url)

  return (
    <section className="about" id="about">
      <div className="wrap">
        {tabLabel && <span className="about-tab reveal">{tabLabel}</span>}
        <div className={`about-grid${hasImages ? '' : ' no-images'}`}>
          {hasImages && (
            <div className="about-img about-img-1 reveal">
              {left?.url && (
                <Img media={left} sizes="(max-width: 1020px) 260px, 18vw" />
              )}
            </div>
          )}
          <div>
            <RichText
              className="about-statement reveal reveal-d1"
              data={statement}
              enableGutter={false}
              enableProse={false}
            />
            {body && <p className="about-body reveal reveal-d2">{body}</p>}
          </div>
          {hasImages && (
            <div className="about-img about-img-2 reveal reveal-d1">
              {right?.url && (
                <Img media={right} sizes="(max-width: 1020px) 260px, 18vw" />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
