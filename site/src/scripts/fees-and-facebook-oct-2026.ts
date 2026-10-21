/**
 * Summer 2026/27 fees and the club's Facebook page and groups, from Mel's
 * email of 12 Oct 2026 (fees screenshot from PlayHQ; Facebook share links
 * resolved to their canonical addresses on 22 Oct 2026). Idempotent.
 *
 * Run from the `site` folder:
 *   pnpm payload run src/scripts/fees-and-facebook-oct-2026.ts
 */
import { getPayload } from 'payload'

import config from '@payload-config'
import type { Page } from '../payload-types'

// Hooks skip next/cache revalidation when this is set; it throws outside a
// live request. Revalidate through /api/revalidate after the run.
const noRevalidate = { context: { disableRevalidate: true } }

const FACEBOOK_PAGE = 'https://www.facebook.com/basinwildcatsclub'
const MEMBERS_GROUP = 'https://www.facebook.com/groups/basinwildcats/'
const TEAM_MANAGERS_GROUP = 'https://www.facebook.com/groups/782805609532676/'
const COACHES_GROUP = 'https://www.facebook.com/groups/323019496033006/'

const GROUPS_TITLE = 'Wildcats groups on Facebook'

// ---------------------------------------------------------------------
// Lexical helpers (same shape as seed-core)
// ---------------------------------------------------------------------

const textNode = (text: string, format = 0) => ({
  type: 'text',
  version: 1,
  text,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
})

const paragraph = (text: string) => ({
  type: 'paragraph',
  version: 1,
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
})

const heading = (text: string) => ({
  type: 'heading',
  tag: 'h2',
  version: 1,
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
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

const outLink = (label: string, url: string) => ({
  type: 'custom' as const,
  url,
  label,
  newTab: true,
})

type LayoutBlock = Page['layout'][number]

// ---------------------------------------------------------------------

async function main() {
  const payload = await getPayload({ config })

  const pageBySlug = async (slug: string) => {
    const page = (
      await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, depth: 0, limit: 1 })
    ).docs[0]
    if (!page) throw new Error(`page not found: ${slug}`)
    return page
  }

  const publish = (id: number, data: Partial<Page>) =>
    payload.update({
      collection: 'pages',
      id,
      data: { ...data, _status: 'published' },
      ...noRevalidate,
    })

  // 1. Fees: Summer 2026/27 ---------------------------------------------
  const fees = await pageBySlug('fees')
  const bankDetails = (fees.layout || []).find(
    (b) => b.blockType === 'content' && JSON.stringify(b).includes('Bank details'),
  )

  const feesLayout: LayoutBlock[] = [
    {
      blockType: 'table',
      title: 'Summer 2026/27 season fees',
      caption:
        'Junior Domestic, Knox Basketball Association. The season runs from 3 October 2026 to 25 April 2027.',
      columns: [{ label: 'Age group' }, { label: 'Season registration' }],
      rows: [
        { cells: [{ value: 'Under 8 to Under 16' }, { value: '$240' }] },
        { cells: [{ value: 'Under 19 to Under 23' }, { value: '$175' }] },
      ],
      note: 'All registrations incur a 1.9% service fee from PlayHQ.',
    },
    {
      blockType: 'content',
      columns: [
        {
          size: 'full',
          richText: root([
            heading('Family discounts'),
            paragraph('Families get 10% off for a second child and 30% off for a third child.'),
            paragraph(
              'Contact the club for a voucher before you register a third child. New players claiming a free uniform are not eligible for the family discount.',
            ),
          ]),
        },
      ],
    },
    ...(bankDetails ? [bankDetails] : []),
  ]

  await publish(fees.id, {
    hero: {
      ...fees.hero,
      richText: root([paragraph('Summer 2026/27 fees for The Basin Wildcats, with family discounts.')]),
    },
    layout: feesLayout,
  })
  console.log('  fees: Summer 2026/27')

  // 2. Facebook page and members group in site settings -------------------
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { facebookUrl: FACEBOOK_PAGE, facebookGroupUrl: MEMBERS_GROUP },
    ...noRevalidate,
  })
  console.log('  site settings: Facebook page and members group')

  // 3. Social page: the three private groups ------------------------------
  const social = await pageBySlug('social')
  const groupsGrid: LayoutBlock = {
    blockType: 'cardGrid',
    title: GROUPS_TITLE,
    kicker: 'Current Wildcats families, team managers and coaches can ask to join on Facebook.',
    cards: [
      {
        tag: 'Members',
        title: 'Wildcats members',
        body: 'For current Wildcats families: club notices, fixtures and training changes.',
        feature: true,
        hasLink: true,
        link: outLink('Request to join', MEMBERS_GROUP),
      },
      {
        tag: 'Team managers',
        title: 'Team managers',
        body: 'For the team managers who run each Wildcats team.',
        feature: false,
        hasLink: true,
        link: outLink('Request to join', TEAM_MANAGERS_GROUP),
      },
      {
        tag: 'Coaches',
        title: 'Coaches',
        body: 'For Wildcats coaches across every age group.',
        feature: false,
        hasLink: true,
        link: outLink('Request to join', COACHES_GROUP),
      },
    ],
  }
  const socialLayout: LayoutBlock[] = []
  for (const block of social.layout || []) {
    if (block.blockType === 'cardGrid' && block.title === GROUPS_TITLE) continue
    if (block.blockType === 'facebookPage') {
      // Header and Follow button only: logged-out visitors get an empty
      // timeline, and the Instagram feed above already shows the posts.
      socialLayout.push({ ...block, height: 150 }, groupsGrid)
      continue
    }
    socialLayout.push(block)
  }
  await publish(social.id, { layout: socialLayout })
  console.log('  social: groups added')

  // 4. Team managers and coaches pages: their own group -------------------
  const groupStrip = (title: string, body: string, url: string): LayoutBlock => ({
    blockType: 'ctaStrip',
    title,
    body,
    tone: 'ink',
    link: outLink('Request to join', url),
  })
  for (const [slug, strip] of [
    [
      'team-managers',
      groupStrip(
        'Team managers group on Facebook',
        'The Facebook group for Wildcats team managers: ask to join from the group page.',
        TEAM_MANAGERS_GROUP,
      ),
    ],
    [
      'coaches',
      groupStrip(
        'Coaches group on Facebook',
        'The Facebook group for Wildcats coaches: ask to join from the group page.',
        COACHES_GROUP,
      ),
    ],
  ] as const) {
    const page = await pageBySlug(slug)
    const layout = (page.layout || []).filter(
      (b) => !(b.blockType === 'ctaStrip' && b.title === (strip as { title: string }).title),
    )
    await publish(page.id, { layout: [...layout, strip] })
    console.log(`  ${slug}: group link added`)
  }

  await payload.destroy()
}

try {
  await main()
  process.exitCode = 0
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
