import React from 'react'

import type { ContactCardsBlock as Props, SiteSetting } from '@/payload-types'

import { getCachedGlobal } from '@/utilities/getGlobals'

type Contact = { role: string; name?: string | null; email?: string | null; phone?: string | null }

export const ContactCardsBlock: React.FC<Props> = async ({ title, intro, source, contacts }) => {
  let list: Contact[] = []
  if (source === 'custom') {
    list = (contacts || []) as Contact[]
  } else {
    const settings = (await getCachedGlobal('site-settings', 0)()) as SiteSetting
    list = (settings?.contacts || []) as Contact[]
  }
  if (list.length === 0) return null

  return (
    <section className="wrap">
      {(title || intro) && (
        <div className="section-head">
          {title && <h2 className="section-title reveal">{title}</h2>}
          {intro && <p className="section-kicker reveal reveal-d1">{intro}</p>}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
          gap: 18,
        }}
      >
        {list.map((c, i) => (
          <article
            className={`join-card reveal${i % 3 ? ` reveal-d${i % 3}` : ''}`}
            key={i}
            style={{ padding: '24px 22px', gap: 6 }}
          >
            <span className="join-tag" style={{ background: 'var(--green)' }}>
              {c.role}
            </span>
            {c.name && <h3 style={{ fontSize: 24 }}>{c.name}</h3>}
            {c.email && (
              <a href={`mailto:${c.email}`} style={{ color: 'var(--red-dark)', wordBreak: 'break-all', fontSize: 15 }}>
                {c.email}
              </a>
            )}
            {c.phone && (
              <a href={`tel:${c.phone.replace(/\s+/g, '')}`} style={{ fontSize: 15 }}>
                {c.phone}
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
