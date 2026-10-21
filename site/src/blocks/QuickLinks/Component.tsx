import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import type { QuickLinksBlock as Props } from '@/payload-types'
import { hrefFromLink } from '@/utilities/hrefFromLink'

import { QuickLinkIcon } from './icons'

const shortDate = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat('en-AU', {
        day: 'numeric',
        month: 'short',
        timeZone: 'Australia/Melbourne',
      }).format(new Date(iso))
    : null

/**
 * The homepage "icons": one row of ticket stubs that gets families to the
 * things they come for (join, committee, news, shop, volunteering). A stub
 * set to show the latest news prints the newest headline instead of its
 * helper line, so the row stays current without anyone editing it.
 */
export const QuickLinksBlock: React.FC<Props> = async ({ title, items }) => {
  const list = (items || [])
    .map((item) => ({ ...item, href: hrefFromLink(item.link) }))
    .filter((item) => item.href)
  if (list.length === 0) return null

  let latest: { title: string; publishedAt?: string | null } | null = null
  if (list.some((item) => item.showLatestNews)) {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1,
      sort: '-publishedAt',
      overrideAccess: false,
      select: { title: true, publishedAt: true },
    })
    latest = result.docs[0] ?? null
  }

  return (
    <nav className="quick-links" aria-label={title || 'Club quick links'}>
      <div className="wrap">
        {title && <p className="quick-links-title reveal">{title}</p>}
        <ul className="quick-grid" style={{ '--n': list.length } as React.CSSProperties}>
          {list.map((item, i) => {
            const news = item.showLatestNews && latest
            return (
              <li key={item.id ?? i} className={`reveal${i % 3 ? ` reveal-d${i % 3}` : ''}`}>
                <Link
                  className="stub"
                  href={item.href!}
                  prefetch={false}
                  {...(item.link?.newTab ? { target: '_blank', rel: 'noopener' } : {})}
                >
                  <span className="stub-icon">
                    <span className="stub-disc">
                      <QuickLinkIcon name={item.icon} />
                    </span>
                  </span>
                  <span className="stub-body">
                    <span className="stub-label">{item.label}</span>
                    {news ? (
                      <span className="stub-helper">
                        {shortDate(latest!.publishedAt) && (
                          <span className="stub-date">{shortDate(latest!.publishedAt)}</span>
                        )}
                        {latest!.title}
                      </span>
                    ) : (
                      item.helper && <span className="stub-helper">{item.helper}</span>
                    )}
                    <svg
                      className="stub-arrow"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
