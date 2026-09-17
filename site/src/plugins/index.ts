import { ecommercePlugin } from '@payloadcms/plugin-ecommerce'
import { stripeAdapter } from '@payloadcms/plugin-ecommerce/payments/stripe'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Plugin } from 'payload'

import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrPublishedStatus } from '@/access/adminOrPublishedStatus'
import { customerOnlyFieldAccess } from '@/access/customerOnlyFieldAccess'
import { editorOrAdmin } from '@/access/editorOrAdmin'
import { isAdmin } from '@/access/isAdmin'
import { isDocumentOwner } from '@/access/isDocumentOwner'
import { ProductsCollection } from '@/collections/Products'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { Page, Post } from '@/payload-types'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'
import { getServerSideURL } from '@/utilities/getURL'

const SITE_NAME = 'The Basin Wildcats Basketball Club'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | ${SITE_NAME}` : SITE_NAME
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const AUD = {
  code: 'AUD',
  decimals: 2,
  label: 'Australian Dollar',
  symbol: '$',
}

export const plugins: Plugin[] = [
  vercelBlobStorage({
    collections: {
      // Public files: serve straight from the Blob CDN instead of through /api/media/file.
      media: { disablePayloadAccessControl: true },
      documents: { disablePayloadAccessControl: true },
    },
    token: process.env.BLOB_READ_WRITE_TOKEN,
  }),
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      admin: { group: 'Club' },
      access: {
        create: editorOrAdmin,
        delete: editorOrAdmin,
        update: editorOrAdmin,
      },
      // @ts-expect-error - valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description:
                  'Old address, starting with a slash. The site rebuilds automatically after a change.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      admin: { group: 'Forms' },
      access: {
        create: editorOrAdmin,
        delete: editorOrAdmin,
        update: editorOrAdmin,
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      admin: { group: 'Forms' },
      access: {
        read: editorOrAdmin,
        delete: editorOrAdmin,
        update: editorOrAdmin,
      },
    },
  }),
  searchPlugin({
    collections: ['posts', 'pages'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: { group: 'Club' },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  ecommercePlugin({
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: 'users',
    },
    currencies: {
      defaultCurrency: 'AUD',
      supportedCurrencies: [AUD],
    },
    inventory: true,
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection.admin,
          group: 'Shop',
        },
        fields: [
          ...defaultCollection.fields,
          {
            name: 'accessToken',
            type: 'text',
            unique: true,
            index: true,
            admin: {
              position: 'sidebar',
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === 'create' || !value) {
                    return crypto.randomUUID()
                  }
                  return value
                },
              ],
            },
          },
          {
            name: 'fulfilment',
            type: 'select',
            defaultValue: 'new',
            label: 'Collection status',
            options: [
              { label: 'New', value: 'new' },
              { label: 'Ready to collect', value: 'ready' },
              { label: 'Collected', value: 'collected' },
              { label: 'Refunded', value: 'refunded' },
            ],
            admin: { position: 'sidebar' },
          },
          {
            name: 'notes',
            type: 'textarea',
            label: 'Committee notes',
            admin: { position: 'sidebar' },
          },
        ],
      }),
    },
    payments: {
      paymentMethods: [
        stripeAdapter({
          secretKey: process.env.STRIPE_SECRET_KEY || '',
          publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
          webhookSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET || '',
        }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
  }),
]
