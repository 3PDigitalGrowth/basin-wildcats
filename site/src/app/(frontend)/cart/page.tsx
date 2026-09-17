import type { Metadata } from 'next'

import React from 'react'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { CartClient } from './CartClient'

export default function CartPage() {
  return (
    <article className="section-tight">
      <div className="wrap">
        <div className="section-head">
          <h1 className="section-title reveal">Your cart</h1>
        </div>
        <CartClient />
      </div>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Your cart',
  description: 'Review your Wildcats club shop order before checkout.',
  openGraph: mergeOpenGraph({
    title: 'Your cart',
    url: '/cart',
  }),
}
