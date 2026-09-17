import Link from 'next/link'
import React from 'react'

import type { ImageTextBlock as Props, Media } from '@/payload-types'

import { Img } from '@/components/Img'
import RichText from '@/components/RichText'
import { hrefFromLink } from '@/utilities/hrefFromLink'

export const ImageTextBlock: React.FC<Props> = ({ image, imagePosition, tilt, richText, links }) => {
  const img = image && typeof image === 'object' ? (image as Media) : null
  const right = imagePosition === 'right'

  return (
    <section className="wrap">
      <div
        className="reveal"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(28px, 5vw, 72px)',
          alignItems: 'center',
        }}
      >
        <div style={{ order: right ? 2 : 1 }}>
          {img?.url && (
            <figure
              style={{
                margin: 0,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: '0 18px 40px rgba(15,18,16,0.18)',
                transform: tilt === false ? undefined : `rotate(${right ? 2 : -2}deg)`,
              }}
            >
              <Img media={img} sizes="(max-width: 820px) 100vw, 50vw" style={{ width: '100%', height: 'auto' }} />
            </figure>
          )}
        </div>
        <div style={{ order: right ? 1 : 2 }}>
          {richText && (
            <RichText className="prose-club" data={richText} enableGutter={false} enableProse={false} />
          )}
          {links && links.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 24 }}>
              {links.map(({ link }, i) => {
                const href = hrefFromLink(link)
                if (!href) return null
                return (
                  <Link
                    className={`btn ${i === 0 ? 'btn-red' : 'btn-outline'}`}
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
      </div>
    </section>
  )
}
