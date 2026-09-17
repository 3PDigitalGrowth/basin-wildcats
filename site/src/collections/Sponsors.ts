import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { editorOrAdmin } from '@/access/editorOrAdmin'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: anyone,
    update: editorOrAdmin,
  },
  admin: {
    group: 'Club',
    defaultColumns: ['name', 'supports', 'active', 'order'],
    useAsTitle: 'name',
    description: 'Club sponsors shown on the homepage strip and the Sponsors page.',
  },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'supports',
      type: 'text',
      label: 'What they sponsor',
      admin: { description: 'For example "Warm up tops" or "Club sponsor".' },
    },
    { name: 'url', type: 'text', label: 'Website' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'blurb', type: 'textarea' },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers show first.' },
    },
  ],
}
