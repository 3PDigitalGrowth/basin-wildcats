import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Sponsor, SponsorGridBlock as Props } from '@/payload-types'

export const SponsorGridBlock: React.FC<Props> = async ({
  title,
  source,
  sponsors: selected,
  showBlurbs,
}) => {
  let sponsors: Sponsor[] = []

  if (source === 'selected' && selected && selected.length > 0) {
    sponsors = selected.filter((s): s is Sponsor => typeof s === 'object' && s !== null)
  } else {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'sponsors',
      depth: 1,
      limit: 24,
      sort: 'order',
      where: { active: { equals: true } },
    })
    sponsors = result.docs
  }

  if (sponsors.length === 0) return null

  const n = sponsors.length
  const cols = n <= 3 ? 'cols-3' : n === 4 ? 'cols-4' : n === 6 ? 'cols-6' : ''

  return (
    <section className="sponsors" id="sponsors">
      <div className="wrap">
        {title && <h2 className="sponsors-head reveal">{title}</h2>}
        <div className={`sponsor-row reveal reveal-d1 ${cols}`}>
          {sponsors.map((s) => {
            const logo = s.logo && typeof s.logo === 'object' ? (s.logo as Media) : null
            const inner = (
              <>
                {logo?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo.url} alt={logo.alt || `${s.name} logo`} loading="lazy" />
                )}
                <strong>{s.name}</strong>
                {s.supports && <span>{s.supports}</span>}
                {showBlurbs && s.blurb && <p>{s.blurb}</p>}
              </>
            )
            return s.url ? (
              <a className="sponsor" href={s.url} key={s.id} rel="noopener" target="_blank">
                {inner}
              </a>
            ) : (
              <div className="sponsor" key={s.id}>
                {inner}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
