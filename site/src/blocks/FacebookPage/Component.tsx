import React from 'react'

import type { FacebookPageBlock as Props, SiteSetting } from '@/payload-types'

import { getCachedGlobal } from '@/utilities/getGlobals'

/** Official Facebook Page Plugin. Needs no app, token or review. */
export const FacebookPageBlock: React.FC<Props> = async ({ title, pageUrl, height }) => {
  const settings = (await getCachedGlobal('site-settings', 0)()) as SiteSetting
  const url = pageUrl || settings?.facebookUrl
  if (!url) return null
  const h = height || 600
  const src = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(url)}&tabs=timeline&width=500&height=${h}&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`

  return (
    <section className="wrap">
      {title && (
        <h2 className="section-title reveal" style={{ marginBottom: 24 }}>
          {title}
        </h2>
      )}
      <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 32, alignItems: 'start' }}>
        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--white)', maxWidth: 520 }}>
          <iframe
            src={src}
            title="The Basin Wildcats on Facebook"
            width="100%"
            height={h}
            style={{ border: 0, overflow: 'hidden', display: 'block' }}
            scrolling="no"
            loading="lazy"
            allow="encrypted-media; web-share"
          />
        </div>
        <div className="prose-club">
          <p>
            Game reminders, selections, finals news and photos land on Facebook first. Follow the
            page so nothing slips past.
          </p>
          <p>
            <a className="btn btn-dark" href={url} target="_blank" rel="noopener" style={{ textDecoration: 'none', color: 'var(--cream)' }}>
              Open our Facebook page
            </a>
          </p>
          {settings?.facebookGroupUrl && (
            <p>
              Current members: the private members group is where team managers post fixtures and
              training changes.{' '}
              <a href={settings.facebookGroupUrl} target="_blank" rel="noopener">
                Request to join the members group
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
