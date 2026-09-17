'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

import type { Header as HeaderType, SiteSetting } from '@/payload-types'
import { hrefFromLink } from '@/utilities/hrefFromLink'
import { CartLink } from '@/components/CartButton/CartLink'

type Props = {
  data: HeaderType
  settings: SiteSetting
}

export const HeaderClient: React.FC<Props> = ({ data, settings }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  const navItems = data?.navItems || []
  const cta = data?.cta?.link
  const ctaHref = cta ? hrefFromLink(cta) : null
  const announcement = settings?.announcement
  const showAnnounce = Boolean(announcement?.enabled && announcement?.text)

  const isActive = (href: string | null) => {
    if (!href || href === '#') return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="top-shell">
      {showAnnounce && (
        <div className="announce" role="status">
          {announcement?.text}
          {announcement?.linkUrl && announcement?.linkLabel && (
            <Link href={announcement.linkUrl}>{announcement.linkLabel}</Link>
          )}
        </div>
      )}
      <div className={`top-card${showAnnounce ? ' has-announce' : ''}`}>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Wildcats The Basin, home page">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-96.png" alt="" width={46} height={46} />
            <span className="brand-name">
              Wildcats<span>The Basin</span>
            </span>
          </Link>

          <nav aria-label="Main navigation">
            <ul className="nav-pill">
              {navItems.map((item, i) => {
                const href = hrefFromLink(item.link)
                const children = item.children || []
                const hasChildren = children.length > 0
                const active =
                  isActive(href) || children.some((c) => isActive(hrefFromLink(c.link)))
                return (
                  <li key={i}>
                    <Link
                      href={href || '#'}
                      className={active ? 'is-active' : undefined}
                      aria-haspopup={hasChildren ? 'true' : undefined}
                      {...(item.link?.newTab ? { target: '_blank', rel: 'noopener' } : {})}
                    >
                      {item.link?.label}
                      {hasChildren && (
                        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                          <path
                            d="M1 3.5 5 7.5 9 3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                        </svg>
                      )}
                    </Link>
                    {hasChildren && (
                      <div className="nav-drop">
                        {children.map((child, j) => (
                          <Link key={j} href={hrefFromLink(child.link) || '#'}>
                            {child.link?.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CartLink />

            <button
              className="nav-toggle"
              aria-expanded={open}
              aria-controls="mobileNav"
              onClick={() => setOpen((v) => !v)}
              type="button"
            >
              {open ? 'Close' : 'Menu'}
            </button>

            {ctaHref && (
              <Link className="btn btn-red header-cta" href={ctaHref}>
                {cta?.label}
              </Link>
            )}
          </div>
        </header>

        <nav
          className={`mobile-nav${open ? ' is-open' : ''}`}
          id="mobileNav"
          aria-label="Mobile navigation"
          onClick={close}
        >
          {navItems.map((item, i) => (
            <React.Fragment key={i}>
              <Link href={hrefFromLink(item.link) || '#'}>{item.link?.label}</Link>
              {(item.children || []).map((child, j) => (
                <Link className="sub" key={j} href={hrefFromLink(child.link) || '#'}>
                  {child.link?.label}
                </Link>
              ))}
            </React.Fragment>
          ))}
          {ctaHref && (
            <Link className="btn btn-red" href={ctaHref}>
              {cta?.label}
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}
