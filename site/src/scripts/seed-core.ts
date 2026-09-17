/**
 * Idempotent core content seed for the Basin Wildcats site.
 *
 * Run from the `site` folder:
 *   pnpm payload run src/scripts/seed-core.ts
 *
 * Safe to re-run: every collection document is upserted by a natural key
 * (media by filename, sponsors/forms by name/title, pages by slug,
 * categories by title) and globals are simply overwritten in place.
 */
import { getPayload } from 'payload'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import type { Media } from '../payload-types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_IMG = path.resolve(__dirname, '../../../assets/img')
const ASSETS_VIDEO = path.resolve(__dirname, '../../../assets/video')

// A context flag the page/header/footer hooks check before calling
// next/cache's revalidatePath/revalidateTag, which throw outside a live
// Next.js request. This script runs standalone, so always disable it.
const noRevalidate = { context: { disableRevalidate: true } }

// ---------------------------------------------------------------------
// Lexical helpers: minimal root > paragraph > text node trees.
// ---------------------------------------------------------------------

type TextRun = string | { text: string; format?: number }

const textNode = (run: TextRun) => {
  const r = typeof run === 'string' ? { text: run, format: 0 } : { format: 0, ...run }
  return {
    type: 'text',
    version: 1,
    text: r.text,
    format: r.format,
    detail: 0,
    mode: 'normal',
    style: '',
  }
}

const paragraphNode = (runs: TextRun[]) => ({
  type: 'paragraph',
  version: 1,
  children: runs.map(textNode),
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
})

/** Builds a Lexical richText value from a list of paragraphs, each a list of text runs. */
const lex = (paragraphs: TextRun[][]) => ({
  root: {
    type: 'root',
    children: paragraphs.map(paragraphNode),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

/** One-paragraph richText shorthand. */
const lex1 = (text: string) => lex([[text]])

// ---------------------------------------------------------------------
// Link helper: matches the `link` field group shape (custom URL only).
// ---------------------------------------------------------------------

const customLink = (label: string, url: string) => ({
  type: 'custom' as const,
  url,
  label,
  newTab: false,
})

// ---------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------

const mimeFor = (filename: string): string => {
  switch (path.extname(filename).toLowerCase()) {
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.mp4':
      return 'video/mp4'
    default:
      return 'application/octet-stream'
  }
}

async function upsertMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
  alt: string,
  dir: string,
): Promise<Media> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.log(`  media "${filename}" already exists, skipping upload`)
    return existing.docs[0] as Media
  }

  const filePath = path.join(dir, filename)
  const data = fs.readFileSync(filePath)
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      name: filename,
      mimetype: mimeFor(filename),
      size: data.length,
    },
  })
  console.log(`  uploaded media "${filename}" (id ${doc.id})`)
  return doc as Media
}

// ---------------------------------------------------------------------
// Generic upsert-by-field helpers
// ---------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertByField(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: string,
  fieldName: string,
  fieldValue: string,
  data: Record<string, unknown>,
): Promise<any> {
  const localApi = payload as unknown as {
    find: (args: unknown) => Promise<{ docs: Array<{ id: number | string }> }>
    update: (args: unknown) => Promise<{ id: number | string }>
    create: (args: unknown) => Promise<{ id: number | string }>
  }
  const existing = await localApi.find({
    collection,
    where: { [fieldName]: { equals: fieldValue } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    const doc = await localApi.update({
      collection,
      id: existing.docs[0].id,
      data,
    })
    console.log(`  updated ${collection} "${fieldValue}" (id ${doc.id})`)
    return doc
  }
  const doc = await localApi.create({
    collection,
    data: { ...data, [fieldName]: fieldValue },
  })
  console.log(`  created ${collection} "${fieldValue}" (id ${doc.id})`)
  return doc
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsertPage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
  data: Record<string, unknown>,
): Promise<any> {
  const localApi = payload as unknown as {
    find: (args: unknown) => Promise<{ docs: Array<{ id: number | string }> }>
    update: (args: unknown) => Promise<{ id: number | string }>
    create: (args: unknown) => Promise<{ id: number | string }>
  }
  const pageData = { ...data, slug, generateSlug: false, _status: 'published' as const }
  const existing = await localApi.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    const doc = await localApi.update({
      collection: 'pages',
      id: existing.docs[0].id,
      data: pageData,
      ...noRevalidate,
    })
    console.log(`  updated page "/${slug}" (id ${doc.id})`)
    return doc
  }
  const doc = await localApi.create({
    collection: 'pages',
    data: pageData,
    ...noRevalidate,
  })
  console.log(`  created page "/${slug}" (id ${doc.id})`)
  return doc
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  const payload = await getPayload({ config })

  // 1. Media -----------------------------------------------------------
  console.log('\n[1/8] Media')
  const media = {
    logo: await upsertMedia(payload, 'logo.png', 'The Basin Wildcats logo', ASSETS_IMG),
    heroPlayer: await upsertMedia(
      payload,
      'hero-player.webp',
      'Basketball player in Wildcats green and red holding a ball',
      ASSETS_IMG,
    ),
    ball: await upsertMedia(
      payload,
      'ball.jpg',
      'Basketball on a court under a spotlight',
      ASSETS_IMG,
    ),
    net: await upsertMedia(payload, 'net.jpg', 'Basketball dropping through the net', ASSETS_IMG),
    courtWide: await upsertMedia(
      payload,
      'court-wide.jpg',
      'Wide view of an empty basketball court',
      ASSETS_IMG,
    ),
    photoGame: await upsertMedia(
      payload,
      'photo-game.jpg',
      'Wildcats players contesting a rebound in a Knox competition game',
      ASSETS_IMG,
    ),
    photoCourt: await upsertMedia(
      payload,
      'photo-court.jpg',
      'Junior Wildcats players with hands in for a team huddle',
      ASSETS_IMG,
    ),
    photoClub: await upsertMedia(
      payload,
      'photo-club.png',
      "The Basin Wildcats jersey beside the club's wildcat eyes motif",
      ASSETS_IMG,
    ),
    netSwish: await upsertMedia(
      payload,
      'net-swish.mp4',
      'A basketball swishing through the net',
      ASSETS_VIDEO,
    ),
  }

  // 2. Site settings global ---------------------------------------------
  console.log('\n[2/8] Site settings')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      clubName: 'The Basin Wildcats Basketball Club',
      shortName: 'Basin Wildcats',
      tagline: 'Excellence in basketball since 1975',
      homeBase: 'The Basin Primary School',
      founded: 1975,
      stats: [
        { value: 50, label: 'Seasons, est. 1975' },
        { value: 70, suffix: '+', label: 'Teams every year' },
        { value: 400, suffix: '+', label: 'Club members' },
      ],
      generalEmail: 'secretary@basinwildcats.com',
      ordersEmail: 'secretary@basinwildcats.com',
      contacts: [
        { role: 'President', email: 'president@basinwildcats.com' },
        { role: 'Secretary', email: 'secretary@basinwildcats.com' },
        { role: 'Boys Coordinator', email: 'boyscoordinator@basinwildcats.com' },
        { role: 'Girls Coordinator', email: 'girlscoordinator@basinwildcats.com' },
        { role: 'Medicals', email: 'medicals@basinwildcats.com' },
        { role: 'Sponsorship', email: 'sponsorship@basinwildcats.com' },
        { role: 'New player enquiries', email: 'IWantToPlay@basinwildcats.com' },
      ],
      instagramHandle: 'thebasin.wildcats',
      facebookUrl: '',
      announcement: { enabled: false },
    },
    ...noRevalidate,
  })
  console.log('  site-settings global saved')

  // 3. Header ------------------------------------------------------------
  console.log('\n[3/8] Header navigation')
  await payload.updateGlobal({
    slug: 'header',
    data: {
      navItems: [
        {
          link: customLink('Our Club', '/our-club'),
          children: [
            { link: customLink('History', '/history') },
            { link: customLink('Committee', '/committee') },
            { link: customLink('Life Members', '/life-members') },
            { link: customLink('Awards', '/awards') },
            { link: customLink('Sponsors', '/sponsors') },
          ],
        },
        {
          link: customLink('Play', '/join'),
          children: [
            { link: customLink('Join the Wildcats', '/join') },
            { link: customLink('Fees', '/fees') },
            { link: customLink('Season information', '/season-information') },
            { link: customLink('Training', '/training') },
            { link: customLink('Game venues', '/game-venues') },
            { link: customLink('Mini Cats', '/mini-cats') },
          ],
        },
        {
          link: customLink('Members', '/members'),
          children: [
            { link: customLink('Policies', '/policies') },
            { link: customLink('Uniform and merchandise', '/uniform-and-merchandise') },
            { link: customLink('Member information', '/member-information') },
            { link: customLink('Social', '/social') },
          ],
        },
        {
          link: customLink('Team Managers and Coaches', '/team-managers-and-coaches'),
          children: [
            { link: customLink('Team managers', '/team-managers') },
            { link: customLink('Coaches', '/coaches') },
            { link: customLink('Club papers', '/club-papers') },
          ],
        },
        { link: customLink('News', '/news'), children: [] },
        { link: customLink('Shop', '/shop'), children: [] },
      ],
      cta: { link: customLink('Join Us', '/join') },
    },
    ...noRevalidate,
  })
  console.log('  header global saved')

  // 4. Footer --------------------------------------------------------------
  console.log('\n[4/8] Footer')
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      blurb:
        'The Basin Wildcats Basketball Club. A family club in the Knox competition since 1975, playing winter and summer from our home base at The Basin Primary School.',
      columns: [
        {
          heading: 'Our Club',
          navItems: [
            { link: customLink('History', '/history') },
            { link: customLink('Committee', '/committee') },
            { link: customLink('News', '/news') },
            { link: customLink('Gallery', '/gallery') },
            { link: customLink('Sponsors', '/sponsors') },
          ],
        },
        {
          heading: 'Play',
          navItems: [
            { link: customLink('Join Us', '/join') },
            { link: customLink('Fees', '/fees') },
            { link: customLink('Season information', '/season-information') },
            { link: customLink('Training', '/training') },
            { link: customLink('Shop', '/shop') },
          ],
        },
        {
          heading: 'Members',
          navItems: [
            { link: customLink('Policies', '/policies') },
            { link: customLink('Uniform and merchandise', '/uniform-and-merchandise') },
            { link: customLink('Team managers and coaches', '/team-managers-and-coaches') },
            { link: customLink('Social', '/social') },
            { link: customLink('Contact', '/contact') },
          ],
        },
      ],
    },
    ...noRevalidate,
  })
  console.log('  footer global saved')

  // 5. Sponsors --------------------------------------------------------------
  console.log('\n[5/8] Sponsors')
  const sponsorsSeed = [
    {
      name: 'Julian Wood Booksellers',
      supports: 'Warm up tops',
      url: 'http://www.julianwoodbookseller.com.au/',
      order: 1,
    },
    {
      name: 'Jayco Bayswater',
      supports: 'Coaches award',
      url: 'https://bayswater.jayco.com.au/',
      order: 2,
    },
    {
      name: 'Celebration Services',
      supports: 'Sportsmanship awards',
      url: 'http://www.celebrationservices.com.au',
      order: 3,
    },
    {
      name: 'Boronia Hotel',
      supports: 'Club sponsor',
      url: 'https://boroniahotel.com.au/',
      order: 4,
    },
    {
      name: 'Cafe Brontos',
      supports: 'Club sponsor',
      url: 'https://cafebrontos.com.au/',
      order: 5,
    },
  ]
  for (const s of sponsorsSeed) {
    await upsertByField(payload, 'sponsors', 'name', s.name, {
      supports: s.supports,
      url: s.url,
      order: s.order,
      active: true,
    })
  }

  // 6. Forms --------------------------------------------------------------
  console.log('\n[6/8] Forms')

  const newPlayerEnquiryForm = await upsertByField(payload, 'forms', 'title', 'New player enquiry', {
    fields: [
      { blockType: 'text', name: 'parentName', label: 'Parent or guardian name', required: true },
      { blockType: 'email', name: 'email', label: 'Email', required: true },
      { blockType: 'text', name: 'phone', label: 'Phone', required: false },
      { blockType: 'text', name: 'playerName', label: "Player's name", required: true },
      {
        blockType: 'text',
        name: 'playerAge',
        label: "Player's age or age group",
        required: true,
      },
      {
        blockType: 'select',
        name: 'gender',
        label: 'Gender',
        required: false,
        options: [
          { label: 'Girl', value: 'girl' },
          { label: 'Boy', value: 'boy' },
          { label: 'Prefer not to say', value: 'prefer-not-to-say' },
        ],
      },
      {
        blockType: 'select',
        name: 'playedBefore',
        label: 'Played basketball before?',
        required: false,
        options: [
          { label: 'Never played', value: 'never-played' },
          { label: 'Played at another club', value: 'played-at-another-club' },
          { label: 'Returning Wildcat', value: 'returning-wildcat' },
        ],
      },
      {
        blockType: 'textarea',
        name: 'message',
        label: 'Anything else we should know?',
        required: false,
      },
    ],
    submitButtonLabel: 'Send enquiry',
    confirmationType: 'message',
    confirmationMessage: lex1(
      'Thanks, we have your enquiry. A coordinator will be in touch about team options for the season ahead.',
    ),
    emails: [
      {
        emailTo: 'IWantToPlay@basinwildcats.com',
        subject: 'New player enquiry from the website',
        message: lex1('{{*}}'),
      },
    ],
  })

  const contactUsForm = await upsertByField(payload, 'forms', 'title', 'Contact us', {
    fields: [
      { blockType: 'text', name: 'name', label: 'Name', required: true },
      { blockType: 'email', name: 'email', label: 'Email', required: true },
      { blockType: 'text', name: 'phone', label: 'Phone', required: false },
      { blockType: 'textarea', name: 'message', label: 'Message', required: true },
    ],
    submitButtonLabel: 'Send message',
    confirmationType: 'message',
    confirmationMessage: lex1(
      "Thanks for getting in touch. We'll get back to you as soon as we can.",
    ),
    emails: [
      {
        emailTo: 'secretary@basinwildcats.com',
        subject: 'New contact form message from the website',
        message: lex1('{{*}}'),
      },
    ],
  })

  const uniformNumberForm = await upsertByField(
    payload,
    'forms',
    'title',
    'Uniform number request',
    {
      fields: [
        { blockType: 'text', name: 'yourName', label: 'Your name', required: true },
        { blockType: 'text', name: 'playerName', label: "Player's name", required: true },
        {
          blockType: 'text',
          name: 'playerDateOfBirth',
          label: "Player's date of birth",
          required: true,
        },
        {
          blockType: 'select',
          name: 'gender',
          label: 'Gender',
          required: false,
          options: [
            { label: 'Girl', value: 'girl' },
            { label: 'Boy', value: 'boy' },
          ],
        },
        { blockType: 'email', name: 'email', label: 'Email', required: true },
        { blockType: 'text', name: 'phone', label: 'Phone', required: false },
        {
          blockType: 'textarea',
          name: 'otherInformation',
          label: 'Other information',
          required: false,
        },
      ],
      submitButtonLabel: 'Send request',
      confirmationType: 'message',
      confirmationMessage: lex1(
        'Thanks, your uniform number request is in. The committee will confirm your number shortly.',
      ),
      emails: [
        {
          emailTo: 'secretary@basinwildcats.com',
          subject: 'Uniform number request from the website',
          message: lex1('{{*}}'),
        },
      ],
    },
  )

  const volunteerForm = await upsertByField(payload, 'forms', 'title', 'Volunteer', {
    fields: [
      { blockType: 'text', name: 'name', label: 'Name', required: true },
      { blockType: 'email', name: 'email', label: 'Email', required: true },
      { blockType: 'text', name: 'phone', label: 'Phone', required: false },
      {
        blockType: 'select',
        name: 'role',
        label: 'What would you like to help with?',
        required: false,
        options: [
          { label: 'Coach', value: 'coach' },
          { label: 'Team manager', value: 'team-manager' },
          { label: 'Scorer', value: 'scorer' },
          { label: 'Grade secretary', value: 'grade-secretary' },
          { label: 'Committee', value: 'committee' },
          { label: 'Anything useful', value: 'anything-useful' },
        ],
      },
      { blockType: 'textarea', name: 'message', label: 'Message', required: false },
    ],
    submitButtonLabel: 'Send',
    confirmationType: 'message',
    confirmationMessage: lex1(
      "Thanks for putting your hand up. Someone from the committee will be in touch."
    ),
    emails: [
      {
        emailTo: 'secretary@basinwildcats.com',
        subject: 'New volunteer sign-up from the website',
        message: lex1('{{*}}'),
      },
    ],
  })

  // 7. Pages --------------------------------------------------------------
  console.log('\n[7/8] Pages')

  // --- Home ---------------------------------------------------------------
  await upsertPage(payload, 'home', {
    title: 'Home',
    hero: {
      type: 'club',
      eyebrow: 'Excellence in basketball since 1975',
      title: 'Pride of',
      titleKnock: 'the',
      titleAccent: 'Basin',
      richText: lex1(
        'The Basin Wildcats are a family basketball club in the Knox competition, with more than 70 teams across all ages and standards. Fifty seasons in, the idea has not changed: every kid gets a game.',
      ),
      links: [
        { link: customLink('Join the Wildcats', '/join') },
        { link: customLink('Our story', '/our-club') },
      ],
      media: media.heroPlayer.id,
      showStats: true,
      statsNote:
        'Winter and summer competitions across Knox. Home base: The Basin Primary School.',
    },
    layout: [
      {
        blockType: 'marquee',
        items: [
          { text: 'Excellence in Basketball', hollow: false },
          { text: 'Est. 1975', hollow: true },
          { text: 'Go Wildcats', hollow: false },
          { text: 'The Basin', hollow: true },
        ],
      },
      {
        blockType: 'statement',
        tabLabel: 'Our Club',
        statement: lex([
          [
            'Founded by ',
            { text: 'Dick Thomas', format: 1 },
            ' in 1975. Four hundred Wildcats later, ',
            { text: 'still family first.', format: 2 },
          ],
        ]),
        body: "We field more than 70 teams across the Knox and Kilsyth competitions, winter and summer. The Wildcats are a fun, family orientated club and a fantastic introduction to basketball, and plenty of our players have gone on to representative and state teams. Most of all, this is where local kids learn to love the game.",
        imageLeft: media.ball.id,
        imageRight: media.net.id,
      },
      {
        blockType: 'ticketGallery',
        title: 'Game day',
        titleHollow: 'moments',
        kicker:
          'Real Wildcats, real weekends: from under 8s huddles to game nights across the Knox district.',
        cards: [
          {
            image: media.photoGame.id,
            tag: 'Game Night',
            caption: 'Green and red in flight',
            sub: 'Knox competition, every weekend',
          },
          {
            image: media.photoCourt.id,
            tag: 'Juniors',
            caption: 'Hands in, Wildcats on three',
            sub: 'Our youngest squads before tip-off',
          },
          {
            image: media.photoClub.id,
            tag: 'The Club',
            caption: 'The green and red',
            sub: 'Worn with pride since 1975',
          },
        ],
      },
      {
        blockType: 'darkBand',
        title: 'Two seasons.',
        titleHollow: 'One club.',
        sub: 'Wildcats basketball runs all year. Registrations open ahead of each season, and new players can enquire at any time.',
        cards: [
          {
            title: 'Winter',
            accent: 'season',
            body: 'Domestic competition through the cooler months, with teams across all ages and standards.',
          },
          {
            title: 'Summer',
            accent: 'season',
            body: 'The summer competition keeps squads together and new friendships forming over the break.',
          },
          {
            title: 'Training',
            body: 'Home base is The Basin Primary School, with games played at venues across the Knox district.',
          },
        ],
        background: { video: media.netSwish.id, image: media.courtWide.id },
        showEyes: true,
      },
      {
        blockType: 'cardGrid',
        title: 'Pull on the',
        titleHollow: 'jersey',
        kicker:
          'Every Wildcat started with a hello. Tell us who wants to play and we will take it from there.',
        cards: [
          {
            tag: 'New players',
            title: 'First season',
            body: "Never played before? Perfect. Tell us your child's age and we will find the right team, the right coach and a fantastic introduction to basketball.",
            feature: true,
            hasLink: true,
            link: customLink('New player enquiry', '/join'),
          },
          {
            tag: 'Returning players',
            title: 'Back for more',
            body: 'Registrations open before each winter and summer season. Jump back in with your team and pick up where you left off.',
            feature: false,
            hasLink: true,
            link: customLink('Season information', '/season-information'),
          },
          {
            tag: 'Volunteers',
            title: 'Coaches and helpers',
            body: 'A family club runs on families. Coaches, team managers and scorers are always welcome on the Wildcats bench.',
            feature: false,
            hasLink: true,
            link: customLink('Get in touch', '/volunteer'),
          },
        ],
      },
      {
        blockType: 'ctaStrip',
        title: 'Ready to run with the Wildcats?',
        body: 'Fill in the new player enquiry and we will come back to you with team options for the season ahead.',
        tone: 'green',
        link: customLink('Join the Wildcats', '/join'),
      },
      {
        blockType: 'instagramFeed',
        title: 'Latest from the Wildcats',
        count: 8,
      },
      {
        blockType: 'sponsorGrid',
        title: 'Backed by local legends',
        source: 'all',
      },
    ],
    meta: {
      title: 'The Basin Wildcats Basketball Club | Excellence in Basketball since 1975',
      description:
        'The Basin Wildcats are a family basketball club in the Knox competition with more than 70 teams across all ages. Founded 1975. New players welcome every season.',
    },
  })

  // --- Our Club -------------------------------------------------------
  await upsertPage(payload, 'our-club', {
    title: 'Our Club',
    hero: {
      type: 'page',
      eyebrow: 'Since 1975',
      title: 'Our Club',
      richText: lex1(
        'The Basin Wildcats are a family basketball club in the Knox competition. Dick Thomas founded the club in 1975, and five decades on we field more than 70 teams a year across the Knox and Kilsyth competitions, winter and summer.',
      ),
    },
    layout: [
      {
        blockType: 'cardGrid',
        cards: [
          {
            title: 'History',
            body: "Fifty years of the Wildcats, from Dick Thomas's first side in 1975 to the club fielding more than 70 teams today.",
            hasLink: true,
            link: customLink('Read the history', '/history'),
          },
          {
            title: 'Committee',
            body: 'The volunteers who run the club week to week, and how to reach them.',
            hasLink: true,
            link: customLink('Meet the committee', '/committee'),
          },
          {
            title: 'Life Members',
            body: 'The Wildcats who have given the club decades of service.',
            hasLink: true,
            link: customLink('See the life members', '/life-members'),
          },
          {
            title: 'Awards',
            body: 'Trophies, sportsmanship prizes and the coaches award, presented every season.',
            hasLink: true,
            link: customLink('See the awards', '/awards'),
          },
        ],
      },
      {
        blockType: 'ctaStrip',
        title: 'Ready to join the Wildcats?',
        body: 'Fill in the new player enquiry and a coordinator will be in touch about team options.',
        tone: 'green',
        link: customLink('Join the Wildcats', '/join'),
      },
    ],
    meta: {
      title: 'Our Club | The Basin Wildcats Basketball Club',
      description:
        'The Basin Wildcats are a family basketball club in the Knox competition, founded in 1975 by Dick Thomas and still going strong with more than 70 teams a year.',
    },
  })

  // --- Join -------------------------------------------------------------
  await upsertPage(payload, 'join', {
    title: 'Join the Wildcats',
    hero: {
      type: 'page',
      eyebrow: 'New players welcome',
      title: 'Join the Wildcats',
      richText: lex1(
        'New to the Wildcats? Tell us about your child and we will match them with a team, a coach and a season of basketball they will love. Returning players are just as welcome: send your enquiry any time before the season starts.',
      ),
    },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: lex([
              [
                "Joining is simple. Send us an enquiry through the form below with your child's name and age, and one of our coordinators will call to talk through team options.",
              ],
              [
                'Team selections happen before each season at the State Basketball Centre, where new players are placed alongside kids of a similar age and standard. Once your child has a team, uniforms are ordered through The Print Shop, the club\'s official supplier.',
              ],
            ]),
          },
        ],
      },
      {
        blockType: 'formBlock',
        form: newPlayerEnquiryForm.id,
      },
      {
        blockType: 'cardGrid',
        title: 'While you wait',
        cards: [
          {
            title: 'Fees',
            body: 'What it costs to play a season with the Wildcats.',
            hasLink: true,
            link: customLink('See the fees', '/fees'),
          },
          {
            title: 'Season information',
            body: 'When each season runs and what to expect.',
            hasLink: true,
            link: customLink('Season information', '/season-information'),
          },
          {
            title: 'Training',
            body: 'Where and when Wildcats teams train each week.',
            hasLink: true,
            link: customLink('Training details', '/training'),
          },
          {
            title: 'Mini Cats',
            body: 'Our Under 8 program for kids just starting out.',
            hasLink: true,
            link: customLink('About Mini Cats', '/mini-cats'),
          },
        ],
      },
    ],
    meta: {
      title: 'Join the Wildcats | The Basin Wildcats Basketball Club',
      description:
        'New and returning players welcome. Send a new player enquiry and a Wildcats coordinator will be in touch about team options for the season ahead.',
    },
  })

  // --- Mini Cats ----------------------------------------------------------
  await upsertPage(payload, 'mini-cats', {
    title: 'Mini Cats',
    hero: {
      type: 'page',
      eyebrow: 'Our youngest players',
      title: 'Mini Cats',
      richText: lex1(
        "Mini Cats is the Wildcats' program for our youngest players, an easy first step into basketball for kids who are just starting out.",
      ),
    },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: lex([
              [
                'Mini Cats sessions are open to anyone in the Under 8 age group who wants to learn or develop the basics: dribbling, passing and their first shots, in a relaxed, come-and-try setting.',
              ],
              [
                'Session days and times are announced on Instagram and Facebook each season, so keep an eye on @thebasin.wildcats for the latest schedule rather than a fixed date here.',
              ],
            ]),
          },
        ],
      },
      {
        blockType: 'ctaStrip',
        title: 'Ready to give it a go?',
        body: 'Send through a new player enquiry and a coordinator will let you know when the next Mini Cats sessions kick off.',
        tone: 'green',
        link: customLink('Join the Wildcats', '/join'),
      },
    ],
    meta: {
      title: 'Mini Cats | The Basin Wildcats Basketball Club',
      description:
        "Mini Cats is the Wildcats' Under 8 program for kids learning the basics of basketball in a relaxed, come-and-try setting.",
    },
  })

  // --- Volunteer ----------------------------------------------------------
  await upsertPage(payload, 'volunteer', {
    title: 'Volunteers',
    hero: {
      type: 'page',
      eyebrow: 'Get involved',
      title: 'Volunteers',
      richText: lex1(
        'A family club runs on families. Every season the Wildcats rely on parents and members who step up as coaches, team managers, scorers and committee helpers.',
      ),
    },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: lex([
              [
                'Coaches lead training and run the bench on game day. Team managers keep a team organised week to week, from talking with parents to managing the scoring roster. Scorers keep the books at courtside, and committee members help run the club behind the scenes.',
              ],
              [
                'One role the club always needs filled is grade secretary, who attends grading games each season so every team lands in the right grade. Knox Basketball requires each club to supply volunteers for this, and the Wildcats could not run without the people who put their hands up.',
              ],
            ]),
          },
        ],
      },
      {
        blockType: 'formBlock',
        form: volunteerForm.id,
      },
    ],
    meta: {
      title: 'Volunteers | The Basin Wildcats Basketball Club',
      description:
        'Coaches, team managers, scorers and committee helpers keep the Wildcats running. Find out how to get involved.',
    },
  })

  // --- Members -------------------------------------------------------------
  await upsertPage(payload, 'members', {
    title: 'Members',
    hero: {
      type: 'page',
      eyebrow: 'Members hub',
      title: 'Members',
      richText: lex1(
        'Everything Wildcats members need in one place: policies, uniforms, member information and how to stay in touch.',
      ),
    },
    layout: [
      {
        blockType: 'cardGrid',
        cards: [
          {
            title: 'Policies',
            body: "The club's policies and codes of conduct, in one place.",
            hasLink: true,
            link: customLink('Read the policies', '/policies'),
          },
          {
            title: 'Uniform and merchandise',
            body: 'How to order a uniform number and where to buy club merchandise.',
            hasLink: true,
            link: customLink('Uniform and merchandise', '/uniform-and-merchandise'),
          },
          {
            title: 'Member information',
            body: 'Season details, fixtures and everything else members ask about.',
            hasLink: true,
            link: customLink('Member information', '/member-information'),
          },
          {
            title: 'Team managers and coaches',
            body: 'Resources for the volunteers who run our teams.',
            hasLink: true,
            link: customLink('Team managers and coaches', '/team-managers-and-coaches'),
          },
          {
            title: 'Social',
            body: 'Find the Wildcats on Instagram and Facebook.',
            hasLink: true,
            link: customLink('See our social', '/social'),
          },
        ],
      },
      {
        blockType: 'contactCards',
        title: 'Committee contacts',
        source: 'settings',
      },
    ],
    meta: {
      title: 'Members | The Basin Wildcats Basketball Club',
      description:
        'Policies, uniforms, member information and how Wildcats members stay in touch, all in one place.',
    },
  })

  // --- Team Managers and Coaches --------------------------------------------
  await upsertPage(payload, 'team-managers-and-coaches', {
    title: 'Team Managers and Coaches',
    hero: {
      type: 'page',
      eyebrow: 'Run the team',
      title: 'Team Managers and Coaches',
      richText: lex1(
        'Every Wildcats team is built around a coach and a team manager. This is where both find what they need.',
      ),
    },
    layout: [
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: lex1(
              "Each team needs a nominated team manager who is not a relative or partner of the coach, so there is always a second point of contact for the club. The team manager is the committee's main contact for the team: fixtures, scoring rosters, communication with parents and uniform coordination all run through them.",
            ),
          },
        ],
      },
      {
        blockType: 'cardGrid',
        cards: [
          {
            title: 'Team managers',
            body: 'What the role involves and where to find the paperwork.',
            hasLink: true,
            link: customLink('Team manager information', '/team-managers'),
          },
          {
            title: 'Coaches',
            body: 'Drills, plans and resources for the Wildcats bench.',
            hasLink: true,
            link: customLink('Coaching resources', '/coaches'),
          },
          {
            title: 'Club papers',
            body: 'AGM minutes and reports.',
            hasLink: true,
            link: customLink('Club papers', '/club-papers'),
          },
        ],
      },
      {
        blockType: 'documentList',
        title: 'Resources',
        mode: 'category',
        categories: ['team-managers', 'coaching'],
      },
    ],
    meta: {
      title: 'Team Managers and Coaches | The Basin Wildcats Basketball Club',
      description:
        'Resources and information for the coaches and team managers who run every Wildcats team.',
    },
  })

  // --- Gallery ---------------------------------------------------------
  await upsertPage(payload, 'gallery', {
    title: 'Gallery',
    hero: {
      type: 'page',
      eyebrow: 'Game day',
      title: 'Gallery',
      richText: lex1(
        'Real Wildcats, real weekends: moments from training, game day and everything in between.',
      ),
    },
    layout: [
      {
        blockType: 'ticketGallery',
        title: 'Game day',
        titleHollow: 'moments',
        kicker:
          'Real Wildcats, real weekends: from under 8s huddles to game nights across the Knox district.',
        cards: [
          {
            image: media.photoGame.id,
            tag: 'Game Night',
            caption: 'Green and red in flight',
            sub: 'Knox competition, every weekend',
          },
          {
            image: media.photoCourt.id,
            tag: 'Juniors',
            caption: 'Hands in, Wildcats on three',
            sub: 'Our youngest squads before tip-off',
          },
          {
            image: media.photoClub.id,
            tag: 'The Club',
            caption: 'The green and red',
            sub: 'Worn with pride since 1975',
          },
        ],
      },
      {
        blockType: 'instagramFeed',
        title: 'Latest from the Wildcats',
        count: 12,
      },
    ],
    meta: {
      title: 'Gallery | The Basin Wildcats Basketball Club',
      description: 'Photos from Wildcats training, game day and everything in between.',
    },
  })

  // --- Social ------------------------------------------------------------
  await upsertPage(payload, 'social', {
    title: 'Wildcats on social',
    hero: {
      type: 'page',
      eyebrow: 'Follow along',
      title: 'Wildcats on social',
      richText: lex1(
        'Follow the Wildcats on Instagram and Facebook for team news, photos and season updates.',
      ),
    },
    layout: [
      {
        blockType: 'instagramFeed',
        title: 'Latest from the Wildcats',
        count: 12,
      },
      {
        blockType: 'facebookPage',
        title: 'Find us on Facebook',
        height: 600,
      },
    ],
    meta: {
      title: 'Wildcats on Social | The Basin Wildcats Basketball Club',
      description:
        'Follow the Basin Wildcats on Instagram and Facebook for team news, photos and season updates.',
    },
  })

  // --- Sponsors ------------------------------------------------------------
  await upsertPage(payload, 'sponsors', {
    title: 'Our Sponsors',
    hero: {
      type: 'page',
      eyebrow: 'Thank you',
      title: 'Our Sponsors',
      richText: lex1(
        'The Wildcats could not run without the support of local businesses. Thank you to every sponsor backing the club this season.',
      ),
    },
    layout: [
      {
        blockType: 'sponsorGrid',
        title: 'Backed by local legends',
        source: 'all',
        showBlurbs: true,
      },
      {
        blockType: 'ctaStrip',
        title: 'Sponsor the Wildcats',
        body: 'Get your business behind a 400-member family club. Reach out and we will talk through what sponsorship looks like.',
        tone: 'ink',
        link: customLink('Become a sponsor', 'mailto:sponsorship@basinwildcats.com'),
      },
    ],
    meta: {
      title: 'Our Sponsors | The Basin Wildcats Basketball Club',
      description:
        'Meet the local businesses backing the Basin Wildcats, and find out how your business can support the club.',
    },
  })

  // --- Contact ------------------------------------------------------------
  await upsertPage(payload, 'contact', {
    title: 'Contact',
    hero: {
      type: 'page',
      eyebrow: 'Get in touch',
      title: 'Contact',
      richText: lex1(
        "Get in touch with the Wildcats committee, or find your team's fixtures for the week.",
      ),
    },
    layout: [
      {
        blockType: 'contactCards',
        title: 'Get in touch',
        source: 'settings',
      },
      {
        blockType: 'formBlock',
        form: contactUsForm.id,
      },
      {
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: lex1(
              'Our home base and main training venue is The Basin Primary School. For fixtures and results, check the Knox Basketball website or the SportsTG / GameDay app, which the league uses for all draws and scores.',
            ),
          },
        ],
      },
    ],
    meta: {
      title: 'Contact | The Basin Wildcats Basketball Club',
      description:
        "Get in touch with the Basin Wildcats committee, or find your team's fixtures for the week.",
    },
  })

  // Uniform number request form is not yet placed on a page (the
  // Uniform and merchandise page is out of scope for this seed, per the
  // brief's do-not-create list); the form document exists so that page
  // can reference it once another agent builds it.
  void uniformNumberForm

  // 8. Categories ------------------------------------------------------------
  console.log('\n[8/8] Categories')
  for (const title of ['Club news', 'Season updates', 'AGM']) {
    await upsertByField(payload, 'categories', 'title', title, {})
  }

  console.log('\nSeed complete.')

  // Close the Postgres pool explicitly. `payload run` tears the process down
  // with its own process.exit(0) the instant this module's dynamic import()
  // resolves, which happens as soon as top-level evaluation finishes -- so
  // this script relies on a top-level `await main()` below (not a floating
  // `main().catch()`) to make sure that import() doesn't resolve, and the
  // process doesn't get killed, until all of this async work is done.
  const db = (payload as unknown as { db?: { destroy?: () => Promise<void> } }).db
  if (db?.destroy) await db.destroy()
}

try {
  await main()
} catch (err) {
  console.error('Seed failed:', err)
  process.exitCode = 1
}
