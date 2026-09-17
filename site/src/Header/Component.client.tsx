'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import type { Header as HeaderType, Media, SiteSetting } from '@/payload-types'
import { CartLink } from '@/components/CartButton/CartLink'
import { Img } from '@/components/Img'
import { hrefFromLink } from '@/utilities/hrefFromLink'

type Props = {
  data: HeaderType
  settings: SiteSetting
}

type NavItem = NonNullable<HeaderType['navItems']>[number]

const asMedia = (m: unknown): Media | null => (m && typeof m === 'object' ? (m as Media) : null)

/**
 * Site header. Top-level items with children open a mega menu (intro column
 * plus a grid of cards with a graphic and helper text); items without children
 * are plain links. On phones the same structure becomes an accordion.
 */
export const HeaderClient: React.FC<Props> = ({ data, settings }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [openPanel, setOpenPanel] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState<number | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<number | null>(null)

  const close = () => {
    setOpen(false)
    setOpenPanel(null)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpenPanel(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])

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

  const show = (i: number) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setOpenPanel(i)
  }
  const hideSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpenPanel(null), 160)
  }

  const renderPanel = (item: NavItem, i: number) => {
    const children = item.children || []
    const panelImage = asMedia(item.panel?.image)
    const sectionHref = hrefFromLink(item.link)
    return (
      <div
        className={`mega${openPanel === i ? ' is-open' : ''}`}
        id={`mega-${i}`}
        onMouseEnter={() => show(i)}
        onMouseLeave={hideSoon}
      >
        <div className="mega-inner">
          <div className="mega-intro">
            {panelImage && (
              <div className="mega-intro-img">
                <Img media={panelImage} sizes="320px" alt="" />
              </div>
            )}
            <p className="mega-intro-title">{item.link?.label}</p>
            {item.panel?.blurb && <p className="mega-intro-blurb">{item.panel.blurb}</p>}
            {sectionHref && sectionHref !== '#' && (
              <Link prefetch={false} className="mega-intro-link" href={sectionHref} onClick={close}>
                Open {item.link?.label}
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            )}
          </div>
          <ul className="mega-grid">
            {children.map((child, j) => {
              const href = hrefFromLink(child.link) || '#'
              const img = asMedia(child.image)
              return (
                <li key={j}>
                  <Link
                    prefetch={false}
                    href={href}
                    className={`mega-card${isActive(href) ? ' is-active' : ''}`}
                    onClick={close}
                  >
                    <span className="mega-card-img" aria-hidden="true">
                      {img ? <Img media={img} sizes="72px" alt="" /> : <span className="mega-card-dot" />}
                    </span>
                    <span className="mega-card-text">
                      <span className="mega-card-label">{child.link?.label}</span>
                      {child.description && (
                        <span className="mega-card-desc">{child.description}</span>
                      )}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="top-shell">
      {showAnnounce && (
        <div className="announce" role="status">
          {announcement?.text}
          {announcement?.linkUrl && announcement?.linkLabel && (
            <Link prefetch={false} href={announcement.linkUrl}>
              {announcement.linkLabel}
            </Link>
          )}
        </div>
      )}
      <div className={`top-card${showAnnounce ? ' has-announce' : ''}`}>
        <header className="site-header" ref={headerRef}>
          <Link
            prefetch={false}
            className="brand"
            href="/"
            aria-label="Wildcats The Basin, home page"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-96.png" alt="" width={46} height={46} />
            <span className="brand-name">
              Wildcats<span>The Basin</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="nav-main">
            <ul className="nav-pill">
              {navItems.map((item, i) => {
                const href = hrefFromLink(item.link)
                const children = item.children || []
                const hasChildren = children.length > 0
                const active =
                  isActive(href) || children.some((c) => isActive(hrefFromLink(c.link)))
                return (
                  <li
                    key={i}
                    onMouseEnter={hasChildren ? () => show(i) : undefined}
                    onMouseLeave={hasChildren ? hideSoon : undefined}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        className={active ? 'is-active' : undefined}
                        aria-expanded={openPanel === i}
                        aria-controls={`mega-${i}`}
                        onClick={() => setOpenPanel(openPanel === i ? null : i)}
                        onFocus={() => show(i)}
                      >
                        {item.link?.label}
                        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                          <path
                            d="M1 3.5 5 7.5 9 3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          />
                        </svg>
                      </button>
                    ) : (
                      <Link
                        prefetch={false}
                        href={href || '#'}
                        className={active ? 'is-active' : undefined}
                        {...(item.link?.newTab ? { target: '_blank', rel: 'noopener' } : {})}
                      >
                        {item.link?.label}
                      </Link>
                    )}
                    {hasChildren && renderPanel(item, i)}
                  </li>
                )
              })}
            </ul>
          </nav>

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
            <Link prefetch={false} className="btn btn-red header-cta" href={ctaHref}>
              {cta?.label}
            </Link>
          )}
        </header>

        <nav
          className={`mobile-nav${open ? ' is-open' : ''}`}
          id="mobileNav"
          aria-label="Mobile navigation"
        >
          {navItems.map((item, i) => {
            const children = item.children || []
            const href = hrefFromLink(item.link) || '#'
            if (children.length === 0) {
              return (
                <Link prefetch={false} key={i} href={href} onClick={close}>
                  {item.link?.label}
                </Link>
              )
            }
            const expanded = mobileOpen === i
            return (
              <div className="mobile-group" key={i}>
                <button
                  type="button"
                  className="mobile-group-btn"
                  aria-expanded={expanded}
                  onClick={() => setMobileOpen(expanded ? null : i)}
                >
                  {item.link?.label}
                  <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden="true">
                    <path d="M1 3.5 5 7.5 9 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </button>
                {expanded && (
                  <div className="mobile-group-list">
                    {children.map((child, j) => (
                      <Link
                        prefetch={false}
                        className="sub"
                        key={j}
                        href={hrefFromLink(child.link) || '#'}
                        onClick={close}
                      >
                        <span>{child.link?.label}</span>
                        {child.description && <small>{child.description}</small>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {ctaHref && (
            <Link prefetch={false} className="btn btn-red" href={ctaHref} onClick={close}>
              {cta?.label}
            </Link>
          )}
        </nav>
      </div>
    </div>
  )
}
