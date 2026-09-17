import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { InstagramFeedBlock as Props, Media, SiteSetting } from '@/payload-types'

import { Img } from '@/components/Img'
import { getCachedGlobal } from '@/utilities/getGlobals'

/**
 * Latest posts from the club Instagram, served from our own database and
 * Blob copies (refreshed by /api/cron/instagram). Styled to the site, links
 * out to the original post.
 */
export const InstagramFeedBlock: React.FC<Props> = async ({ title, kicker, count }) => {
  const payload = await getPayload({ config: configPromise })
  const [posts, settings] = await Promise.all([
    payload.find({
      collection: 'instagram-posts',
      depth: 1,
      limit: count || 8,
      sort: '-takenAt',
      where: { hidden: { not_equals: true } },
    }),
    getCachedGlobal('site-settings', 0)() as Promise<SiteSetting>,
  ])
  const handle = settings?.instagramHandle || 'thebasin.wildcats'
  const docs = posts.docs.filter((p) => p.image && typeof p.image === 'object')
  if (docs.length === 0) return null

  return (
    <section className="gallery" id="social-feed">
      <div className="wrap">
        <div className="section-head">
          <div>
            {title && (
              <h2 className="section-title reveal">
                {title}
              </h2>
            )}
            <a
              href={`https://www.instagram.com/${handle}/`}
              target="_blank"
              rel="noopener"
              className="reveal reveal-d1"
              style={{ display: 'inline-block', marginTop: 12, fontWeight: 600, color: 'var(--red-dark)' }}
            >
              @{handle}
            </a>
          </div>
          {kicker && <p className="section-kicker reveal reveal-d1">{kicker}</p>}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))',
            gap: 14,
          }}
        >
          {docs.map((p, i) => {
            const img = p.image as Media
            const caption = (p.caption || '').replace(/\s+/g, ' ').trim()
            return (
              <a
                key={p.id}
                href={p.permalink}
                target="_blank"
                rel="noopener"
                className={`ig-tile reveal${i % 3 ? ` reveal-d${i % 3}` : ''}`}
                aria-label={caption ? caption.slice(0, 120) : 'Instagram post'}
                style={{
                  position: 'relative',
                  display: 'block',
                  aspectRatio: '1 / 1',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--cream-2)',
                }}
              >
                <Img media={img} sizes="(max-width: 820px) 50vw, 25vw" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {p.mediaType === 'video' && (
                  <span
                    className="ticket-tag"
                    style={{ top: 10, left: 10, padding: '4px 10px' }}
                  >
                    Video
                  </span>
                )}
                {p.mediaType === 'carousel' && (
                  <span className="ticket-tag" style={{ top: 10, left: 10, padding: '4px 10px' }}>
                    Album
                  </span>
                )}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
