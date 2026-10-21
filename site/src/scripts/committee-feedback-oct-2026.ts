/**
 * Committee feedback from Mel, 12 Oct 2026: homepage icons, film reel with
 * the weekly Rewind reels, current committee contacts, current sponsors and
 * the AGM 2026 news post. Idempotent: matches by slug, filename, name and
 * block type, so re-running leaves the same result.
 *
 * Run from the `site` folder:
 *   pnpm payload run src/scripts/committee-feedback-oct-2026.ts
 *
 * Sources: Mel's email of 12 Oct 2026 (committee roles and emails, mascot
 * photos saved to content/client-assets/2026-10-12, which is gitignored; the
 * photos are already in the media library, so a re-run skips the upload) and
 * the club's own Instagram
 * (AGM post of 12 Oct 2026; Barry Plant Boronia, Bronto's Cafe and Richardson
 * Arch Group tagged on every Wildcats Rewind reel).
 */
import { getPayload } from 'payload'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import type { Media, Page } from '../payload-types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLIENT_ASSETS = path.resolve(__dirname, '../../../content/client-assets/2026-10-12')

// Hooks skip next/cache revalidation when this is set; it throws outside a
// live request. Revalidate through /api/revalidate after the run.
const noRevalidate = { context: { disableRevalidate: true } }

const SECRETARY = 'secretary.thebasinwildcats@gmail.com'

const committee = [
  { role: 'President', name: 'Steve Geddes', email: 'president.thebasinwildcats@gmail.com' },
  { role: 'Vice President', name: null, email: 'vicepresident@basinwildcats.com' },
  { role: 'Secretary', name: null, email: SECRETARY },
  { role: 'Treasurer', name: 'Rachel', email: 'treasurer.thebasinwildcats@gmail.com' },
  { role: 'Socials', name: 'Mel Jones', email: 'socials.thebasinwildcats@gmail.com' },
]

// ---------------------------------------------------------------------
// Lexical helpers (same shape as seed-core)
// ---------------------------------------------------------------------

type Run = string | { text: string; format?: number; link?: string }

const textNode = (text: string, format = 0) => ({
  type: 'text',
  version: 1,
  text,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
})

const inline = (run: Run) => {
  if (typeof run === 'string') return textNode(run)
  if (run.link) {
    return {
      type: 'link',
      version: 3,
      fields: { url: run.link, newTab: false, linkType: 'custom' },
      children: [textNode(run.text, run.format ?? 0)],
      direction: 'ltr',
      format: '',
      indent: 0,
    }
  }
  return textNode(run.text, run.format ?? 0)
}

const paragraph = (runs: Run[]) => ({
  type: 'paragraph',
  version: 1,
  children: runs.map(inline),
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
})

const bullets = (items: string[]) => ({
  type: 'list',
  version: 1,
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: items.map((item, i) => ({
    type: 'listitem',
    version: 1,
    value: i + 1,
    children: [textNode(item)],
    direction: 'ltr',
    format: '',
    indent: 0,
  })),
  direction: 'ltr',
  format: '',
  indent: 0,
})

type LexNode = { type: string; version: number; [k: string]: unknown }

const root = (children: LexNode[]) => ({
  root: {
    type: 'root',
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const customLink = (url: string) => ({ type: 'custom' as const, url, newTab: false })

// ---------------------------------------------------------------------

async function main() {
  const payload = await getPayload({ config })

  // 1. Media: costume mascot photos from Mel -----------------------------
  const upsertMedia = async (filename: string, source: string, alt: string): Promise<Media> => {
    const existing = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })
    if (existing.docs[0]) return existing.docs[0]
    const data = fs.readFileSync(path.join(CLIENT_ASSETS, source))
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, name: filename, mimetype: 'image/jpeg', size: data.length },
    })
    console.log(`  uploaded ${filename} (id ${doc.id})`)
    return doc
  }

  const costume = await upsertMedia(
    'wildcat-mascot-costume.jpg',
    'Messenger_creation_8ADF59B2-A50A-40D0-B341-B055E0A4E4CE.jpeg',
    'The Wildcat mascot in costume on court',
  )
  const costumeCrowd = await upsertMedia(
    'wildcat-mascot-with-supporter.jpg',
    'Messenger_creation_256BB196-CBB8-4449-B67F-4AF8CDF4D233.jpeg',
    'The Wildcat mascot with a Wildcats supporter',
  )

  const allMedia = await payload.find({ collection: 'media', limit: 500, depth: 0, pagination: false })
  const mediaId = (filename: string) => {
    const doc = allMedia.docs.find((m) => m.filename === filename)
    if (!doc) throw new Error(`media not found: ${filename}`)
    return doc.id
  }

  // 2. Homepage -----------------------------------------------------------
  const home = (
    await payload.find({ collection: 'pages', where: { slug: { equals: 'home' } }, depth: 0, limit: 1 })
  ).docs[0] as Page | undefined
  if (!home) throw new Error('home page not found')

  const quickLinks = {
    blockType: 'quickLinks' as const,
    items: [
      {
        icon: 'singlet' as const,
        label: 'Join us',
        helper: 'New player enquiry for the season ahead',
        link: customLink('/join'),
      },
      {
        icon: 'people' as const,
        label: 'Committee',
        helper: 'Who runs the club and how to reach them',
        link: customLink('/committee'),
      },
      {
        icon: 'megaphone' as const,
        label: 'Club news',
        helper: 'Season updates and club announcements',
        showLatestNews: true,
        link: customLink('/news'),
      },
      {
        icon: 'hoodie' as const,
        label: 'Shop',
        helper: 'Club hoodies, collected at training',
        link: customLink('/shop'),
      },
      {
        icon: 'whistle' as const,
        label: 'Volunteer',
        helper: 'Coach, manage a team or help on game day',
        link: customLink('/volunteer'),
      },
    ],
  }

  const filmReel = {
    blockType: 'filmReel' as const,
    title: 'Game day',
    titleHollow: 'moments',
    kicker:
      'Real Wildcats, real weekends. Club photos and every new Wildcats Rewind reel, straight from our Instagram.',
    includeReels: true,
    reelCount: 6,
    frames: [
      { image: mediaId('bwch02.jpg'), caption: 'Girls huddle before tip-off' },
      { image: costume.id, caption: 'The Wildcat, game day' },
      { image: mediaId('wilcats-picture-3.jpg'), caption: 'Young Wildcats on court' },
      { image: mediaId('bwch01.jpg'), caption: 'Knox competition' },
      { image: mediaId('wilcats-picture-1.jpg'), caption: 'Wildcats in the club hoodie' },
      { image: costumeCrowd.id, caption: 'The Wildcat with the crowd' },
      { image: mediaId('wilcats-picture-4.jpg'), caption: 'Team line-up' },
      { image: mediaId('Life-member-1.jpg'), caption: 'Life members' },
    ],
  }

  type LayoutBlock = Page['layout'][number]
  const layout: LayoutBlock[] = []
  for (const block of home.layout || []) {
    if (block.blockType === 'quickLinks') continue
    // The film reel takes the photo tickets' place (or its own, on a re-run).
    if (block.blockType === 'ticketGallery' || block.blockType === 'filmReel') {
      layout.push(filmReel as LayoutBlock)
      continue
    }
    if (block.blockType === 'instagramFeed') {
      // One full row of six at desktop width, reels left to the film reel.
      layout.push({ ...block, count: 6, excludeReels: true })
      continue
    }
    layout.push(block)
    if (block.blockType === 'marquee') layout.push(quickLinks as LayoutBlock)
  }
  if (!layout.some((b) => b.blockType === 'filmReel')) throw new Error('no photo tickets or film reel to replace')

  await payload.update({
    collection: 'pages',
    id: home.id,
    data: { layout, _status: 'published' },
    ...noRevalidate,
  })
  console.log(`  homepage: ${layout.map((b) => b.blockType).join(', ')}`)

  // 3. Committee page -----------------------------------------------------
  const committeePage = (
    await payload.find({ collection: 'pages', where: { slug: { equals: 'committee' } }, depth: 0, limit: 1 })
  ).docs[0]
  if (!committeePage) throw new Error('committee page not found')

  await payload.update({
    collection: 'pages',
    id: committeePage.id,
    data: {
      _status: 'published',
      layout: [
        {
          blockType: 'contactCards',
          title: "Who's who",
          intro:
            'Questions about teams, placements or anything else go to the Secretary first, so the right person picks them up.',
          source: 'custom',
          contacts: committee,
        },
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: root([
                { type: 'heading', tag: 'h2', version: 1, children: [textNode('AGM 2026: Wednesday 11 November')], direction: 'ltr', format: '', indent: 0 },
                paragraph([
                  'These committee positions are open for nomination at the 2026 AGM:',
                ]),
                bullets([
                  'Secretary',
                  'Vice President',
                  'Girls Coordinator',
                  'Event Coordinator',
                  'Fundraising and Sponsorship',
                ]),
                paragraph([
                  'Position descriptions, covering what each role involves, eligibility and the time commitment, are on the way. To nominate or ask about a role, email ',
                  { text: SECRETARY, link: `mailto:${SECRETARY}` },
                  '.',
                ]),
              ]),
            },
          ],
        },
      ],
    },
    ...noRevalidate,
  })
  console.log('  committee page updated')

  // 4. Site settings: club contacts and where enquiries go ----------------
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      generalEmail: SECRETARY,
      ordersEmail: SECRETARY,
      contacts: committee,
    },
    ...noRevalidate,
  })
  console.log('  site settings contacts updated')

  // Form notifications: anything still pointing at an old club mailbox goes
  // to the Secretary, the address the club now publishes.
  const forms = await payload.find({ collection: 'forms', limit: 20, depth: 0 })
  for (const form of forms.docs) {
    const emails = (form.emails || []).map((e) =>
      e.emailTo && /@basinwildcats\.com/i.test(e.emailTo) ? { ...e, emailTo: SECRETARY } : e,
    )
    await payload.update({ collection: 'forms', id: form.id, data: { emails }, ...noRevalidate })
  }
  console.log(`  ${forms.docs.length} forms now notify ${SECRETARY}`)

  // 5. Sponsors -------------------------------------------------------------
  const current: Record<string, { order: number; url?: string }> = {
    'Barry Plant Boronia': { order: 1, url: 'https://www.barryplant.com.au/boronia' },
    'Cafe Brontos': { order: 2 },
    'Richardson Arch Group': { order: 3 },
  }
  const sponsors = await payload.find({ collection: 'sponsors', limit: 50, depth: 0 })
  for (const s of sponsors.docs) {
    const keep = current[s.name]
    await payload.update({
      collection: 'sponsors',
      id: s.id,
      data: keep
        ? { active: true, order: keep.order, supports: 'Club sponsor', ...(keep.url ? { url: keep.url } : {}) }
        : { active: false },
      ...noRevalidate,
    })
  }
  for (const [name, info] of Object.entries(current)) {
    if (sponsors.docs.some((s) => s.name === name)) continue
    await payload.create({
      collection: 'sponsors',
      data: { name, active: true, order: info.order, url: info.url, supports: 'Club sponsor' },
      ...noRevalidate,
    })
    console.log(`  added sponsor ${name}`)
  }
  console.log('  sponsors: Barry Plant Boronia, Cafe Brontos, Richardson Arch Group active; earlier sponsors kept but hidden')

  // 6. News: AGM 2026 -------------------------------------------------------
  const agmCategory = (
    await payload.find({ collection: 'categories', where: { slug: { equals: 'agm' } }, limit: 1 })
  ).docs[0]
  const agmPost = {
    title: 'AGM 2026 and committee nominations',
    slug: 'agm-2026-committee-nominations',
    generateSlug: false,
    _status: 'published' as const,
    publishedAt: '2026-10-12T09:00:00+11:00',
    heroImage: mediaId('wildcats-social-DeYxYb_GCHb.jpg'),
    categories: agmCategory ? [agmCategory.id] : [],
    excerpt:
      'Our 2026 AGM is on Wednesday 11 November, and five committee positions are open for nomination.',
    content: root([
      paragraph([
        'Our 2026 AGM is on Wednesday 11 November. We are looking for Wildcats members, parents and volunteers who would like to get more involved and help the club keep growing.',
      ]),
      paragraph(['These committee positions are open for nomination:']),
      bullets([
        'Secretary',
        'Vice President',
        'Girls Coordinator',
        'Event Coordinator',
        'Fundraising and Sponsorship',
      ]),
      paragraph([
        'Position descriptions are coming soon, with more on what each role involves, eligibility and the time commitment.',
      ]),
      paragraph([
        'If you would like to nominate or find out more, email ',
        { text: SECRETARY, link: `mailto:${SECRETARY}` },
        ' or keep an eye on our socials.',
      ]),
    ]),
    meta: {
      title: 'AGM 2026 and committee nominations | The Basin Wildcats',
      description:
        'The Basin Wildcats 2026 AGM is on Wednesday 11 November. Secretary, Vice President, Girls Coordinator, Event Coordinator and Fundraising and Sponsorship are open for nomination.',
    },
  }
  const existingPost = (
    await payload.find({ collection: 'posts', where: { slug: { equals: agmPost.slug } }, limit: 1 })
  ).docs[0]
  if (existingPost) {
    await payload.update({ collection: 'posts', id: existingPost.id, data: agmPost, ...noRevalidate })
  } else {
    await payload.create({ collection: 'posts', data: agmPost, ...noRevalidate })
  }
  console.log('  news post: AGM 2026 and committee nominations')

  await payload.destroy()
}

try {
  await main()
  process.exitCode = 0
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
