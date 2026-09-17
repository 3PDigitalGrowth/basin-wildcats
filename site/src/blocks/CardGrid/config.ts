import type { Block } from 'payload'
import { link } from '@/fields/link'

export const CardGrid: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  labels: { singular: 'Card grid', plural: 'Card grids' },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'titleHollow', type: 'text', label: 'Outlined word(s)' },
    { name: 'kicker', type: 'textarea' },
    {
      name: 'cards',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'tag', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea' },
        { name: 'feature', type: 'checkbox', defaultValue: false, label: 'Dark feature card' },
        { name: 'hasLink', type: 'checkbox', defaultValue: true, label: 'Show a button' },
        link({
          appearances: false,
          overrides: { admin: { condition: (_, siblingData) => siblingData?.hasLink !== false } },
        }),
      ],
    },
  ],
}
