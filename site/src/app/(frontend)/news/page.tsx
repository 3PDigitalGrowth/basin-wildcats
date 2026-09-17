import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      excerpt: true,
      publishedAt: true,
      heroImage: true,
    },
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

        {posts.totalPages > 1 && posts.page && (
          <div className="wrap">
            <Pagination page={posts.page} totalPages={posts.totalPages} />
          </div>
        )}
      </div>
    </>
  )
}

export function generateMetadata(): Metadata {
  const title = 'Club News'
  const description = 'Season updates, AGM papers and the odd bit of Wildcats history.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'The Basin Wildcats',
      url: '/news',
    },
  }
}
