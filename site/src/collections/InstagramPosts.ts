import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { adminOnly } from '@/access/adminOnly'

/**
 * Cached copy of the club's latest Instagram posts. Filled by the
 * /api/cron/instagram route (ScrapeCreators pull, images copied to Blob).
 * Read-only in the admin so nobody edits what Instagram owns.
 */
export const InstagramPosts: CollectionConfig = {
  slug: 'instagram-posts',
  labels: { singular: 'Instagram post', plural: 'Instagram posts' },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: anyone,
    update: adminOnly,
  },
  admin: {
    group: 'Social',
    defaultColumns: ['shortcode', 'mediaType', 'takenAt', 'hidden'],
    useAsTitle: 'shortcode',
    description: 'Refreshed automatically every six hours. Tick "hidden" to keep a post off the site.',
  },
  defaultSort: '-takenAt',
  fields: [
    { name: 'shortcode', type: 'text', required: true, unique: true, index: true },
    { name: 'permalink', type: 'text', required: true },
    { name: 'caption', type: 'textarea' },
    {
      name: 'mediaType',
      type: 'select',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Carousel', value: 'carousel' },
      ],
    },
    { name: 'takenAt', type: 'date', index: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'likeCount', type: 'number' },
    { name: 'commentCount', type: 'number' },
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      access: { update: () => true },
      admin: { position: 'sidebar' },
    },
    { name: 'raw', type: 'json', admin: { hidden: true } },
  ],
}
