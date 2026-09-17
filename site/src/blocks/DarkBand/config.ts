import type { Block } from 'payload'

export const DarkBand: Block = {
  slug: 'darkBand',
  interfaceName: 'DarkBandBlock',
  labels: { singular: 'Dark band', plural: 'Dark bands' },
  fields: [
    { name: 'title', type: 'text', required: true, defaultValue: 'Two seasons.' },
    { name: 'titleHollow', type: 'text', label: 'Outlined word(s)', defaultValue: 'One club.' },
    { name: 'sub', type: 'textarea' },
    {
      name: 'cards',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'accent', type: 'text', label: 'Coloured word' },
        { name: 'body', type: 'textarea' },
      ],
    },
    {
      name: 'background',
      type: 'group',
      fields: [
        {
          name: 'video',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Optional MP4 loop. A still image is always served under 768px.' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Still image (poster and mobile fallback)',
        },
      ],
    },
    { name: 'showEyes', type: 'checkbox', defaultValue: true, label: 'Show the wildcat eyes motif' },
  ],
}
