import React from 'react'

import { ShopProvider } from '@/providers/ShopProvider'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ShopProvider>{children}</ShopProvider>
}
