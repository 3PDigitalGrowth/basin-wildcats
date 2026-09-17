/**
 * Fill the mega menu: intro blurb and photo per section, helper text and a
 * graphic per dropdown item. Idempotent: matches items by label and only
 * touches the header global. Run: pnpm payload run src/scripts/seed-menu.ts
 */
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type Child = { label: string; description: string; image: string }
type Section = { label: string; blurb: string; image: string; children: Child[] }

const sections: Section[] = [
  {
    label: 'Our Club',
    blurb: 'A family basketball club in the Knox competition since 1975. Seventy-plus teams, one home.',
    image: 'photo-club.webp',
    children: [
      { label: 'History', description: 'Founded in 1975 by Dick Thomas. Fifty seasons of Wildcats.', image: 'est-1975.png' },
      { label: 'Committee', description: 'Who runs the club and how to reach them.', image: 'bwccommit.jpg' },
      { label: 'Life Members', description: 'The people who built the club, honoured for life.', image: 'Life-member-1.jpg' },
      { label: 'Awards', description: 'Club awards and how they are decided.', image: 'wilcats-picture-1.jpg' },
      { label: 'Sponsors', description: 'The local businesses behind the green and red.', image: 'photo-game.jpg' },
    ],
  },
  {
    label: 'Play',
    blurb: 'Everything a player and their family needs for the season ahead, from first enquiry to game day.',
    image: 'photo-court.jpg',
    children: [
      { label: 'Join the Wildcats', description: 'New player enquiry. We find the right team.', image: 'photo-court.jpg' },
      { label: 'Fees', description: 'Season fees, family discounts, how to pay.', image: 'ball.jpg' },
      { label: 'Season information', description: 'Winter and summer seasons, grading rounds, game days.', image: 'court-wide.jpg' },
      { label: 'Training', description: 'Training nights and the child supervision policy.', image: 'bwch01.jpg' },
      { label: 'Game venues', description: 'Where Knox games are played, and stadium entry.', image: 'wilcats-picture-4.jpg' },
      { label: 'Mini Cats', description: 'Under 8 skills sessions for kids starting out.', image: 'ig-DdGrxWYipaq.jpg' },
    ],
  },
  {
    label: 'Members',
    blurb: 'Policies, uniforms and the practical details for current Wildcats families.',
    image: 'net.jpg',
    children: [
      { label: 'Policies', description: 'Codes of conduct and club policies, all on one page.', image: 'net.jpg' },
      { label: 'Uniform and merchandise', description: 'Request a number, order a singlet, grab a hoodie.', image: 'grey-hoodie.jpg' },
      { label: 'Member information', description: 'Communication, fixtures, injuries and the finer details.', image: 'wilcats-picture-3.jpg' },
      { label: 'Social', description: 'Instagram, Facebook and the members group.', image: 'ig-DdP_gsiI51r.jpg' },
    ],
  },
  {
    label: 'Team Managers and Coaches',
    blurb: 'Resources for the volunteers who run each team, from scoring rosters to drill libraries.',
    image: 'bwch02.jpg',
    children: [
      { label: 'Team managers', description: 'Responsibilities, scoring rosters and resources.', image: 'wilcats-picture-2.jpg' },
      { label: 'Coaches', description: 'OneClub resources, drills and the coaching handbook.', image: 'bwch02.jpg' },
      { label: 'Club papers', description: 'AGM minutes, reports and treasurer summaries.', image: 'history.jpg' },
    ],
  },
]

async function main() {
  const payload = await getPayload({ config: configPromise })

  const media = await payload.find({ collection: 'media', limit: 200, depth: 0, pagination: false })
  const idByName = new Map(media.docs.map((m) => [m.filename || '', m.id]))
  const pick = (name: string) => {
    const id = idByName.get(name)
    if (!id) console.warn(`[seed-menu] media not found: ${name}`)
    return id
  }

  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  const navItems = (header.navItems || []).map((item) => {
    const section = sections.find((s) => s.label === item.link?.label)
    if (!section) return item
    return {
      ...item,
      panel: { blurb: section.blurb, image: pick(section.image) },
      children: (item.children || []).map((child) => {
        const c = section.children.find((x) => x.label === child.link?.label)
        return c ? { ...child, description: c.description, image: pick(c.image) } : child
      }),
    }
  })

  await payload.updateGlobal({
    slug: 'header',
    data: { navItems },
    context: { disableRevalidate: true },
  })
  console.log(`[seed-menu] updated ${navItems.length} menu items`)
  await payload.db.destroy?.()
}

try {
  await main()
} catch (err) {
  console.error(err)
  process.exitCode = 1
}
