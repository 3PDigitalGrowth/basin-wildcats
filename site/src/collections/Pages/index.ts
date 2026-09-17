import type { CollectionConfig } from 'payload'

import { editorOrAdmin } from '../../access/editorOrAdmin'
import { editorOrAdminOrPublished } from '../../access/editorOrAdminOrPublished'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { CardGrid } from '../../blocks/CardGrid/config'
import { ContactCards } from '../../blocks/ContactCards/config'
import { Content } from '../../blocks/Content/config'
import { CtaStrip } from '../../blocks/CtaStrip/config'
import { DarkBand } from '../../blocks/DarkBand/config'
import { DocumentList } from '../../blocks/DocumentList/config'
import { Embed } from '../../blocks/Embed/config'
import { FacebookPage } from '../../blocks/FacebookPage/config'
import { FormBlock } from '../../blocks/Form/config'
import { ImageText } from '../../blocks/ImageText/config'
import { InstagramFeed } from '../../blocks/InstagramFeed/config'
import { Marquee } from '../../blocks/Marquee/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { ProductGrid } from '../../blocks/ProductGrid/config'
import { SponsorGrid } from '../../blocks/SponsorGrid/config'
import { Statement } from '../../blocks/Statement/config'
import { Table } from '../../blocks/Table/config'
import { TicketGallery } from '../../blocks/TicketGallery/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

/** Every section an editor can drop onto a page, in the order they appear in the picker. */
export const pageBlocks = [
  Content,
  ImageText,
  MediaBlock,
  CardGrid,
  CtaStrip,
  Statement,
  TicketGallery,
  DarkBand,
  Marquee,
  DocumentList,
  ContactCards,
  Table,
  FormBlock,
  Archive,
  InstagramFeed,
  FacebookPage,
  SponsorGrid,
  ProductGrid,
  Embed,
  CallToAction,
]

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: editorOrAdminOrPublished,
    update: editorOrAdmin,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    group: 'Content',
    defaultColumns: ['title', 'slug', 'parent', '_status', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: pageBlocks,
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        position: 'sidebar',
        description: 'Groups this page under a section in the admin list. Does not change the URL.',
      },
      filterOptions: ({ id }) => ({ id: { not_equals: id } }),
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
