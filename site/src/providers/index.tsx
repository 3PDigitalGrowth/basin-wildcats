import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'

/**
 * Site-wide providers. The shop's ecommerce context lives in
 * `ShopProvider` and wraps only the shop, cart and checkout routes.
 */
export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return <HeaderThemeProvider>{children}</HeaderThemeProvider>
}
