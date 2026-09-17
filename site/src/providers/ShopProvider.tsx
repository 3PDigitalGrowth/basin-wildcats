'use client'

import { EcommerceProvider, useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import Link from 'next/link'
import React from 'react'

import styles from '@/components/CartButton/index.module.css'

/**
 * Ecommerce context for the shop, cart and checkout routes only. Keeping it
 * out of the root layout means the rest of the site ships without the shop
 * JavaScript.
 */
export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <EcommerceProvider
      enableVariants
      currenciesConfig={{
        defaultCurrency: 'AUD',
        supportedCurrencies: [
          { code: 'AUD', decimals: 2, label: 'Australian Dollar', symbol: '$' },
        ],
      }}
      api={{
        cartsFetchQuery: {
          depth: 2,
          populate: {
            products: {
              slug: true,
              title: true,
              gallery: true,
              inventory: true,
              priceInAUD: true,
            },
            variants: {
              title: true,
              inventory: true,
              priceInAUD: true,
              options: true,
            },
          },
        },
      }}
      paymentMethods={[
        stripeAdapterClient({
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        }),
      ]}
    >
      {children}
      <CartPill />
    </EcommerceProvider>
  )
}

/** Floating cart count shown on shop pages, where the header link has no live count. */
const CartPill: React.FC = () => {
  const { cart } = useCart()
  const count = (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
  if (count === 0) return null
  return (
    <Link
      href="/cart"
      className={`btn btn-red ${styles.cartPill}`}
      aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
    >
      Cart ({count})
    </Link>
  )
}
