import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { editorOrAdmin } from '@/access/editorOrAdmin'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Navigation',
  access: {
    read: () => true,
    update: editorOrAdmin,
  },
  admin: { group: 'Club' },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Main menu',
      fields: [
        link({ appearances: false }),
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown items',
          fields: [link({ appearances: false })],
          admin: { initCollapsed: true },
        },
      ],
      maxRows: 7,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'cta',
      type: 'group',
      label: 'Header button',
      fields: [link({ appearances: false })],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
