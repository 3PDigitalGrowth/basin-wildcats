'use client'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import React, { useMemo } from 'react'

import type { Media as MediaType, Product, Variant } from '@/payload-types'

import { formatAUD } from '@/utilities/formatAUD'
import styles from './cart.module.css'

export const CartClient: React.FC = () => {
  const { cart, isLoading, incrementItem, decrementItem, removeItem } = useCart()

  const items = cart?.items || []
  const isEmpty = items.length === 0

  const subtotal = useMemo(() => {
    if (typeof cart?.subtotal === 'number') return cart.subtotal
    return items.reduce((sum, item) => {
      const product = typeof item.product === 'object' ? (item.product as Product) : undefined
      const variant = typeof item.variant === 'object' ? (item.variant as Variant) : undefined
      const unitPrice = variant?.priceInAUD ?? product?.priceInAUD ?? 0
      return sum + unitPrice * item.quantity
    }, 0)
  }, [cart?.subtotal, items])

  if (isEmpty) {
    return (
      <div className={styles.empty}>
        <p>Your cart is empty.</p>
        <Link className="btn btn-red" href="/shop">
          Visit the shop
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {items.map((item) => {
          const product = typeof item.product === 'object' ? (item.product as Product) : undefined
          const variant = typeof item.variant === 'object' ? (item.variant as Variant) : undefined

          if (!product) return null

          const image = product.gallery?.[0]?.image
          const img = image && typeof image === 'object' ? (image as MediaType) : null

          const variantLabel = variant?.options
            ?.map((option) => (typeof option === 'object' ? option.label : null))
            .filter(Boolean)
            .join(', ')

          const unitPrice = variant?.priceInAUD ?? product.priceInAUD ?? 0
          const stock = variant ? (variant.inventory ?? 0) : (product.inventory ?? 0)
          const atMaxStock = item.quantity >= stock

          return (
            <li className={styles.row} key={item.id}>
              <Link href={`/shop/${product.slug}`} className={styles.thumb}>
                {img?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.alt || product.title} width={100} height={100} />
                )}
              </Link>

              <div className={styles.details}>
                <Link href={`/shop/${product.slug}`} className={styles.title}>
                  {product.title}
                </Link>
                {variantLabel && <p className={styles.variant}>{variantLabel}</p>}
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeItem(item.id)}
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>

              <div className={styles.stepper}>
                <button
                  type="button"
                  disabled={isLoading || item.quantity <= 1}
                  onClick={() => decrementItem(item.id)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  disabled={isLoading || atMaxStock}
                  onClick={() => incrementItem(item.id)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className={styles.lineTotal}>{formatAUD(unitPrice * item.quantity)}</div>
            </li>
          )
        })}
      </ul>

      <div className={styles.summary}>
        <div className={styles.subtotalRow}>
          <span>Subtotal</span>
          <span className={styles.subtotalAmount}>{formatAUD(subtotal)}</span>
        </div>
        <p className={styles.summaryNote}>
          No shipping: every order is collected at training. We will email you when it is ready.
        </p>
        <Link className="btn btn-red" href="/checkout" style={{ alignSelf: 'flex-start' }}>
          Checkout
        </Link>
      </div>
    </div>
  )
}
