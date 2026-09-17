import type { Block } from 'payload'
import { link } from '@/fields/link'

export const CtaStrip: Block = {
  slug: 'ctaStrip',
  interfaceName: 'CtaStripBlock',
  labels: { singular: 'Call to action strip', plural: 'Call to action strips' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'body', type: 'textarea' },
    {
      name: 'tone',
      type: 'select',
      defaultValue: 'green',
      options: [
        { label: 'Green', value: 'green' },
        { label: 'Red', value: 'red' },
        { label: 'Ink', value: 'ink' },
      ],
    },
    link({ appearances: false }),
  ],
}
