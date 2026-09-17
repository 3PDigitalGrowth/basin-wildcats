import Link from 'next/link'
import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Footer as FooterType, SiteSetting } from '@/payload-types'
import { hrefFromLink } from '@/utilities/hrefFromLink'

const Instagram = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
  </svg>
)
const Facebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.6v7h2.9z" />
  </svg>
)
const YouTube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
  </svg>
)

export async function Footer() {
  const [footerData, settings] = await Promise.all([
    getCachedGlobal('footer', 1)() as Promise<FooterType>,
    getCachedGlobal('site-settings', 0)() as Promise<SiteSetting>,
  ])

  const columns = footerData?.columns || []
  const year = new Date().getFullYear()
  const cols = columns.length === 2 ? 'cols-3' : ''

  return (
    <div className="footer-shell">
      <footer className="site-footer">
        <div className="wrap">
          <div className={`footer-grid ${cols}`}>
            <div className="footer-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="The Basin Wildcats logo" width={74} height={74} />
              <p>
                {footerData?.blurb ||
                  'The Basin Wildcats Basketball Club. A family club in the Knox competition since 1975, playing winter and summer from our home base at The Basin Primary School.'}
              </p>
              <div className="footer-social">
                {settings?.instagramHandle && (
                  <a
                    href={`https://www.instagram.com/${settings.instagramHandle}/`}
                    target="_blank"
                    rel="noopener"
                    aria-label="Wildcats on Instagram"
                  >
                    <Instagram />
                  </a>
                )}
                {settings?.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener"
                    aria-label="Wildcats on Facebook"
                  >
                    <Facebook />
                  </a>
                )}
                {settings?.youtubeUrl && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener"
                    aria-label="Wildcats on YouTube"
                  >
                    <YouTube />
                  </a>
                )}
              </div>
            </div>
            {columns.map((col, i) => (
              <div className="footer-col" key={i}>
                <h2>{col.heading}</h2>
                <ul>
                  {(col.navItems || []).map((item, j) => {
                    const href = hrefFromLink(item.link)
                    if (!href) return null
                    return (
                      <li key={j}>
                        <Link
                          href={href}
                          {...(item.link?.newTab ? { target: '_blank', rel: 'noopener' } : {})}
                        >
                          {item.link?.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <span>
              &copy; {year} {settings?.clubName || 'The Basin Wildcats Basketball Club'}
            </span>
            <span>
              <a href="https://www.3pdigital.com.au" target="_blank" rel="noopener">
                Proudly supported by 3P Digital
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
