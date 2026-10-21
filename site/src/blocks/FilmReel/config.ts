import type { Block } from 'payload'

export const FilmReel: Block = {
  slug: 'filmReel',
  interfaceName: 'FilmReelBlock',
  labels: { singular: 'Film reel', plural: 'Film reels' },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'Game day' },
    { name: 'titleHollow', type: 'text', label: 'Outlined word(s)', defaultValue: 'moments' },
    { name: 'kicker', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'includeReels',
          type: 'checkbox',
          defaultValue: true,
          label: 'Add the latest Instagram reels',
          admin: { description: 'New reels join the strip on their own after each Instagram refresh.' },
        },
        {
          name: 'reelCount',
          type: 'number',
          defaultValue: 6,
          min: 1,
          max: 12,
          admin: { condition: (_, siblingData) => siblingData?.includeReels !== false },
        },
      ],
    },
    {
      name: 'frames',
      type: 'array',
      label: 'Club photos',
      maxRows: 16,
      admin: {
        description: 'Photos for the strip. Reels are mixed in between them, newest first.',
      },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'caption',
          type: 'text',
          required: true,
          admin: { description: 'A few words, printed along the film edge. Used as alt text when the photo has none.' },
        },
      ],
    },
  ],
}
