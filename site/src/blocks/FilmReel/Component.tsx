import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { FilmReelBlock as Props, Media, SiteSetting } from '@/payload-types'

import { Img } from '@/components/Img'
import { getCachedGlobal } from '@/utilities/getGlobals'

import { ReelController } from './ReelController'

type Frame =
  | { kind: 'photo'; key: string; image: Media; caption: string }
  | {
      kind: 'reel'
      key: string
      image: Media
      video: Media
      label: string
      date: string | null
      permalink: string
    }

/** "18 OCT 26": the date stamp printed along the film edge. */
const edgeDate = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat('en-AU', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
        timeZone: 'Australia/Melbourne',
      })
        .format(new Date(iso))
        .toUpperCase()
    : null

/**
 * Short name for a reel from the first line of its caption, e.g.
 * "Wildcats Rewind – Round 3 | Summer 26/27" becomes "Rewind: Round 3".
 */
const reelLabel = (caption?: string | null) => {
  const firstLine = (caption || '')
    .split('\n')[0]
    .replace(/[^\p{L}\p{N}\s|/&,.'–-]/gu, '')
    .trim()
  const rewind = firstLine.match(/rewind\s*[–-]?\s*([^|]+)/i)
  if (rewind) return `Rewind: ${rewind[1].trim()}`
  return firstLine ? firstLine.slice(0, 40) : 'Wildcats reel'
}

/**
 * "Game day moments" as a strip of 35mm film: club photos with the latest
 * Instagram reels spliced in between, running slowly across the page. Reels
 * play in a lightbox from our own copy of the video (see the Instagram sync).
 */
export const FilmReelBlock: React.FC<Props> = async ({
  title,
  titleHollow,
  kicker,
  includeReels,
  reelCount,
  frames,
}) => {
  const photos: Frame[] = (frames || []).flatMap((f, i) =>
    f.image && typeof f.image === 'object' && f.image.url
      ? [{ kind: 'photo' as const, key: `p${f.id ?? i}`, image: f.image, caption: f.caption }]
      : [],
  )

  let reels: Frame[] = []
  let handle = 'thebasin.wildcats'
  if (includeReels !== false) {
    const payload = await getPayload({ config: configPromise })
    const [result, settings] = await Promise.all([
      payload.find({
        collection: 'instagram-posts',
        depth: 1,
        limit: reelCount || 6,
        sort: '-takenAt',
        where: {
          hidden: { not_equals: true },
          mediaType: { equals: 'video' },
          video: { exists: true },
        },
      }),
      getCachedGlobal('site-settings', 0)() as Promise<SiteSetting>,
    ])
    handle = settings?.instagramHandle || handle
    reels = result.docs.flatMap((post) =>
      post.image && typeof post.image === 'object' && post.video && typeof post.video === 'object'
        ? [
            {
              kind: 'reel' as const,
              key: `r${post.id}`,
              image: post.image,
              video: post.video,
              label: reelLabel(post.caption),
              date: edgeDate(post.takenAt),
              permalink: post.permalink,
            },
          ]
        : [],
    )
  }

  // Newest reel first, then two photos between each reel.
  const mixed: Frame[] = []
  let r = 0
  let p = 0
  while (r < reels.length || p < photos.length) {
    if (r < reels.length) mixed.push(reels[r++])
    for (let k = 0; k < 2 && p < photos.length; k++) mixed.push(photos[p++])
  }
  if (mixed.length === 0) return null

  // Enough frames to cover a wide screen twice over: run it as a loop.
  const animate = mixed.length >= 6

  const renderFrame = (f: Frame, i: number, dup: boolean) => (
    <li className="reel-frame" key={`${dup ? 'dup' : 'one'}-${f.key}`} {...(dup ? { inert: true, 'data-dup': '' } : {})}>
      <div className="reel-shot">
        <Img
          media={f.image}
          alt={f.kind === 'photo' ? f.image.alt || f.caption : ''}
          sizes="(max-width: 820px) 240px, 312px"
          fallbackWidth={600}
          fallbackHeight={480}
        />
        {f.kind === 'reel' && (
          <button
            type="button"
            className="reel-play"
            data-reel-video={f.video.url ?? ''}
            data-reel-poster={f.image.url ?? ''}
            data-reel-label={f.label}
            data-reel-link={f.permalink}
            aria-label={`Play ${f.label}, ${f.date ?? 'video'}`}
          >
            <span className="reel-chip">{f.label}</span>
            <span className="reel-play-dot" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" focusable="false">
                <path d="M8 5.5v13l10.5-6.5z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <p className="reel-edge" aria-hidden="true">
        <span className="reel-num">{i + 1}A</span>
        {f.kind === 'reel' ? [f.label, f.date].filter(Boolean).join(' · ') : f.caption}
      </p>
    </li>
  )

  return (
    <section className="reel-section" id="gallery">
      <div className="wrap">
        <div className="section-head">
          <h2 className="section-title reveal">
            {title} {titleHollow && <em>{titleHollow}</em>}
          </h2>
          {kicker && <p className="section-kicker reveal reveal-d1">{kicker}</p>}
        </div>
      </div>
      <ReelController
        animate={animate}
        instagramUrl={reels.length > 0 ? `https://www.instagram.com/${handle}/reels/` : null}
      >
        <div
          className={`reel${animate ? ' is-looping' : ''}`}
          style={{ '--reel-duration': `${mixed.length * 7}s` } as React.CSSProperties}
        >
          <ul className="reel-track">
            {mixed.map((f, i) => renderFrame(f, i, false))}
            {animate && mixed.map((f, i) => renderFrame(f, i, true))}
          </ul>
        </div>
      </ReelController>
    </section>
  )
}
