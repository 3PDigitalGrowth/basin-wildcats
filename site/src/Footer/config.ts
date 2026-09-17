import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { editorOrAdmin } from '@/access/editorOrAdmin'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: editorOrAdmin,
  },
  admin: { group: 'Club' },
  fields: [
    {
      name: 'blurb',
      type: 'textarea',
      admin: { description: 'Two or three sentences under the logo.' },
    },
    {
      name: 'columns',
      type: 'array',
      maxRows: 3,
      fields: [
        { name: 'heading', type: 'text', required: true },
        {
          name: 'navItems',
          type: 'array',
          fields: [link({ appearances: false })],
          maxRows: 8,
          admin: {
            initCollapsed: true,
            components: {
              RowLabel: '@/Footer/RowLabel#RowLabel',
            },
          },
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
