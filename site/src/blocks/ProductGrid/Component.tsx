import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, ProductGridBlock as Props } from '@/payload-types'

import { formatAUD } from '@/utilities/formatAUD'

export const ProductGridBlock: React.FC<Props> = async ({ title, kicker, limit }) => {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: limit || 4,
    overrideAccess: false,
    where: { _status: { equals: 'published' } },
  })
  if (products.docs.length === 0) return null

  return (
    <section className="gallery" id="shop">
      <div className="wrap">
        <div className="section-head">
          {title && <h2 className="section-title reveal">{title}</h2>}
          {kicker && <p className="section-kicker reveal reveal-d1">{kicker}</p>}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
            gap: 22,
          }}
        >
          {products.docs.map((p, i) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const doc = p as any
            const first = doc.gallery?.[0]?.image
            const img = first && typeof first === 'object' ? (first as Media) : null
            const price: number | undefined = doc.priceInAUD
            return (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className={`join-card reveal${i % 3 ? ` reveal-d${i % 3}` : ''}`}
                style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', gap: 0 }}
              >
                <div style={{ aspectRatio: '1 / 1', background: 'var(--cream-2)' }}>
                  {img?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={img.alt || p.title}
                      loading="lazy"
                      width={img.width || 800}
                      height={img.height || 800}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <h3 style={{ fontSize: 24 }}>{p.title}</h3>
                  {typeof price === 'number' && (
                    <span style={{ fontWeight: 600, color: 'var(--red-dark)' }}>{formatAUD(price)}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
        <div style={{ marginTop: 28 }}>
          <Link className="btn btn-dark" href="/shop">
            Visit the shop
          </Link>
        </div>
      </div>
    </section>
  )
}
