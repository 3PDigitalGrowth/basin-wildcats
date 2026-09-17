import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { Card, type CardPostData } from '@/components/Card'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const results = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  const hasResults = results.docs.length > 0

  return (
    <>
      <PageClient />

      <div className="hero-shell">
        <section className="hero-card joined">
          <div className="page-hero no-media">
            <div>
              <p className="hero-eyebrow reveal">Find it</p>
              <h1 className="page-hero-title reveal reveal-d1">
                Search <span className="accent">Wildcats</span>
              </h1>
              <p className="page-hero-sub reveal reveal-d2">
                Look up news, pages and everything else on the club site.
              </p>
              <div className="page-hero-search reveal reveal-d3">
                <Search />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="section-tight">
        {query && (
          <div className="wrap">
            <p className="search-summary">
              {hasResults
                ? `${results.totalDocs} result${results.totalDocs === 1 ? '' : 's'} for "${query}"`
                : `No results for "${query}".`}
            </p>
          </div>
        )}

        {hasResults ? (
          <div className="wrap">
            <div className="news-grid">
              {results.docs.map((result, index) => {
                if (typeof result !== 'object' || result === null) return null
                const relationTo = result.doc?.relationTo === 'pages' ? 'pages' : 'posts'
                return (
                  <Card key={index} doc={result as CardPostData} relationTo={relationTo} />
                )
              })}
            </div>
          </div>
        ) : (
          <div className="wrap">
            <div className="news-empty">
              <p>
                {query
                  ? 'Try a different search term, or browse the club news.'
                  : 'Start typing to search the site.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Search',
    openGraph: {
      title: 'Search',
      siteName: 'The Basin Wildcats',
      url: '/search',
    },
  }
}
