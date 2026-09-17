import type { Block } from 'payload'

export const Marquee: Block = {
  slug: 'marquee',
  interfaceName: 'MarqueeBlock',
  labels: { singular: 'Marquee strip', plural: 'Marquee strips' },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      defaultValue: [
        { text: 'Excellence in Basketball', hollow: false },
        { text: 'Est. 1975', hollow: true },
        { text: 'Go Wildcats', hollow: false },
        { text: 'The Basin', hollow: true },
      ],
      fields: [
        { name: 'text', type: 'text', required: true },
        { name: 'hollow', type: 'checkbox', defaultValue: false, label: 'Outline style' },
      ],
    },
  ],
}
