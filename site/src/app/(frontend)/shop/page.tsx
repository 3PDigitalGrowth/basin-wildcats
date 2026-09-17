import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { Img } from '@/components/Img'
import React from 'react'

import type { Media as MediaType } from '@/payload-types'

import { formatAUD } from '@/utilities/formatAUD'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const payload = await getPayload({ config: configPromise })
  const { docs: products } = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
    where: { _status: { equals: 'published' } },
  })

  return (
    <article>
      <div className="hero-shell">
        <section className="hero-card joined">
          <svg
            className="hero-lines"
            viewBox="0 0 1400 700"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <g fill="none" stroke="#F6F2EA" strokeWidth="1.5">
              <circle cx="120" cy="350" r="190" />
              <path d="M1400 40 A 560 560 0 0 0 1400 660" />
            </g>
          </svg>
          <div className="page-hero no-media">
            <div>
              <p className="hero-eyebrow reveal">Club merchandise</p>
              <h1 className="page-hero-title reveal reveal-d1">
                Wildcats <span className="accent">Shop</span>
              </h1>
              <p className="page-hero-sub reveal reveal-d2">
                Grey hoodies for cooler nights at the courts, sized for Mini Cats through to
                seniors. Everything here is collected at training: no shipping, no fuss.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="gallery" id="products">
        <div className="wrap">
          {products.length === 0 ? (
            <div className="section-head">
              <p className="section-kicker">
                Nothing is listed yet. Check back soon, or ask a committee member at training.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                gap: 22,
              }}
            >
              {products.map((product, i) => {
                const first = product.gallery?.[0]?.image
                const img = first && typeof first === 'object' ? (first as MediaType) : null
                const price = product.priceInAUD
                const outOfStock = !product.enableVariants && product.inventory === 0

                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className={`join-card reveal${i % 3 ? ` reveal-d${i % 3}` : ''}`}
                    style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', gap: 0 }}
                  >
                    <div
                      style={{
                        aspectRatio: '1 / 1',
                        background: 'var(--cream-2)',
                        position: 'relative',
                      }}
                    >
                      {img?.url && (
                        <Img media={img} alt={img.alt || product.title} sizes="(max-width: 820px) 100vw, 25vw" priority={i === 0} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      {outOfStock && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 14,
                            left: 14,
                            background: 'rgba(15,18,16,0.78)',
                            color: 'var(--cream)',
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            borderRadius: 999,
                            padding: '6px 14px',
                          }}
                        >
                          Sold out
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        padding: '18px 20px 22px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      <h2 style={{ fontSize: 24 }}>{product.title}</h2>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {typeof price === 'number' && (
                          <span style={{ fontWeight: 600, color: 'var(--red-dark)' }}>
                            {formatAUD(price)}
                          </span>
                        )}
                        <span className="btn btn-outline" style={{ padding: '8px 18px' }}>
                          View
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'The Basin Wildcats club shop. Grey hoodies sized Child 8 through to Adult XXL, collected at training.',
  openGraph: mergeOpenGraph({
    title: 'Wildcats Shop',
    url: '/shop',
  }),
}
