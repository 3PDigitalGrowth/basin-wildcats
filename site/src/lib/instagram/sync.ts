import type { Payload } from 'payload'

/**
 * Pulls the club's latest Instagram posts through ScrapeCreators (no Meta
 * Graph API, no client login) and mirrors them into the `instagram-posts`
 * collection, copying each cover image to Vercel Blob via the `media`
 * collection because Instagram's own CDN URLs expire.
 *
 * Docs: https://docs.scrapecreators.com (Instagram profile endpoint).
 * Verified live 18 Sep 2026 against @thebasin.wildcats. The response shape
 * mostly matches the brief, with two differences worth keeping fallbacks
 * for: there is no `edge_liked_by` on this endpoint (likes come from
 * `edge_media_preview_like.count` instead), and comment count is exposed
 * twice (`comment_count` and `edge_media_to_comment.count`, always equal).
 */

const SCRAPECREATORS_PROFILE_URL = 'https://api.scrapecreators.com/v1/instagram/profile'

// A real desktop UA. Instagram's CDN 403s the default Node/undici UA on
// some edges.
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

type InstagramMediaType = 'image' | 'video' | 'carousel'

interface ScrapeCreatorsCaptionNode {
  text?: string
}

interface ScrapeCreatorsNode {
  __typename?: string
  shortcode?: string | null
  display_url?: string | null
  thumbnail_src?: string | null
  taken_at_timestamp?: number
  edge_media_to_caption?: { edges?: { node?: ScrapeCreatorsCaptionNode }[] }
  edge_liked_by?: { count?: number }
  edge_media_preview_like?: { count?: number }
  edge_media_to_comment?: { count?: number }
  comment_count?: number
  [key: string]: unknown
}

interface ScrapeCreatorsProfileResponse {
  success?: boolean
  data?: {
    user?: {
      edge_owner_to_timeline_media?: {
        edges?: { node?: ScrapeCreatorsNode }[]
      }
    }
  }
}

export interface SyncInstagramOptions {
  payload: Payload
  handle: string
  limit?: number
}

export interface SyncInstagramResult {
  fetched: number
  created: number
  updated: number
  skipped: number
  errors: string[]
}

const mediaTypeFromTypename = (typename?: string | null): InstagramMediaType => {
  if (typename === 'XDTGraphVideo') return 'video'
  if (typename === 'XDTGraphSidecar') return 'carousel'
  return 'image'
}

export async function syncInstagram({
  payload,
  handle,
  limit = 12,
}: SyncInstagramOptions): Promise<SyncInstagramResult> {
  const result: SyncInstagramResult = {
    fetched: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  const apiKey = process.env.SCRAPECREATORS_API_KEY
  if (!apiKey) {
    result.errors.push('SCRAPECREATORS_API_KEY is not set')
    return result
  }

  let json: ScrapeCreatorsProfileResponse
  try {
    const profileRes = await fetch(
      `${SCRAPECREATORS_PROFILE_URL}?handle=${encodeURIComponent(handle)}&trim=true`,
      { headers: { 'x-api-key': apiKey } },
    )
    if (!profileRes.ok) {
      result.errors.push(
        `ScrapeCreators profile pull failed: ${profileRes.status} ${profileRes.statusText}`,
      )
      return result
    }
    json = (await profileRes.json()) as ScrapeCreatorsProfileResponse
  } catch (err) {
    result.errors.push(`ScrapeCreators profile pull threw: ${(err as Error).message}`)
    return result
  }

  const edges = json.data?.user?.edge_owner_to_timeline_media?.edges ?? []
  const nodes = edges
    .map((edge) => edge.node)
    .filter((node): node is ScrapeCreatorsNode => Boolean(node))
    .slice(0, limit)
  result.fetched = nodes.length

  for (const node of nodes) {
    const shortcode = node.shortcode
    if (!shortcode) {
      result.skipped += 1
      continue
    }

    try {
      const existing = await payload.find({
        collection: 'instagram-posts',
        where: { shortcode: { equals: shortcode } },
        limit: 1,
        depth: 0,
      })
      const existingDoc = existing.docs[0]

      // Skip if we already have this post cached with its image. Otherwise
      // (new post, or a doc that failed its image download last time) fall
      // through and (re)fetch it.
      if (existingDoc && existingDoc.image) {
        result.skipped += 1
        continue
      }

      const imageSourceUrl = node.display_url || node.thumbnail_src
      if (!imageSourceUrl) {
        result.errors.push(`${shortcode}: no display_url or thumbnail_src on the node`)
        result.skipped += 1
        continue
      }

      const imageRes = await fetch(imageSourceUrl, {
        headers: { 'User-Agent': BROWSER_USER_AGENT },
      })
      if (!imageRes.ok) {
        result.errors.push(`${shortcode}: image download failed (${imageRes.status})`)
        result.skipped += 1
        continue
      }
      const buffer = Buffer.from(await imageRes.arrayBuffer())
      const mimetype = imageRes.headers.get('content-type') || 'image/jpeg'

      const captionText = (node.edge_media_to_caption?.edges?.[0]?.node?.text || '').trim()
      const alt = captionText ? captionText.slice(0, 120) : 'Instagram post by The Basin Wildcats'

      const mediaDoc = await payload.create({
        collection: 'media',
        data: { alt },
        file: {
          data: buffer,
          name: `ig-${shortcode}.jpg`,
          mimetype,
          size: buffer.byteLength,
        },
      })

      const mediaType = mediaTypeFromTypename(node.__typename)
      const takenAt = node.taken_at_timestamp
        ? new Date(node.taken_at_timestamp * 1000).toISOString()
        : undefined
      const likeCount = node.edge_liked_by?.count ?? node.edge_media_preview_like?.count ?? undefined
      const commentCount = node.edge_media_to_comment?.count ?? node.comment_count ?? undefined

      const postData = {
        shortcode,
        permalink: `https://www.instagram.com/p/${shortcode}/`,
        caption: captionText,
        mediaType,
        takenAt,
        image: mediaDoc.id,
        likeCount,
        commentCount,
        raw: node as Record<string, unknown>,
      }

      if (existingDoc) {
        // Leave `hidden` alone: it is not in postData, so update() merges
        // over the existing doc without touching it.
        await payload.update({
          collection: 'instagram-posts',
          id: existingDoc.id,
          data: postData,
        })
        result.updated += 1
      } else {
        await payload.create({
          collection: 'instagram-posts',
          data: postData,
        })
        result.created += 1
      }
    } catch (err) {
      result.errors.push(`${shortcode}: ${(err as Error).message}`)
    }
  }

  return result
}
