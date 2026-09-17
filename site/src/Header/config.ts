import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { editorOrAdmin } from '@/access/editorOrAdmin'
import { revalidateHeader } from './hooks/revalidateHeader'

/**
 * Main navigation. Top-level items with children open a mega menu: an intro
 * column (blurb and photo) beside a grid of child links, each with a small
 * graphic and one line of helper text. Items without children are plain links.
 */
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
          name: 'panel',
          type: 'group',
          label: 'Mega menu intro',
          admin: { description: 'Shown in the left column when this item has dropdown items.' },
          fields: [
            { name: 'blurb', type: 'textarea', admin: { description: 'One or two sentences.' } },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Photo' },
          ],
        },
        {
          name: 'children',
          type: 'array',
          label: 'Dropdown items',
          fields: [
            link({ appearances: false }),
            {
              name: 'description',
              type: 'text',
              label: 'Helper text',
              admin: { description: 'One short line under the link, for example "Season fees, family discounts, how to pay."' },
            },
            { name: 'image', type: 'upload', relationTo: 'media', label: 'Graphic' },
          ],
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
