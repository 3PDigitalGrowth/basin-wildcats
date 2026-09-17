import type { GlobalConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'
import { revalidateTag } from 'next/cache'

/**
 * Club-wide settings the committee changes without touching a page:
 * contact addresses, social links, the announcement bar, season dates.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: {
    read: () => true,
    update: editorOrAdmin,
  },
  admin: { group: 'Club' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Club',
          fields: [
            { name: 'clubName', type: 'text', defaultValue: 'The Basin Wildcats Basketball Club' },
            { name: 'shortName', type: 'text', defaultValue: 'Basin Wildcats' },
            { name: 'tagline', type: 'text', defaultValue: 'Excellence in basketball since 1975' },
            {
              name: 'homeBase',
              type: 'text',
              defaultValue: 'The Basin Primary School',
              admin: { description: 'Home base and training venue.' },
            },
            { name: 'founded', type: 'number', defaultValue: 1975 },
            {
              name: 'stats',
              type: 'array',
              label: 'Homepage stat chips',
              maxRows: 3,
              admin: { description: 'Real club numbers only.' },
              fields: [
                { name: 'value', type: 'number', required: true },
                { name: 'suffix', type: 'text', admin: { description: 'For example "+"' } },
                { name: 'label', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'generalEmail',
              type: 'email',
              label: 'General enquiries email',
              admin: { description: 'Receives contact form and new player enquiries.' },
            },
            {
              name: 'ordersEmail',
              type: 'email',
              label: 'Shop orders email',
              admin: { description: 'Receives a copy of every shop order.' },
            },
            {
              name: 'contacts',
              type: 'array',
              label: 'Committee contacts',
              fields: [
                { name: 'role', type: 'text', required: true },
                { name: 'name', type: 'text' },
                { name: 'email', type: 'email' },
                { name: 'phone', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            { name: 'instagramHandle', type: 'text', defaultValue: 'thebasin.wildcats' },
            { name: 'facebookUrl', type: 'text', label: 'Facebook page URL' },
            {
              name: 'facebookGroupUrl',
              type: 'text',
              label: 'Members Facebook group URL',
              admin: { description: 'Private group. Shown as a "request to join" link.' },
            },
            { name: 'youtubeUrl', type: 'text' },
          ],
        },
        {
          label: 'Announcement',
          fields: [
            {
              name: 'announcement',
              type: 'group',
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: false },
                { name: 'text', type: 'text' },
                { name: 'linkLabel', type: 'text' },
                { name: 'linkUrl', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      ({ req: { context } }) => {
        if (!context.disableRevalidate) revalidateTag('global_site-settings', 'max')
      },
    ],
  },
}
