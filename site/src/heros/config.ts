import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

/**
 * Two hero types.
 *  - club: the approved homepage hero (dark card, condensed display type, player cutout, stat chips)
 *  - page: a compact dark card for inner pages (eyebrow, title, kicker, optional image)
 */
export const hero: Field = {
  name: 'hero',
  type: 'group',
  label: false,
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'page',
      label: 'Type',
      required: true,
      options: [
        { label: 'None', value: 'none' },
        { label: 'Club homepage hero', value: 'club' },
        { label: 'Page hero', value: 'page' },
      ],
    },
    {
      name: 'eyebrow',
      type: 'text',
      admin: { condition: (_, { type } = {}) => type !== 'none' },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title (first line)',
      admin: { condition: (_, { type } = {}) => type !== 'none' },
    },
    {
      name: 'titleKnock',
      type: 'text',
      label: 'Outlined word',
      admin: {
        condition: (_, { type } = {}) => type === 'club',
        description: 'Second line, drawn as an outline. For example "the".',
      },
    },
    {
      name: 'titleAccent',
      type: 'text',
      label: 'Red word',
      admin: {
        condition: (_, { type } = {}) => type === 'club',
        description: 'Second line, in red. For example "Basin".',
      },
    },
    {
      name: 'richText',
      type: 'richText',
      label: 'Intro',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      admin: { condition: (_, { type } = {}) => type !== 'none' },
    },
    linkGroup({
      overrides: {
        maxRows: 2,
        admin: { condition: (_, { type } = {}) => type !== 'none' },
      },
    }),
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
      admin: {
        condition: (_, { type } = {}) => type !== 'none',
        description:
          'Club hero: a cut-out player on a transparent background. Page hero: any photo.',
      },
    },
    {
      name: 'showStats',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show the stat chips from Site settings',
      admin: { condition: (_, { type } = {}) => type === 'club' },
    },
    {
      name: 'statsNote',
      type: 'text',
      admin: { condition: (_, { type } = {}) => type === 'club' },
    },
  ],
}
