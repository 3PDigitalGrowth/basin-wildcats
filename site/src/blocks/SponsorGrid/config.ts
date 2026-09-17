import type { Block } from 'payload'

export const SponsorGrid: Block = {
  slug: 'sponsorGrid',
  interfaceName: 'SponsorGridBlock',
  labels: { singular: 'Sponsor grid', plural: 'Sponsor grids' },
  fields: [
    { name: 'title', type: 'text', defaultValue: 'Backed by local legends' },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'All active sponsors', value: 'all' },
        { label: 'Chosen sponsors', value: 'selected' },
      ],
    },
    {
      name: 'sponsors',
      type: 'relationship',
      relationTo: 'sponsors',
      hasMany: true,
      admin: { condition: (_, siblingData) => siblingData?.source === 'selected' },
    },
    { name: 'showBlurbs', type: 'checkbox', defaultValue: false, label: 'Show sponsor descriptions' },
  ],
}
