import type { Payload } from 'payload'

/**
 * Pulls the club's latest Instagram posts through ScrapeCreators (no Meta
 * Graph API, no client login) and mirrors them into the `instagram-posts`
 * collection, copying each cover image to Vercel Blob via the `media`
 * collection because Instagram's own CDN URLs expire. Reels also get their
 * MP4 copied (a few per run, to stay inside the cron's time limit) so the
 * homepage film reel can play them.
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
  video_url?: string | null
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
  /** Reel videos to copy per run. Each is a few MB, so the cron keeps this low. */
  maxVideos?: number
}

// Reels run 15 to 60 seconds; anything past this is not a weekly reel.
const MAX_VIDEO_BYTES = 40 * 1024 * 1024

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

async function copyVideo(
  payload: Payload,
  shortcode: string,
  url: string,
  alt: string,
): Promise<number> {
  const res = await fetch(url, { headers: { 'User-Agent': BROWSER_USER_AGENT } })
  if (!res.ok) throw new Error(`video download failed (${res.status})`)
  const declared = Number(res.headers.get('content-length') || 0)
  if (declared > MAX_VIDEO_BYTES) throw new Error(`video too large (${declared} bytes)`)
  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.byteLength > MAX_VIDEO_BYTES) throw new Error(`video too large (${buffer.byteLength} bytes)`)

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data: buffer,
      name: `wildcats-social-${shortcode}.mp4`,
      mimetype: 'video/mp4',
      size: buffer.byteLength,
    },
  })
  return doc.id
}

export async function syncInstagram({
  payload,
  handle,
  limit = 12,
  maxVideos = 2,
}: SyncInstagramOptions): Promise<SyncInstagramResult> {
  let videosCopied = 0
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
        depth: 1,
      })
      const existingDoc = existing.docs[0]
      const existingImage =
        existingDoc?.image && typeof existingDoc.image === 'object' ? existingDoc.image : null
      const existingVideo =
        existingDoc?.video && typeof existingDoc.video === 'object' ? existingDoc.video : null
      const mediaType = mediaTypeFromTypename(node.__typename)

      // Files saved under the old "ig-" prefix are replaced: that prefix
      // trips some ad blockers, so the tiles rendered as blanks.
      const needsImage = !existingImage || Boolean(existingImage.filename?.startsWith('ig-'))
      const videoSourceUrl = mediaType === 'video' ? node.video_url : null
      const needsVideo = Boolean(videoSourceUrl) && !existingVideo && videosCopied < maxVideos

      if (existingDoc && !needsImage && !needsVideo) {
        result.skipped += 1
        continue
      }
      const staleMediaId = needsImage ? existingImage?.id : undefined

      const captionText = (node.edge_media_to_caption?.edges?.[0]?.node?.text || '').trim()
      const alt = captionText ? captionText.slice(0, 120) : 'Instagram post by The Basin Wildcats'

      let imageId = existingImage?.id
      if (needsImage) {
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

        const mediaDoc = await payload.create({
          collection: 'media',
          data: { alt },
          file: {
            data: buffer,
            name: `wildcats-social-${shortcode}.jpg`,
            mimetype,
            size: buffer.byteLength,
          },
        })
        imageId = mediaDoc.id
      }

      // A failed video copy is not fatal: the post still shows as a cover
      // image, and the next run tries the video again.
      let videoId: number | undefined
      if (needsVideo && videoSourceUrl) {
        videosCopied += 1
        try {
          videoId = await copyVideo(payload, shortcode, videoSourceUrl, alt)
        } catch (err) {
          result.errors.push(`${shortcode}: ${(err as Error).message}`)
        }
      }

      if (existingDoc && !needsImage && !videoId) {
        result.skipped += 1
        continue
      }

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
        image: imageId,
        ...(videoId ? { video: videoId } : {}),
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
        if (staleMediaId) {
          try {
            await payload.delete({ collection: 'media', id: staleMediaId })
          } catch {
            // The old file is orphaned but harmless; the post already points at the new one.
          }
        }
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
