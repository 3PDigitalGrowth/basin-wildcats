import React from 'react'

import type { EmbedBlock as Props } from '@/payload-types'

export const EmbedBlock: React.FC<Props> = ({ title, url, height }) => {
  if (!url) return null
  return (
    <section className="wrap">
      {title && <h2 className="section-title reveal" style={{ marginBottom: 24 }}>{title}</h2>}
      <div
        className="reveal"
        style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--line)' }}
      >
        <iframe
          src={url}
          title={title || 'Embedded content'}
          width="100%"
          height={height || 480}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ display: 'block', border: 0 }}
        />
      </div>
    </section>
  )
}
