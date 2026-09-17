import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { editorOrAdmin } from '../access/editorOrAdmin'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: anyone,
    update: editorOrAdmin,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
  ],
}
