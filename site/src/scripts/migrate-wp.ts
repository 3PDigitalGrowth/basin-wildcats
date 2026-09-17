/**
 * Basin Wildcats WordPress -> Payload migration.
 *
 * Idempotent: safe to re-run. Upserts documents by sourceUrl, media by filename,
 * pages/posts by slug, categories by title, redirects by from (skip if exists).
 *
 * Run from `site/`:
 *   pnpm payload run src/scripts/migrate-wp.ts
 *
 * Source data: ../content/wp-export/{pages,posts,media}.json (WordPress REST export).
 * products.json is out of scope here (owned by another agent).
 */
import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'
import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'
import {
  convertHTMLToLexical,
  lexicalEditor,
  HeadingFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
} from '@payloadcms/richtext-lexical'

// ---------------------------------------------------------------------------
// Setup + small utilities
// ---------------------------------------------------------------------------

const WP_EXPORT_DIR = path.resolve(process.cwd(), '..', 'content', 'wp-export')
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const counts = {
  documentsCreated: 0,
  documentsSkipped: 0,
  documentsFailed: [] as string[],
  mediaCreated: 0,
  mediaSkipped: 0,
  mediaFailed: [] as string[],
  pagesCreated: 0,
  pagesUpdated: 0,
  postsCreated: 0,
  postsUpdated: 0,
  categoriesCreated: 0,
  categoriesSkipped: 0,
  redirectsCreated: 0,
  redirectsSkipped: 0,
}

const droppedPages: string[] = []
const notes: string[] = []

function log(msg: string) {
  // eslint-disable-next-line no-console
  console.log(`[migrate-wp] ${msg}`)
}

function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .trim()
}

async function fetchBuffer(url: string): Promise<{ data: Buffer; mimetype: string }> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      const arrayBuffer = await res.arrayBuffer()
      const mimetype = res.headers.get('content-type')?.split(';')[0]?.trim() || 'application/octet-stream'
      return { data: Buffer.from(arrayBuffer), mimetype }
    } catch (err) {
      lastErr = err
      if (attempt < 3) await new Promise((r) => setTimeout(r, 750 * attempt))
    }
  }
  throw lastErr
}

function monthYear(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-AU', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

function isBefore2024(iso: string): boolean {
  return new Date(iso).getTime() < new Date('2024-01-01T00:00:00Z').getTime()
}

// ---------------------------------------------------------------------------
// WordPress export loading
// ---------------------------------------------------------------------------

type WPRendered = { rendered: string }
type WPPage = {
  id: number
  modified: string
  link: string
  title: WPRendered
  content: WPRendered
  parent: number
}
type WPPost = {
  id: number
  date: string
  link: string
  title: WPRendered
  content: WPRendered
  featured_media: number
}
type WPMedia = {
  id: number
  title: WPRendered
  mime_type: string
  source_url: string
}

const pagesRaw: WPPage[] = JSON.parse(fs.readFileSync(path.join(WP_EXPORT_DIR, 'pages.json'), 'utf8'))
const postsRaw: WPPost[] = JSON.parse(fs.readFileSync(path.join(WP_EXPORT_DIR, 'posts.json'), 'utf8'))
const mediaRaw: WPMedia[] = JSON.parse(fs.readFileSync(path.join(WP_EXPORT_DIR, 'media.json'), 'utf8'))

const pagesById = new Map<number, WPPage>(pagesRaw.map((p) => [p.id, p]))
const mediaById = new Map<number, WPMedia>(mediaRaw.map((m) => [m.id, m]))

function pageHtml(id: number): string {
  const p = pagesById.get(id)
  if (!p) throw new Error(`Missing WP page id ${id} in export`)
  return p.content.rendered
}
function pageTitle(id: number): string {
  const p = pagesById.get(id)
  if (!p) throw new Error(`Missing WP page id ${id} in export`)
  return decodeEntities(p.title.rendered)
}
function pageModified(id: number): string {
  const p = pagesById.get(id)
  if (!p) throw new Error(`Missing WP page id ${id} in export`)
  return p.modified
}

// ---------------------------------------------------------------------------
// Lexical conversion
// ---------------------------------------------------------------------------

const migrationLexical = lexicalEditor({
  features: ({ rootFeatures }) => [
    ...rootFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})

let cachedEditorConfig: Awaited<ReturnType<typeof migrationLexical>>['editorConfig'] | undefined

async function getEditorConfig(payload: Payload) {
  if (!cachedEditorConfig) {
    const resolved = await migrationLexical({
      config: payload.config,
      isRoot: false,
      parentIsLocalized: false,
    })
    cachedEditorConfig = resolved.editorConfig
  }
  return cachedEditorConfig
}

async function htmlToLexical(payload: Payload, html: string) {
  const editorConfig = await getEditorConfig(payload)
  return convertHTMLToLexical({ editorConfig, html, JSDOM })
}

function plainParagraph(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// ---------------------------------------------------------------------------
// HTML cleaning + link rewriting
// ---------------------------------------------------------------------------

function normalizeOldPath(href: string): string | null {
  try {
    const h = href.trim()
    if (!h || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('#')) return null
    let pathname: string
    if (/^https?:\/\//i.test(h)) {
      const u = new URL(h)
      const host = u.hostname.replace(/^www\./i, '').toLowerCase()
      if (host !== 'basinwildcats.com') return null
      pathname = u.pathname
    } else if (h.startsWith('/wordpress')) {
      pathname = h.split('?')[0].split('#')[0]
    } else {
      return null
    }
    let p = pathname.replace(/^\/wordpress/i, '')
    if (!p.startsWith('/')) p = '/' + p
    p = p.replace(/\/+$/, '')
    if (p === '') p = '/'
    return p.toLowerCase()
  } catch {
    return null
  }
}

function mapLink(href: string, linkMap: Map<string, string>): string {
  const norm = normalizeOldPath(href)
  if (norm && linkMap.has(norm)) return linkMap.get(norm)!
  return href
}

/** Cleans raw WordPress HTML for conversion: strips shortcodes, media tags, empty
 * paragraphs and inline styles, unwraps lists into bullet paragraphs (no list
 * feature is enabled on this project's Content block), and rewrites internal
 * links via the supplied map. */
function cleanHtml(html: string, linkMap: Map<string, string>): string {
  let out = html
  // WordPress / WPBakery / Divi shortcodes, e.g. [vc_row ...] [/vc_row]
  out = out.replace(/\[\/?[a-zA-Z][a-zA-Z0-9_]*(?:\s+[^[\]]*)?\]/g, '')
  // Embeds we don't carry across (maps, YouTube, etc.)
  out = out.replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
  // Images / figures reference old WordPress asset URLs; not carried in body copy
  out = out.replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '')
  out = out.replace(/<img[^>]*>/gi, '')
  // Inline styles and WP block ids
  out = out.replace(/\sstyle="[^"]*"/gi, '')
  out = out.replace(/\sid="wp-block-file[^"]*"/gi, '')
  // Lists are kept: the editor has list features, so <ul>/<ol>/<li> convert natively.
  // Empty paragraphs
  out = out.replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
  // Internal link rewriting
  out = out.replace(/href="([^"]+)"/gi, (_m, href: string) => `href="${mapLink(href, linkMap)}"`)
  out = out.replace(/href='([^']+)'/gi, (_m, href: string) => `href="${mapLink(href, linkMap)}"`)
  out = out.replace(/\n{3,}/g, '\n\n')
  return out.trim()
}

// ---------------------------------------------------------------------------
// Document catalogue (60 PDF/Word + Book4.xlsx, all 62 non-image media items)
// Titles cleaned by hand; category + season + superseded per the client
// feedback plan section 3.4/4. Higher WP media id = uploaded later = current
// version where a document exists in several generations.
// ---------------------------------------------------------------------------

type DocCategory =
  | 'policies'
  | 'codes-of-conduct'
  | 'coaching'
  | 'team-managers'
  | 'players'
  | 'club-papers'
  | 'certificates'
  | 'forms'
  | 'other'

type DocDef = {
  id: number
  title: string
  category: DocCategory
  season?: string
  superseded?: boolean
  description?: string
}

const DOCS_MAP: DocDef[] = [
  // Coaching resources (OneClub set, single versions)
  { id: 20280, title: 'Wildcats Terminology', category: 'coaching' },
  { id: 20279, title: 'Practice Plan Template', category: 'coaching' },
  { id: 20278, title: 'OneClub Part 3: Coaches Centre', category: 'coaching' },
  { id: 20277, title: 'OneClub Part 2: Philosophy', category: 'coaching' },
  { id: 20276, title: 'OneClub Part 1: Values', category: 'coaching' },
  { id: 20275, title: 'Half Court Spots', category: 'coaching' },
  { id: 20274, title: 'Drill Library 2', category: 'coaching' },
  { id: 20273, title: 'Drill Library 1', category: 'coaching' },
  // Coaching resources with several versions: newest current, rest superseded
  { id: 2610, title: 'Introduction to Basketball Coaching Handbook', category: 'coaching' },
  { id: 2596, title: 'Introduction to Basketball Coaching Handbook', category: 'coaching', superseded: true },
  { id: 1766, title: 'Introduction to Basketball Coaching Handbook', category: 'coaching', superseded: true },
  { id: 2607, title: "Basketball Skills Charts (KPI's)", category: 'coaching' },
  { id: 2594, title: "Basketball Skills Charts (KPI's)", category: 'coaching', superseded: true },
  { id: 1764, title: "Basketball Skills Charts (KPI's)", category: 'coaching', superseded: true },
  { id: 2603, title: 'Coaches Survival Kit', category: 'coaching' },
  { id: 2595, title: 'Coaches Survival Kit', category: 'coaching', superseded: true },
  { id: 1771, title: 'Coaches Survival Kit', category: 'coaching', superseded: true },
  { id: 1765, title: 'Coaches Survival Kit', category: 'coaching', superseded: true },

  // Club papers and AGM
  { id: 20189, title: 'AGM 2021 Minutes', category: 'club-papers', season: 'AGM 2021' },
  { id: 20112, title: "President's Report AGM 2021", category: 'club-papers', season: 'AGM 2021' },
  { id: 20111, title: 'Boys Report AGM 2021', category: 'club-papers', season: 'AGM 2021' },
  { id: 20109, title: 'Girls Report AGM 2021', category: 'club-papers', season: 'AGM 2021' },
  { id: 20105, title: 'AGM 2020 Minutes', category: 'club-papers', season: 'AGM 2020' },
  { id: 20101, title: 'AGM Report 2021', category: 'club-papers', season: 'AGM 2021' },
  {
    id: 20100,
    title: "Treasurer's Report Summary AGM 2021",
    category: 'club-papers',
    season: 'AGM 2021',
    superseded: true,
  },
  { id: 20099, title: "Treasurer's Report Summary AGM 2021", category: 'club-papers', season: 'AGM 2021' },
  { id: 18672, title: 'Girls Coordinator Report 2020', category: 'club-papers', season: '2020' },
  { id: 18670, title: 'Boys Coordinator Report 2020', category: 'club-papers', season: '2020' },
  { id: 18229, title: "President's Report AGM 2020", category: 'club-papers', season: 'AGM 2020' },
  { id: 18135, title: "Treasurer's Report Summary AGM 2020", category: 'club-papers', season: 'AGM 2020' },
  { id: 18134, title: 'AGM 2020 Financial Report', category: 'club-papers', season: 'AGM 2020' },
  { id: 17934, title: 'AGM 2019 Minutes', category: 'club-papers', season: 'AGM 2019' },

  // Team managers: 2021 current, 2018/2019 superseded
  { id: 20084, title: 'Team Manager Information July 2021', category: 'team-managers', season: '2021' },
  {
    id: 2834,
    title: 'Team Manager Information July 2019',
    category: 'team-managers',
    season: '2019',
    superseded: true,
  },
  {
    id: 1475,
    title: 'Team Manager Information May 2018',
    category: 'team-managers',
    season: '2018',
    superseded: true,
  },
  { id: 1474, title: 'Team Manager Policy', category: 'team-managers' },

  // Players: UPDATED-*-2 current, earlier superseded
  { id: 2835, title: 'New Player Information July 2019', category: 'players', season: '2019' },
  { id: 17950, title: 'Club Guidelines', category: 'players' },
  { id: 17949, title: 'Players Guidelines', category: 'players' },
  { id: 17946, title: 'Club Guidelines', category: 'players', superseded: true },
  { id: 17945, title: 'Players Guidelines', category: 'players', superseded: true },
  { id: 17943, title: 'Club Guidelines', category: 'players', superseded: true },
  { id: 17942, title: 'Players Guidelines', category: 'players', superseded: true },
  { id: 2613, title: 'Wildcats Basketball Excellence Passport', category: 'players' },
  { id: 1769, title: 'Wildcats Basketball Excellence Passport', category: 'players', superseded: true },
  { id: 1770, title: 'Wildcats SOSAD', category: 'players' },

  // Codes of conduct: newest of each role current, older + the combined PDF superseded
  { id: 2814, title: 'Parents Code of Conduct', category: 'codes-of-conduct' },
  { id: 17, title: 'Parents Code of Conduct', category: 'codes-of-conduct', superseded: true },
  { id: 2815, title: 'Officials Code of Conduct', category: 'codes-of-conduct' },
  { id: 1718, title: 'Officials Code of Conduct', category: 'codes-of-conduct', superseded: true },
  { id: 16, title: 'Officials Code of Conduct', category: 'codes-of-conduct', superseded: true },
  { id: 2817, title: 'Administrators Code of Conduct', category: 'codes-of-conduct' },
  { id: 1717, title: 'Administrators Code of Conduct', category: 'codes-of-conduct', superseded: true },
  { id: 2812, title: 'Spectators Code of Conduct', category: 'codes-of-conduct' },
  { id: 1716, title: 'Spectators Code of Conduct', category: 'codes-of-conduct', superseded: true },
  { id: 2816, title: 'Coaches Code of Conduct', category: 'codes-of-conduct' },
  { id: 1715, title: 'Coaches Code of Conduct', category: 'codes-of-conduct', superseded: true },
  { id: 2819, title: 'Players Code of Conduct', category: 'codes-of-conduct' },
  { id: 2813, title: 'Players Code of Conduct', category: 'codes-of-conduct', superseded: true },
  { id: 1714, title: 'Players Code of Conduct', category: 'codes-of-conduct', superseded: true },
  {
    id: 1711,
    title: 'All Codes of Conduct (combined)',
    category: 'codes-of-conduct',
    superseded: true,
    description: 'Superseded by the individual role PDFs above.',
  },

  // Other
  { id: 1392, title: 'Book4', category: 'other', superseded: true },
]

// ---------------------------------------------------------------------------
// Image catalogue (19 club photos worth keeping)
// ---------------------------------------------------------------------------

type ImageDef = { filename: string; alt: string }

const IMAGES: ImageDef[] = [
  { filename: 'bwch01.jpg', alt: 'The Basin Wildcats Basketball Club team photo' },
  { filename: 'bwch02.jpg', alt: 'The Basin Wildcats Basketball Club team photo' },
  { filename: 'HPI1.png', alt: 'The Basin Wildcats Basketball Club photo' },
  { filename: 'wilcats-picture-1.jpg', alt: 'The Basin Wildcats players in action' },
  { filename: 'wilcats-picture-2.jpg', alt: 'The Basin Wildcats players in action' },
  { filename: 'wilcats-picture-3.jpg', alt: 'The Basin Wildcats players in action' },
  { filename: 'wilcats-picture-4.jpg', alt: 'The Basin Wildcats players in action' },
  { filename: 'Life-member-1.jpg', alt: 'The Basin Wildcats life members' },
  { filename: 'Life-member-2.jpg', alt: 'The Basin Wildcats life members honour board' },
  { filename: 'bwccommit.jpg', alt: 'The Basin Wildcats committee' },
  { filename: 'history.jpg', alt: 'The Basin Wildcats Basketball Club history photo' },
  { filename: 'est-1975.png', alt: 'The Basin Wildcats, established 1975' },
  { filename: 'Hoodies-2021ws.jpg', alt: 'Basin Wildcats club hoodie, 2021' },
  { filename: 'Hoodies-2022.jpg', alt: 'Basin Wildcats club hoodie, 2022' },
  { filename: 'Hoodies-2023.jpg', alt: 'Basin Wildcats club hoodie, 2023' },
  { filename: 'hoodie-1.jpg', alt: 'Basin Wildcats club hoodie' },
  { filename: 'BWC-logo.png', alt: 'The Basin Wildcats Basketball Club logo' },
  { filename: 'footer.jpg', alt: 'The Basin Wildcats Basketball Club' },
  { filename: 'header.jpg', alt: 'The Basin Wildcats Basketball Club' },
]

// ---------------------------------------------------------------------------
// Old path -> new path map. Used both to write the redirects collection and
// to rewrite internal links found inside migrated page content.
// ---------------------------------------------------------------------------

const PAGE_REDIRECTS: [string, string][] = [
  ['/wordpress/terms-conditions/', '/policies'],
  ['/wordpress/bunnings-bbq/', '/'],
  ['/wordpress/facebook-demo/', '/'],
  ['/wordpress/my-instagram-feed-demo/', '/'],
  ['/wordpress/registration-and-financial-policy/', '/policies'],
  ['/wordpress/team-selection-policy/', '/policies'],
  ['/wordpress/misc-information/', '/member-information'],
  ['/wordpress/merchandise-shop/', '/shop'],
  ['/wordpress/uniform-number-request/', '/uniform-and-merchandise'],
  ['/wordpress/club-policies/', '/policies'],
  ['/wordpress/coaches-and-team-managers/coaches-information/', '/coaches'],
  ['/wordpress/coaches-and-team-managers/', '/team-managers-and-coaches'],
  ['/wordpress/members/uniform-and-merchandise/', '/uniform-and-merchandise'],
  ['/wordpress/members/season-information/', '/season-information'],
  ['/wordpress/members/training-information/', '/training'],
  ['/wordpress/members/fees/', '/fees'],
  ['/wordpress/club-information/life-members/', '/life-members'],
  ['/wordpress/club-information/history/', '/history'],
  ['/wordpress/awards/', '/awards'],
  ['/wordpress/contact-us/', '/contact'],
  ['/wordpress/links/', '/member-information'],
  ['/wordpress/gallery/', '/gallery'],
  ['/wordpress/join-us/', '/join'],
  ['/wordpress/contactus/', '/join'],
  ['/wordpress/members/', '/members'],
  ['/wordpress/club-information/committee-members/', '/committee'],
  ['/wordpress/club-information/', '/our-club'],
  ['/wordpress/coaches-and-team-managers/team-managers/', '/team-managers'],
  ['/wordpress/members/policies/financial-hardship-policy/', '/policies'],
  ['/wordpress/members/policies/medical-policy/', '/policies'],
  ['/wordpress/members/policies/74-2/', '/policies'],
  ['/wordpress/members/policies/70-2/', '/policies'],
  ['/wordpress/members/policies/junior-domestic-scoring-policy/', '/policies'],
  ['/wordpress/members/policies/extreme-heat-policy/', '/policies'],
  ['/wordpress/members/policies/spectators-code-of-conduct/', '/policies'],
  ['/wordpress/members/policies/administrators-code-of-conduct/', '/policies'],
  ['/wordpress/members/policies/coaches-code-of-conduct/', '/policies'],
  ['/wordpress/members/policies/55-2/', '/policies'],
  ['/wordpress/members/policies/parents-code-of-conduct/', '/policies'],
  ['/wordpress/members/policies/27-2/', '/policies'],
  ['/wordpress/home/', '/'],
  ['/wordpress/members/policies/', '/policies'],
  ['/wordpress/post/', '/'],
  ['/wordpress/sample-page/', '/'],
  ['/wordpress/sample-page-3/', '/'],
  ['/wordpress/our-history/', '/history'],
  ['/wordpress/faq/', '/'],
  ['/wordpress/media/', '/'],
  ['/wordpress/trophy-room/', '/'],
  ['/wordpress/contacts/', '/contact'],
  ['/wordpress/price-table/', '/'],
  ['/wordpress/arena/', '/'],
  ['/wordpress/about-club/', '/'],
  ['/wordpress/coming-soon/', '/'],
  ['/wordpress/news/', '/news'],
  ['/wordpress/shortcodes/', '/'],
  ['/wordpress/typography/', '/'],
  ['/wordpress/my-account/', '/shop'],
  ['/wordpress/checkout/', '/shop'],
  ['/wordpress/cart/', '/shop'],
  ['/wordpress/shop/', '/shop'],
  ['/wordpress/', '/'],
  ['/wordpress/sample-page-2/', '/'],
]

const DROPPED_THEME_PAGES = new Set([
  '/wordpress/bunnings-bbq/',
  '/wordpress/facebook-demo/',
  '/wordpress/my-instagram-feed-demo/',
  '/wordpress/post/',
  '/wordpress/sample-page/',
  '/wordpress/sample-page-3/',
  '/wordpress/our-history/',
  '/wordpress/faq/',
  '/wordpress/media/',
  '/wordpress/trophy-room/',
  '/wordpress/contacts/',
  '/wordpress/price-table/',
  '/wordpress/arena/',
  '/wordpress/about-club/',
  '/wordpress/coming-soon/',
  '/wordpress/shortcodes/',
  '/wordpress/typography/',
  '/wordpress/my-account/',
  '/wordpress/checkout/',
  '/wordpress/cart/',
  '/wordpress/shop/',
  '/wordpress/sample-page-2/',
  '/wordpress/merchandise-shop/',
])

// ---------------------------------------------------------------------------
// Upsert helpers
// ---------------------------------------------------------------------------

async function upsertDocument(payload: Payload, def: DocDef): Promise<{ id: number; url: string } | null> {
  const media = mediaById.get(def.id)
  if (!media) {
    counts.documentsFailed.push(`WP media id ${def.id} (${def.title}) not found in media.json`)
    return null
  }
  const existing = await payload.find({
    collection: 'documents',
    where: { sourceUrl: { equals: media.source_url } },
    limit: 1,
  })
  if (existing.docs.length) {
    counts.documentsSkipped++
    const doc = existing.docs[0] as any
    return { id: doc.id, url: doc.url }
  }
  try {
    const filename = decodeURIComponent(media.source_url.split('/').pop() || `${def.id}.pdf`)
    const { data, mimetype } = await fetchBuffer(media.source_url)
    const doc = await payload.create({
      collection: 'documents',
      data: {
        title: def.title,
        category: def.category,
        season: def.season,
        superseded: def.superseded ?? false,
        description: def.description,
        sourceUrl: media.source_url,
      } as any,
      file: { data, mimetype, name: filename, size: data.length } as any,
      context: { disableRevalidate: true },
    })
    counts.documentsCreated++
    log(`document created: ${def.title}${def.superseded ? ' [superseded]' : ''}`)
    return { id: (doc as any).id, url: (doc as any).url }
  } catch (err) {
    counts.documentsFailed.push(`${def.title} (${media.source_url}): ${(err as Error).message}`)
    return null
  }
}

async function upsertMedia(payload: Payload, def: ImageDef): Promise<{ id: number } | null> {
  const wpMedia = mediaRaw.find((m) => (m.source_url.split('/').pop() || '').toLowerCase() === def.filename.toLowerCase())
  if (!wpMedia) {
    counts.mediaFailed.push(`${def.filename}: not found in media.json`)
    return null
  }
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: def.filename } },
    limit: 1,
  })
  if (existing.docs.length) {
    counts.mediaSkipped++
    return { id: (existing.docs[0] as any).id }
  }
  try {
    const { data, mimetype } = await fetchBuffer(wpMedia.source_url)
    const doc = await payload.create({
      collection: 'media',
      data: { alt: def.alt } as any,
      file: { data, mimetype, name: def.filename, size: data.length } as any,
      context: { disableRevalidate: true },
    })
    counts.mediaCreated++
    log(`media created: ${def.filename}`)
    return { id: (doc as any).id }
  } catch (err) {
    counts.mediaFailed.push(`${def.filename}: ${(err as Error).message}`)
    return null
  }
}

async function upsertPage(payload: Payload, slug: string, data: Record<string, unknown>) {
  const existing = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1 })
  if (existing.docs.length) {
    await payload.update({
      collection: 'pages',
      id: (existing.docs[0] as any).id,
      data: { ...data, generateSlug: false } as any,
      context: { disableRevalidate: true },
    })
    counts.pagesUpdated++
    log(`page updated: /${slug}`)
  } else {
    await payload.create({
      collection: 'pages',
      data: { ...data, slug, generateSlug: false } as any,
      context: { disableRevalidate: true },
    })
    counts.pagesCreated++
    log(`page created: /${slug}`)
  }
}

async function upsertPost(payload: Payload, slug: string, data: Record<string, unknown>) {
  const existing = await payload.find({ collection: 'posts', where: { slug: { equals: slug } }, limit: 1 })
  if (existing.docs.length) {
    await payload.update({
      collection: 'posts',
      id: (existing.docs[0] as any).id,
      data: { ...data, generateSlug: false } as any,
      context: { disableRevalidate: true },
    })
    counts.postsUpdated++
    log(`post updated: /news/${slug}`)
  } else {
    await payload.create({
      collection: 'posts',
      data: { ...data, slug, generateSlug: false } as any,
      context: { disableRevalidate: true },
    })
    counts.postsCreated++
    log(`post created: /news/${slug}`)
  }
}

async function upsertCategory(payload: Payload, title: string): Promise<number> {
  const existing = await payload.find({ collection: 'categories', where: { title: { equals: title } }, limit: 1 })
  if (existing.docs.length) {
    counts.categoriesSkipped++
    return (existing.docs[0] as any).id
  }
  const doc = await payload.create({
    collection: 'categories',
    data: { title, generateSlug: false } as any,
    context: { disableRevalidate: true },
  })
  counts.categoriesCreated++
  log(`category created: ${title}`)
  return (doc as any).id
}

/** Redirects: the collection's afterChange hook calls next/cache's
 * revalidateTag unconditionally, which throws outside a real Next.js request
 * ("Invariant: static generation store missing"). That hook file is shared
 * app code, not something this script should edit, so redirects are written
 * through payload.db directly, bypassing collection hooks entirely. */
async function upsertRedirect(payload: Payload, from: string, to: string) {
  const existing = await payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1 })
  if (existing.docs.length) {
    counts.redirectsSkipped++
    return
  }
  const now = new Date().toISOString()
  await (payload.db as any).create({
    collection: 'redirects',
    data: { from, to: { type: 'custom', url: to }, createdAt: now, updatedAt: now },
  })
  counts.redirectsCreated++
}

// ---------------------------------------------------------------------------
// Content block builders
// ---------------------------------------------------------------------------

async function contentBlock(payload: Payload, html: string, linkMap: Map<string, string>) {
  const cleaned = cleanHtml(html, linkMap)
  const richText = await htmlToLexical(payload, cleaned || '<p></p>')
  return {
    blockType: 'content',
    columns: [{ size: 'full', richText, enableLink: false }],
  }
}

function introBlock(text: string) {
  return {
    blockType: 'content',
    columns: [{ size: 'full', richText: plainParagraph(text), enableLink: false }],
  }
}

function documentListBlock(opts: {
  title?: string
  intro?: string
  categories: DocCategory[]
  showSuperseded?: boolean
}) {
  return {
    blockType: 'documentList',
    title: opts.title,
    intro: opts.intro,
    mode: 'category',
    categories: opts.categories,
    showSuperseded: opts.showSuperseded ?? false,
  }
}

function ctaStripBlock(opts: { title: string; body?: string; tone?: 'green' | 'red' | 'ink'; url: string; label: string }) {
  return {
    blockType: 'ctaStrip',
    title: opts.title,
    body: opts.body,
    tone: opts.tone ?? 'green',
    link: { type: 'custom', url: opts.url, label: opts.label, newTab: false },
  }
}

function contactCardsBlock(opts: {
  title?: string
  intro?: string
  contacts: { role: string; name?: string; email?: string; phone?: string }[]
}) {
  return {
    blockType: 'contactCards',
    title: opts.title,
    intro: opts.intro,
    source: 'custom',
    contacts: opts.contacts,
  }
}

function tableBlock(opts: {
  title?: string
  caption?: string
  columns: string[]
  rows: string[][]
  note?: string
}) {
  return {
    blockType: 'table',
    title: opts.title,
    caption: opts.caption,
    columns: opts.columns.map((label) => ({ label })),
    rows: opts.rows.map((cells) => ({ cells: cells.map((value) => ({ value })) })),
    note: opts.note,
  }
}

function heroFor(opts: {
  eyebrow: string
  title: string
  intro: string
  mediaId?: number
}) {
  return {
    type: 'page',
    eyebrow: opts.eyebrow,
    title: opts.title,
    richText: plainParagraph(opts.intro),
    media: opts.mediaId,
    showStats: false,
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const payload = await getPayload({ config: configPromise })
  log('Payload ready. Starting migration.')

  // 1. Documents ------------------------------------------------------------
  const createdDocs = new Map<number, { id: number; url: string }>()
  for (const def of DOCS_MAP) {
    const doc = await upsertDocument(payload, def)
    if (doc) createdDocs.set(def.id, doc)
  }
  log(`Documents: ${counts.documentsCreated} created, ${counts.documentsSkipped} already present.`)

  // 2. Images -----------------------------------------------------------------
  const createdMedia = new Map<string, { id: number }>()
  for (const def of IMAGES) {
    const media = await upsertMedia(payload, def)
    if (media) createdMedia.set(def.filename, media)
  }
  log(`Media: ${counts.mediaCreated} created, ${counts.mediaSkipped} already present.`)

  // 3. Link map (old path -> new path / new doc url) --------------------------
  const linkMap = new Map<string, string>()
  for (const [oldPath, newPath] of PAGE_REDIRECTS) {
    const norm = normalizeOldPath(oldPath)
    if (norm) linkMap.set(norm, newPath)
  }
  for (const def of DOCS_MAP) {
    const media = mediaById.get(def.id)
    const created = createdDocs.get(def.id)
    if (media && created) {
      const norm = normalizeOldPath(media.source_url)
      if (norm) linkMap.set(norm, created.url)
    }
  }

  // 4. Pages --------------------------------------------------------------

  // history (158), fold in our-history (790) only if it holds real content —
  // it's WPBakery placeholder/lorem-ipsum NBA content, so it's dropped.
  droppedPages.push('/wordpress/our-history/ (Our history) — theme placeholder/lorem-ipsum NBA copy, no real club content')
  {
    const html = pageHtml(158)
    const modified = pageModified(158)
    let combined = html
    if (isBefore2024(modified)) {
      combined += `<p>Last reviewed on the previous website: ${monthYear(modified)}</p>`
    }
    await upsertPage(payload, 'history', {
      title: 'History',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Our club',
        title: 'History',
        intro: 'The Basin Wildcats have been a Knox community fixture for fifty years.',
        mediaId: createdMedia.get('history.jpg')?.id,
      }),
      layout: [await contentBlock(payload, combined, linkMap)],
    })
  }

  // committee (95): executive contacts as a contactCards block, plus the full
  // table (including age-group coordinators) as a content block.
  {
    const modified = pageModified(95)
    await upsertPage(payload, 'committee', {
      title: 'Committee',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Our club',
        title: 'Committee',
        intro: 'Meet the volunteers who run The Basin Wildcats week to week.',
      }),
      layout: [
        contactCardsBlock({
          title: 'Committee',
          contacts: [
            { role: 'President', name: 'Steve Geddes', phone: '0406 592 795', email: 'President@BasinWildcats.com' },
            { role: 'Vice President', name: 'Jill Van Lith', phone: '0412 353 085' },
            { role: 'Secretary', name: 'Lauren Timmerman', email: 'Secretary@BasinWildcats.com' },
            { role: 'Treasurer', name: 'Jo Dyer', email: 'Treasurer@BasinWildcats.com' },
            {
              role: 'Boys Coordinator',
              name: 'Ebony Yeomans',
              phone: '0401 018 917',
              email: 'BoysCoordinator@BasinWildcats.com',
            },
            {
              role: 'Girls Coordinator',
              name: 'Brent Airs',
              phone: '0429 048 009',
              email: 'GirlsCoordinator@BasinWildcats.com',
            },
            { role: 'Training Coordinator', name: 'Melissa Bryan', email: 'Training@BasinWildcats.com' },
            { role: 'Social Media', name: 'Ruth Howard' },
            { role: 'New Players', name: 'Bec Grey', email: 'IWantToPlay@basinwildcats.com' },
            {
              role: 'Sponsorship',
              name: 'Bruce Harbert',
              phone: '0407 258 088',
              email: 'sponsorship@basinwildcats.com',
            },
          ],
        }),
        await contentBlock(payload, pageHtml(95), linkMap),
      ],
    })
  }

  // life-members (164)
  {
    const modified = pageModified(164)
    let combined = pageHtml(164)
    if (isBefore2024(modified)) {
      combined += `<p>Last reviewed on the previous website: ${monthYear(modified)}</p>`
    }
    await upsertPage(payload, 'life-members', {
      title: 'Life Members',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Our club',
        title: 'Life Members',
        intro: 'Since 1992, The Basin Wildcats has recognised life members for outstanding service to the club.',
        mediaId: createdMedia.get('Life-member-1.jpg')?.id,
      }),
      layout: [await contentBlock(payload, combined, linkMap)],
    })
  }

  // awards (141)
  {
    const modified = pageModified(141)
    let combined = pageHtml(141)
    if (isBefore2024(modified)) {
      combined += `<p>Last reviewed on the previous website: ${monthYear(modified)}</p>`
    }
    await upsertPage(payload, 'awards', {
      title: 'Awards',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Our club',
        title: 'Awards',
        intro: 'The Basin Wildcats has presented these awards to players and volunteers since 1999.',
      }),
      layout: [await contentBlock(payload, combined, linkMap)],
    })
  }

  // fees (166): table block + notes content block
  {
    const modified = pageModified(166)
    const table = tableBlock({
      title: 'Winter 2025 Season Fees',
      caption: 'Winter 2025 fees, as published on the previous website. Confirm current season fees with the committee.',
      columns: ['If you have', 'Total fees'],
      rows: [
        ['1 Child', '$235'],
        ['2 Children', '$450'],
        ['3 Children', '$615'],
        ['4 Children', '$770'],
        ['5 Children', '$925'],
        ['6 Children', '$1,080'],
        ['Under 19 to Under 23 (per player)', '$165'],
      ],
      note:
        "Family discount not available to 'new to basketball' players (U8 to U12). All fees include a 1.9% transaction fee.",
    })
    const notesHtml = `
      <h3>Bank details</h3>
      <p>Account name: THE BASIN BASKETBALL CLUB INC.</p>
      <p>BSB: 013128</p>
      <p>Account number: 001479236</p>
    `
    await upsertPage(payload, 'fees', {
      title: 'Fees',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Join',
        title: 'Fees',
        intro: 'Winter 2025 fees for The Basin Wildcats, family discounts included.',
      }),
      layout: [table, await contentBlock(payload, notesHtml, linkMap)],
    })
  }

  // season-information (173)
  {
    const modified = pageModified(173)
    let combined = pageHtml(173)
    if (isBefore2024(modified)) {
      combined += `<p>Last reviewed on the previous website: ${monthYear(modified)}</p>`
    }
    await upsertPage(payload, 'season-information', {
      title: 'Season information',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Join',
        title: 'Season information',
        intro: 'Two seasons a year, seventeen rounds each, with finals for the top four.',
      }),
      layout: [await contentBlock(payload, combined, linkMap)],
    })
  }

  // training (169): keep the Child Supervision Policy as its own heading
  {
    const modified = pageModified(169)
    let html = pageHtml(169)
    html = html.replace(
      /<p class="p1"><strong>The Basin Wildcats Basketball Club\s*[–-]\s*Child Supervision Policy for Training Sessions<\/strong><\/p>/i,
      '<h2>Child Supervision Policy for Training Sessions</h2>',
    )
    let combined = html
    if (isBefore2024(modified)) {
      combined += `<p>Last reviewed on the previous website: ${monthYear(modified)}</p>`
    }
    await upsertPage(payload, 'training', {
      title: 'Training',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Join',
        title: 'Training',
        intro: "Training nights, locations and the club's June 2025 child supervision policy.",
      }),
      layout: [await contentBlock(payload, combined, linkMap)],
    })
  }

  // game-venues: no dedicated page in the export (WP page_id=171 not present);
  // built from the venue list and stadium entry section of the Misc
  // Information page (id 2598), transcribed verbatim.
  {
    const sourceModified = pageModified(2598)
    const html = `
      <p>Home games and training are played across seven venues in the Knox and Kilsyth area.</p>
      <h3>Venues</h3>
      <p>Fairhills High School: 330 Scoresby Rd Knoxfield 3180</p>
      <p>Knox: Park Cres Boronia 3155</p>
      <p>Rowville Community Centre: Fulham Rd Rowville 3178</p>
      <p>Rowville Eastern Campus (Sec. College): Humphries Way Rowville 3178</p>
      <p>St Josephs: Brenock Park Dr Ferntree Gully 3155</p>
      <p>State Basketball Centre: 291 George St Wantirna South 3152</p>
      <p>Upwey (High School): 1451 Burwood Hwy Upwey 3158</p>
      <h3>Stadium entry</h3>
      <p>$2.50 entry per person including players (children under five are free on Saturdays).</p>
      <p>$3.00 entry per person on Sundays (U19 to U23 games).</p>
      <p>Doorkeepers do not keep change of $50, or accept credit cards.</p>
      <p>A stamp from the stadium door allows entry into all other Knox basketball stadiums on that day.</p>
      <p>Last reviewed on the previous website: ${monthYear(sourceModified)} (sourced from the Misc Information page)</p>
    `
    await upsertPage(payload, 'game-venues', {
      title: 'Game venues',
      _status: 'published',
      publishedAt: sourceModified,
      hero: heroFor({
        eyebrow: 'Join',
        title: 'Game venues',
        intro: 'Where Basin Wildcats games and training are played across Knox and Kilsyth.',
      }),
      layout: [await contentBlock(payload, html, linkMap)],
    })
  }

  // policies (mega page): Codes of Conduct intro, then each role, then the
  // named club policies, ending with a document list.
  {
    const sectionIds = [27, 46, 60, 74, 64, 62, 55, 70, 66, 68, 77, 79, 2841, 2837, 10967]
    const headings: Record<number, string> = {
      27: 'Players Code of Conduct',
      46: 'Parents Code of Conduct',
      60: 'Coaches Code of Conduct',
      74: 'Officials Code of Conduct',
      64: 'Spectators Code of Conduct',
      62: 'Administrators Code of Conduct',
      55: 'Uniform Policy',
      70: 'Social Media and Internet Policy',
      66: 'Extreme Heat Policy',
      68: 'Junior Domestic Scoring Policy',
      77: 'Medical Policy',
      79: 'Financial Hardship Policy',
      2841: 'Registration and Financial Policy',
      2837: 'Team Selection Policy',
      10967: 'Terms and Conditions',
    }
    const introHtml = `<h2>Codes of Conduct</h2>
      <p>Basketball Victoria's codes of conduct guide how players, parents, coaches, officials,
      spectators and administrators treat each other at The Basin Wildcats. The current PDF
      versions of every code are listed at the bottom of this page.</p>`
    const sections = sectionIds
      .map((id) => `<h2>${headings[id]}</h2>` + pageHtml(id))
      .join('\n')
    const maxModified = sectionIds
      .map((id) => pageModified(id))
      .reduce((latest, m) => (new Date(m) > new Date(latest) ? m : latest), pageModified(1362))
    await upsertPage(payload, 'policies', {
      title: 'Policies and codes of conduct',
      _status: 'published',
      publishedAt: maxModified,
      hero: heroFor({
        eyebrow: 'Members',
        title: 'Policies and codes of conduct',
        intro: "Basketball Victoria codes of conduct plus The Basin Wildcats' own policies, all on one page.",
      }),
      layout: [
        await contentBlock(payload, introHtml + sections, linkMap),
        documentListBlock({
          title: 'Download the PDFs',
          categories: ['codes-of-conduct', 'policies'],
        }),
      ],
    })
  }

  // uniform-and-merchandise (175 + 1530 folded in as the three-step process)
  {
    const modified = pageModified(175)
    const stepsHtml = `
      <p>To play, every registered player needs an allocated uniform number on a club singlet.</p>
      <h3>Step one</h3>
      <p>Request a uniform number from the club.</p>
      <h3>Step two</h3>
      <p>Once your number is allocated, order your playing singlet from
      <a href="http://www.theprintshop.net.au/">The Print Shop</a> with your allocated number.</p>
      <h3>Step three (optional)</h3>
      <p>Order <a href="/shop">Basin Wildcats club merchandise</a>.</p>
    `
    let combined = stepsHtml
    if (isBefore2024(modified)) {
      combined += `<p>Last reviewed on the previous website: ${monthYear(modified)}</p>`
    }
    const forms = await payload.find({ collection: 'forms', limit: 100 })
    const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const uniformForm = (forms.docs as any[]).find((f) => slugify(f.title) === 'uniform-number-request')

    const layout: unknown[] = [
      await contentBlock(payload, combined, linkMap),
      ctaStripBlock({ title: 'Order club merchandise', tone: 'green', url: '/shop', label: 'Shop merchandise' }),
    ]
    if (uniformForm) {
      layout.push({ blockType: 'formBlock', form: uniformForm.id, enableIntro: false })
    } else {
      layout.push(
        ctaStripBlock({
          title: 'Request a uniform number',
          tone: 'ink',
          url: '/contact',
          label: 'Contact the club',
        }),
      )
      notes.push(
        "uniform-and-merchandise: no 'forms' record titled Uniform Number Request found at run time, used a ctaStrip to /contact instead. Re-run this script after the form exists to wire up the formBlock.",
      )
    }

    await upsertPage(payload, 'uniform-and-merchandise', {
      title: 'Uniform and merchandise',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Members',
        title: 'Uniform and merchandise',
        intro: 'Get your playing number, order your singlet and browse club merchandise in three steps.',
      }),
      layout,
    })
  }

  // member-information (misc-information, 2598)
  {
    const modified = pageModified(2598)
    let combined = pageHtml(2598)
    if (isBefore2024(modified)) {
      combined += `<p>Last reviewed on the previous website: ${monthYear(modified)}</p>`
    }
    await upsertPage(payload, 'member-information', {
      title: 'Member information',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Members',
        title: 'Member information',
        intro: 'Match day basics, from fixtures and scoring to first aid and finals eligibility.',
      }),
      layout: [await contentBlock(payload, combined, linkMap)],
    })
  }

  // team-managers (91) + documentList
  {
    const modified = pageModified(91)
    let combined = pageHtml(91)
    if (isBefore2024(modified)) {
      combined += `<p>Last reviewed on the previous website: ${monthYear(modified)}</p>`
    }
    await upsertPage(payload, 'team-managers', {
      title: 'Team managers',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Team managers and coaches',
        title: 'Team managers',
        intro: 'Everything a team manager needs, from responsibilities to the season pack.',
      }),
      layout: [
        await contentBlock(payload, combined, linkMap),
        documentListBlock({ title: 'Team manager resources', categories: ['team-managers'] }),
      ],
    })
  }

  // coaches (186) — mostly a file list, so lead with a short intro and a
  // documentList rather than re-converting the raw file-link markup.
  {
    const modified = pageModified(186)
    await upsertPage(payload, 'coaches', {
      title: 'Coaches',
      _status: 'published',
      publishedAt: modified,
      hero: heroFor({
        eyebrow: 'Team managers and coaches',
        title: 'Coaches',
        intro: 'OneClub resources, drills and the coaching handbook for Basin Wildcats coaches.',
      }),
      layout: [
        introBlock('The OneClub resource set below covers values, philosophy, drills and match-day terminology for every Basin Wildcats coach.'),
        documentListBlock({ title: 'Coaching resources', categories: ['coaching'] }),
      ],
    })
  }

  // club-papers: new page, no WP source
  {
    await upsertPage(payload, 'club-papers', {
      title: 'Club papers',
      _status: 'published',
      publishedAt: new Date().toISOString(),
      hero: heroFor({
        eyebrow: 'Team managers and coaches',
        title: 'Club papers',
        intro: 'AGM minutes, reports and papers from The Basin Wildcats, 2019 to 2021.',
      }),
      layout: [
        introBlock('Annual general meeting minutes, committee reports and financial papers, kept here for members who want the record.'),
        documentListBlock({ title: 'Club papers and AGM', categories: ['club-papers'] }),
      ],
    })
  }

  log(`Pages: ${counts.pagesCreated} created, ${counts.pagesUpdated} updated.`)

  // 5. Categories -----------------------------------------------------------
  const categoryIds = {
    clubNews: await upsertCategory(payload, 'Club news'),
    seasonUpdates: await upsertCategory(payload, 'Season updates'),
    agm: await upsertCategory(payload, 'AGM'),
  }
  log(`Categories: ${counts.categoriesCreated} created, ${counts.categoriesSkipped} already present.`)

  // 6. Posts ------------------------------------------------------------------
  const postCategoryBySlug: Record<string, number> = {
    'agm-2022': categoryIds.agm,
    'agm-2021': categoryIds.agm,
    'agm-2020': categoryIds.agm,
    'basin-wildcats-winter-2021-player-registration': categoryIds.seasonUpdates,
    'covid-19': categoryIds.clubNews,
    'may-player-of-the-month-levi-murrell': categoryIds.clubNews,
    'brody-harrison': categoryIds.clubNews,
    'grand-final-day': categoryIds.clubNews,
    'encouragement-day': categoryIds.clubNews,
  }

  for (const post of postsRaw) {
    const slug = post.link.replace(/\/$/, '').split('/').pop() || String(post.id)
    const cleaned = cleanHtml(post.content.rendered, linkMap)
    const richText = await htmlToLexical(payload, cleaned || '<p></p>')
    const plainText = post.content.rendered
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const excerpt = decodeEntities(plainText).slice(0, 200)
    const heroImage =
      post.featured_media && mediaById.has(post.featured_media)
        ? [...createdMedia.values()].find(() => false) // no featured media present in this export; left undefined
        : undefined

    await upsertPost(payload, slug, {
      title: decodeEntities(post.title.rendered),
      _status: 'published',
      publishedAt: post.date,
      excerpt,
      content: richText,
      categories: postCategoryBySlug[slug] ? [postCategoryBySlug[slug]] : [categoryIds.clubNews],
      heroImage,
    })
  }
  log(`Posts: ${counts.postsCreated} created, ${counts.postsUpdated} updated.`)

  // 7. Redirects --------------------------------------------------------------
  for (const [from, to] of PAGE_REDIRECTS) {
    await upsertRedirect(payload, from, to)
    const noSlash = from.replace(/\/$/, '')
    if (noSlash !== from) await upsertRedirect(payload, noSlash, to)
  }
  for (const post of postsRaw) {
    const slug = post.link.replace(/\/$/, '').split('/').pop() || String(post.id)
    const oldPath = new URL(post.link).pathname
    const to = `/news/${slug}`
    await upsertRedirect(payload, oldPath, to)
    const noSlash = oldPath.replace(/\/$/, '')
    if (noSlash !== oldPath) await upsertRedirect(payload, noSlash, to)
  }
  log(`Redirects: ${counts.redirectsCreated} created, ${counts.redirectsSkipped} already present.`)

  // ---------------------------------------------------------------------
  log('--- Summary ---')
  log(JSON.stringify(counts, null, 2))
  if (droppedPages.length) {
    log('Dropped pages:')
    droppedPages.forEach((d) => log('  - ' + d))
  }
  if (notes.length) {
    log('Notes:')
    notes.forEach((n) => log('  - ' + n))
  }
  if (counts.documentsFailed.length) {
    log('Document failures:')
    counts.documentsFailed.forEach((d) => log('  - ' + d))
  }
  if (counts.mediaFailed.length) {
    log('Media failures:')
    counts.mediaFailed.forEach((d) => log('  - ' + d))
  }

  await payload.destroy()
  log('Done.')
}

try {
  await main()
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('[migrate-wp] FAILED', err)
  process.exitCode = 1
}
