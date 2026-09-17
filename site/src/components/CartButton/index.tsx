'use client'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Link from 'next/link'
import React from 'react'

import styles from './index.module.css'

/**
 * Small cart indicator for the header. Shows the number of items in the
 * cart (not the total quantity of each, just how many lines) and links
 * through to /cart. Renders even with an empty cart so the shop always
 * feels one click away.
 */
export const CartButton: React.FC<{ className?: string }> = ({ className }) => {
  const { cart } = useCart()

  const count = (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart'}
      className={`${styles.cartButton} ${className || ''}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 6h15l-1.5 9h-12L6 6Zm0 0L5 3H2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="19.5" r="1.5" fill="currentColor" />
        <circle cx="17.5" cy="19.5" r="1.5" fill="currentColor" />
      </svg>
      {count > 0 && <span className={styles.count}>{count}</span>}
    </Link>
  )
}
