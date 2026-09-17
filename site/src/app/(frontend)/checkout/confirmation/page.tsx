import type { Metadata } from 'next'

import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { Order, Product, Variant } from '@/payload-types'

import { formatAUD } from '@/utilities/formatAUD'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export const dynamic = 'force-dynamic'

type Args = {
  searchParams: Promise<{ order?: string; accessToken?: string }>
}

export default async function ConfirmationPage({ searchParams: searchParamsPromise }: Args) {
  const { order: orderId = '', accessToken = '' } = await searchParamsPromise

  const order = orderId && accessToken ? await findOrder({ orderId, accessToken }) : null

  if (!order) {
    return (
      <article className="section-tight">
        <div className="wrap">
          <div className="section-head">
            <h1 className="section-title reveal">We could not find that order</h1>
          </div>
          <p className="section-kicker" style={{ marginBottom: 22 }}>
            The link may have expired, or the order details do not match. If you have just paid
            and see this, email{' '}
            <a href="mailto:secretary@basinwildcats.com">secretary@basinwildcats.com</a> with your
            name and we will sort it out.
          </p>
          <Link className="btn btn-red" href="/shop">
            Back to the shop
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article className="section-tight">
      <div className="wrap">
        <div className="section-head">
          <h1 className="section-title reveal">Thanks, order confirmed</h1>
        </div>

        <p className="section-kicker" style={{ maxWidth: 640, marginBottom: 28 }}>
          {order.customerEmail
            ? `We have sent a confirmation to ${order.customerEmail}. `
            : ''}
          The committee will email you when your order is ready to collect at training.
        </p>

        <div
          style={{
            background: 'var(--white)',
            border: '1.5px solid var(--line)',
            borderRadius: 'var(--radius-md)',
            padding: 24,
            maxWidth: 640,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ color: 'var(--grey)' }}>Order</span>
            <span style={{ fontWeight: 700 }}>#{order.id}</span>
          </div>

          <div>
            {(order.items || []).map((item, i) => {
              const product = typeof item.product === 'object' ? (item.product as Product) : null
              const variant = typeof item.variant === 'object' ? (item.variant as Variant) : null
              const variantLabel = variant?.options
                ?.map((o) => (typeof o === 'object' ? o.label : null))
                .filter(Boolean)
                .join(', ')

              return (
                <div
                  key={item.id || i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 16,
                    padding: '8px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                  }}
                >
                  <span>
                    {product?.title || 'Item'}
                    {variantLabel ? ` (${variantLabel})` : ''} × {item.quantity}
                  </span>
                </div>
              )
            })}
          </div>

          {typeof order.amount === 'number' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderTop: '1.5px solid var(--line)',
                paddingTop: 14,
                fontWeight: 700,
              }}
            >
              <span>Total paid</span>
              <span style={{ color: 'var(--red-dark)' }}>{formatAUD(order.amount)}</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 28 }}>
          <Link className="btn btn-dark" href="/shop">
            Back to the shop
          </Link>
        </div>
      </div>
    </article>
  )
}

const findOrder = async ({
  orderId,
  accessToken,
}: {
  orderId: string
  accessToken: string
}): Promise<Order | null> => {
  const payload = await getPayload({ config: configPromise })

  try {
    // The accessToken is a one-time secret handed back only to the buyer
    // right after their payment succeeds, so a match is proof enough to
    // show this order without requiring a login.
    const { docs } = await payload.find({
      collection: 'orders',
      depth: 1,
      overrideAccess: true,
      where: {
        and: [{ id: { equals: orderId } }, { accessToken: { equals: accessToken } }],
      },
    })

    return docs[0] || null
  } catch {
    return null
  }
}

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false },
  openGraph: mergeOpenGraph({
    title: 'Order confirmed',
    url: '/checkout/confirmation',
  }),
}
