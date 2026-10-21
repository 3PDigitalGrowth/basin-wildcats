import type { Block } from 'payload'
import { link } from '@/fields/link'

export const quickLinkIconOptions = [
  { label: 'Singlet (join)', value: 'singlet' },
  { label: 'People (committee)', value: 'people' },
  { label: 'Megaphone (news)', value: 'megaphone' },
  { label: 'Hoodie (shop)', value: 'hoodie' },
  { label: 'Whistle (volunteers)', value: 'whistle' },
  { label: 'Basketball', value: 'ball' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Document', value: 'document' },
]

export const QuickLinks: Block = {
  slug: 'quickLinks',
  interfaceName: 'QuickLinksBlock',
  labels: { singular: 'Quick links', plural: 'Quick links' },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Optional small label above the links.' },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              type: 'select',
              required: true,
              defaultValue: 'ball',
              options: quickLinkIconOptions,
            },
            { name: 'label', type: 'text', required: true },
          ],
        },
        {
          name: 'helper',
          type: 'text',
          admin: { description: 'One short line under the label.' },
        },
        {
          name: 'showLatestNews',
          type: 'checkbox',
          defaultValue: false,
          label: 'Show the latest news headline instead of the helper line',
        },
        link({ appearances: false, disableLabel: true }),
      ],
    },
  ],
}
