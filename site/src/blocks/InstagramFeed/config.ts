import type { Block } from 'payload'

export const InstagramFeed: Block = {
  slug: 'instagramFeed',
  interfaceName: 'InstagramFeedBlock',
  labels: { singular: 'Instagram feed', plural: 'Instagram feeds' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Latest from the Wildcats' },
    { name: 'kicker', type: 'textarea' },
    { name: 'count', type: 'number', defaultValue: 8, min: 3, max: 12 },
    {
      name: 'excludeReels',
      type: 'checkbox',
      defaultValue: false,
      label: 'Leave out reels',
      admin: { description: 'Tick when a film reel on the same page already plays them.' },
    },
  ],
}
