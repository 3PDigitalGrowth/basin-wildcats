import React from 'react'

import type { MarqueeBlock as Props } from '@/payload-types'

/** The signature red strip. Items repeat twice so the loop is seamless. */
export const MarqueeBlock: React.FC<Props> = ({ items }) => {
  const list = items && items.length > 0 ? items : []
  if (list.length === 0) return null
  const doubled = [...list, ...list]

  return (
    <div className="marquee-shell" aria-hidden="true">
      <div className="marquee">
        <div className="marquee-track">
          {doubled.map((item, i) => (
            <span className={item.hollow ? 'hollow' : undefined} key={i}>
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
