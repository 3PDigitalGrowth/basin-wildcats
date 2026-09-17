import type { Block } from 'payload'
import { documentCategories } from '@/collections/Documents'

export const DocumentList: Block = {
  slug: 'documentList',
  interfaceName: 'DocumentListBlock',
  labels: { singular: 'Document list', plural: 'Document lists' },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'intro', type: 'textarea' },
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'category',
      options: [
        { label: 'Every document in chosen categories', value: 'category' },
        { label: 'Chosen documents', value: 'selected' },
      ],
    },
    {
      name: 'categories',
      type: 'select',
      hasMany: true,
      options: documentCategories,
      admin: { condition: (_, siblingData) => siblingData?.mode === 'category' },
    },
    {
      name: 'documents',
      type: 'relationship',
      relationTo: 'documents',
      hasMany: true,
      admin: { condition: (_, siblingData) => siblingData?.mode === 'selected' },
    },
    {
      name: 'showSuperseded',
      type: 'checkbox',
      defaultValue: false,
      label: 'Include superseded documents',
    },
  ],
}
