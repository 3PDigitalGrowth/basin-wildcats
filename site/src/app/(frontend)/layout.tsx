import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Barlow } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { RevealInit } from '@/components/RevealInit'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const body = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(body.variable)} lang="en-AU" suppressHydrationWarning>
      <head>
        <link href="/logo.png" rel="icon" type="image/png" />
        <link href="/logo.png" rel="apple-touch-icon" />
        {/* Big Shoulders Display is not in next/font's catalogue under this name; load it directly. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <div className="frame">
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </div>
          <RevealInit />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'The Basin Wildcats Basketball Club',
    template: '%s | The Basin Wildcats',
  },
  description:
    'The Basin Wildcats are a family basketball club in the Knox competition with more than 70 teams across all ages. Founded 1975. New players welcome every season.',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
