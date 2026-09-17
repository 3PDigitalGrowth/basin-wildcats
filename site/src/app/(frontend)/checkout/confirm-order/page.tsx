import type { Metadata } from 'next'

import React, { Suspense } from 'react'

import { ConfirmOrderClient } from './ConfirmOrderClient'

export const dynamic = 'force-dynamic'

export default function ConfirmOrderPage() {
  return (
    <article className="wrap">
      <Suspense fallback={<p style={{ padding: '40px 0' }}>Confirming your order...</p>}>
        <ConfirmOrderClient />
      </Suspense>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Confirming your order',
  robots: { index: false },
}
