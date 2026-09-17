import Link from 'next/link'
import React from 'react'

import styles from './index.module.css'

/**
 * Header cart link without a live count, so pages outside the shop do not
 * load the ecommerce client. Shop pages show the count in a floating pill.
 */
export const CartLink: React.FC<{ className?: string }> = ({ className }) => (
  <Link prefetch={false} href="/cart" aria-label="Cart" className={`${styles.cartButton} ${className || ''}`}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6h15l-1.5 9h-12L6 6Zm0 0L5 3H2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  </Link>
)
