import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <HeaderThemeProvider>
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
      </EcommerceProvider>
    </HeaderThemeProvider>
  )
}
