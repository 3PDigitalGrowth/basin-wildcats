import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Documents } from './collections/Documents'
import { InstagramPosts } from './collections/InstagramPosts'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Sponsors } from './collections/Sponsors'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { SiteSettings } from './globals/SiteSettings'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Transactional email (form notifications, order receipts, password resets).
 * Sends through Resend when RESEND_API_KEY is set; otherwise Payload logs the
 * email to the console, which is what happens in local development.
 */
const email = process.env.RESEND_API_KEY
  ? resendAdapter({
      apiKey: process.env.RESEND_API_KEY,
      defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@3pdigital.com.au',
      defaultFromName: process.env.EMAIL_FROM_NAME || 'The Basin Wildcats',
    })
  : undefined

export default buildConfig({
  email,
  admin: {
    meta: {
      titleSuffix: ' | Basin Wildcats admin',
      icons: [{ rel: 'icon', type: 'image/png', url: '/logo.png' }],
    },
    components: {
      graphics: {
        Logo: '@/components/AdminLogo#AdminLogo',
        Icon: '@/components/AdminLogo#AdminIcon',
      },
      beforeDashboard: ['@/components/AdminWelcome#AdminWelcome'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Schema changes go through migrations everywhere (pnpm payload migrate:create),
    // so the Neon database used in development matches production exactly.
    push: false,
  }),
  collections: [Pages, Posts, Media, Documents, Categories, Sponsors, InstagramPosts, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer, SiteSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
