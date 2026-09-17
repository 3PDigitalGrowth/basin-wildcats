import type { Metadata } from 'next'

import React from 'react'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { CheckoutClient } from './CheckoutClient'

export default function CheckoutPage() {
  return (
    <article className="section-tight">
      <div className="wrap">
        <div className="section-head">
          <h1 className="section-title reveal">Checkout</h1>
        </div>
        <CheckoutClient />
      </div>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Wildcats club shop order. Collected at training, no shipping.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout',
  }),
}
