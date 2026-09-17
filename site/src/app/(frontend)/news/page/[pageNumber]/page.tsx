import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
  })

  return (
    <>
      <PageClient />

      <div className="hero-shell">
        <section className="hero-card joined">
          <div className="page-hero no-media">
            <div>
              <p className="hero-eyebrow reveal">Club news</p>
              <h1 className="page-hero-title reveal reveal-d1">
                Wildcats <span className="accent">News</span>
              </h1>
              <p className="page-hero-sub reveal reveal-d2">
                Season updates, AGM papers and the odd bit of Wildcats history.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="section-tight">
        <div className="wrap">
          <PageRange
            collection="posts"
            currentPage={posts.page}
            limit={12}
            totalDocs={posts.totalDocs}
          />
        </div>

        <CollectionArchive posts={posts.docs} />

        {posts?.page && posts?.totalPages > 1 && (
          <div className="wrap">
            <Pagination page={posts.page} totalPages={posts.totalPages} />
          </div>
        )}
      </div>
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  const title = `Club News – Page ${pageNumber || ''}`
  return {
    title,
    openGraph: {
      title,
      siteName: 'The Basin Wildcats',
      url: `/news/page/${pageNumber || ''}`,
    },
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 12)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
