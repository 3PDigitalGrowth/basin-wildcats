import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React, { Suspense, cache } from 'react'

import type { Media as MediaType } from '@/payload-types'

import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { formatAUD } from '@/utilities/formatAUD'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { PurchasePanel } from './PurchasePanel'
import styles from './page.module.css'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return products.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function ProductPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const product = await queryProductBySlug({ slug: decodedSlug })

  if (!product) notFound()

  const gallery = (product.gallery || [])
    .map((item) => item.image)
    .filter((img): img is MediaType => typeof img === 'object' && img !== null)

  const relatedResult = await queryRelatedProducts({ excludeId: product.id })

  return (
    <article className="section-tight">
      {draft && <LivePreviewListener />}

      <div className="wrap">
        <p style={{ marginBottom: 22 }}>
          <Link className="btn btn-outline" href="/shop" style={{ padding: '9px 18px' }}>
            ← Back to shop
          </Link>
        </p>

        <div className={styles.layout}>
          <div>
            <div
              style={{
                aspectRatio: '1 / 1',
                background: 'var(--cream-2)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              {gallery[0]?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={gallery[0].url}
                  alt={gallery[0].alt || product.title}
                  width={gallery[0].width || 1000}
                  height={gallery[0].height || 1000}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  fetchPriority="high"
                />
              )}
            </div>
            {gallery.length > 1 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: 12,
                  marginTop: 12,
                }}
              >
                {gallery.slice(1).map((img, i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio: '1 / 1',
                      background: 'var(--cream-2)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url || ''}
                      alt={img.alt || product.title}
                      width={img.width || 400}
                      height={img.height || 400}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1
              className="display"
              style={{ fontSize: 'clamp(32px, 4vw, 52px)', marginBottom: 6 }}
            >
              {product.title}
            </h1>

            <Suspense fallback={null}>

              <PurchasePanel product={product} />

            </Suspense>

            {product.description && (
              <div style={{ marginTop: 36 }}>
                <RichText
                  className="prose-club"
                  data={product.description}
                  enableProse={false}
                  enableGutter={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {relatedResult.docs.length > 0 && (
        <section className="gallery">
          <div className="wrap">
            <div className="section-head">
              <h2 className="section-title reveal">More from the shop</h2>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
                gap: 22,
              }}
            >
              {relatedResult.docs.map((related, i) => {
                const first = related.gallery?.[0]?.image
                const img = first && typeof first === 'object' ? (first as MediaType) : null
                return (
                  <Link
                    key={related.id}
                    href={`/shop/${related.slug}`}
                    className={`join-card reveal${i % 3 ? ` reveal-d${i % 3}` : ''}`}
                    style={{ padding: 0, overflow: 'hidden', textDecoration: 'none', gap: 0 }}
                  >
                    <div style={{ aspectRatio: '1 / 1', background: 'var(--cream-2)' }}>
                      {img?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt={img.alt || related.title}
                          loading="lazy"
                          width={img.width || 800}
                          height={img.height || 800}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        padding: '18px 20px 22px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <h3 style={{ fontSize: 22 }}>{related.title}</h3>
                      {typeof related.priceInAUD === 'number' && (
                        <span style={{ fontWeight: 600, color: 'var(--red-dark)' }}>
                          {formatAUD(related.priceInAUD)}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const product = await queryProductBySlug({ slug: decodedSlug })

  if (!product) {
    return { title: 'Product not found' }
  }

  const title = product.meta?.title || product.title
  const description =
    product.meta?.description ||
    (typeof product.priceInAUD === 'number'
      ? `${product.title}, ${formatAUD(product.priceInAUD)}. Collected at training.`
      : undefined)

  return {
    title,
    description,
    openGraph: mergeOpenGraph({
      title: title || undefined,
      description: description || undefined,
      url: `/shop/${decodedSlug}`,
    }),
  }
}

const queryProductBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})

const queryRelatedProducts = cache(async ({ excludeId }: { excludeId: number }) => {
  const payload = await getPayload({ config: configPromise })

  return payload.find({
    collection: 'products',
    depth: 1,
    limit: 3,
    overrideAccess: false,
    where: {
      and: [{ _status: { equals: 'published' } }, { id: { not_equals: excludeId } }],
    },
  })
})
