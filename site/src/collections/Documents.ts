import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { editorOrAdmin } from '@/access/editorOrAdmin'

/**
 * Club documents: policies, codes of conduct, coaching resources, team manager
 * information, AGM papers, certificates. Uploaded once, listed anywhere through
 * the Document List block.
 */
export const documentCategories = [
  { label: 'Policies', value: 'policies' },
  { label: 'Codes of conduct', value: 'codes-of-conduct' },
  { label: 'Coaching resources', value: 'coaching' },
  { label: 'Team manager resources', value: 'team-managers' },
  { label: 'Player information', value: 'players' },
  { label: 'Club papers and AGM', value: 'club-papers' },
  { label: 'Certificates', value: 'certificates' },
  { label: 'Forms', value: 'forms' },
  { label: 'Other', value: 'other' },
]

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents' },
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: anyone,
    update: editorOrAdmin,
  },
  admin: {
    group: 'Club',
    defaultColumns: ['title', 'category', 'season', 'superseded', 'updatedAt'],
    useAsTitle: 'title',
    description:
      'PDFs and Word files for members, coaches and team managers. Tick "superseded" instead of deleting an old version.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: documentCategories,
      admin: { position: 'sidebar' },
    },
    {
      name: 'season',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'For example "Winter 2026". Leave blank for evergreen documents.',
      },
    },
    {
      name: 'superseded',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Hide from public lists but keep the file on record.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'One or two lines shown under the title in lists.' },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Original file location on the old WordPress site, if migrated.',
      },
    },
  ],
  upload: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
    ],
  },
}
