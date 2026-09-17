# The Basin Wildcats Basketball Club: website

Production site for basinwildcats.com, built by 3P Digital. Next.js 16 with the
admin panel inside the same app at `/admin` (Payload CMS 3), Postgres on Neon,
media in Vercel Blob, shop on Stripe Checkout, Instagram feed via a scheduled
ScrapeCreators pull. Deployed on Vercel from the `site/` folder of this repo.

The approved homepage concept (static HTML) lives one level up in the repo root
and stays on GitHub Pages for reference. This folder is the real site.

## Local development

```bash
pnpm install
vercel link --project basin-wildcats            # once
vercel env pull .env.local --environment=development
cp .env.example .env                            # then fill PAYLOAD_SECRET, CRON_SECRET, PREVIEW_SECRET, SCRAPECREATORS_API_KEY
pnpm dev                                        # http://localhost:3000, admin at /admin
```

`.env.local` (from Vercel) carries the database and Blob credentials. `.env`
carries the app secrets. Both are ignored by git.

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Dev server with live preview |
| `pnpm build` | Runs pending database migrations, then `next build` (this is the Vercel build command) |
| `pnpm payload migrate:create <name>` | Generate a migration after changing any collection, global or block config |
| `pnpm payload migrate` | Apply migrations to the database in `DATABASE_URL` |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` |
| `pnpm generate:importmap` | Regenerate the admin import map after adding admin components |
| `pnpm seed:core` | Site settings, navigation, footer, sponsors, forms, homepage and landing pages (idempotent) |
| `pnpm migrate:wp` | Import pages, posts, documents, images and redirects from `../content/wp-export` (idempotent) |
| `pnpm seed:shop` | Size variants and the Grey Hoodie product (idempotent) |
| `pnpm sync:instagram` | Pull the latest Instagram posts once (the cron does this every six hours in production) |

Schema changes always go through migrations; `push` is off so development and
production databases stay identical.

## Where things live

- `src/collections/` Pages, Posts (News), Media, Documents, Categories, Sponsors, Instagram posts, Users, Products override
- `src/globals/SiteSettings.ts`, `src/Header/config.ts`, `src/Footer/config.ts`
- `src/blocks/*/config.ts` block schemas, `Component.tsx` renderers, `src/blocks/RenderBlocks.tsx` map
- `src/heros/` the club homepage hero and the compact page hero
- `src/app/(frontend)/` routes: pages by slug, `/news`, `/shop`, `/cart`, `/checkout`, `/search`
- `src/app/api/cron/instagram/route.ts` the feed sync (schedule in `vercel.json`)
- `src/app/(frontend)/globals.css` the design tokens and component classes ported from the approved concept

## Environment variables

| Name | Where set | Purpose |
|------|-----------|---------|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_*` | Vercel (Neon integration) | Database |
| `BLOB_READ_WRITE_TOKEN` | Vercel (Blob store) | Media and document files |
| `PAYLOAD_SECRET` | Vercel, `.env` | Signs admin sessions |
| `CRON_SECRET` | Vercel, `.env` | Authorises the Instagram cron |
| `PREVIEW_SECRET` | Vercel, `.env` | Draft preview links |
| `NEXT_PUBLIC_SERVER_URL` | Vercel production | Canonical URL for metadata and sitemaps |
| `SCRAPECREATORS_API_KEY` | Vercel, `.env` | Instagram pull |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOKS_SIGNING_SECRET` | Vercel | Shop payments (club's Stripe account) |
| `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME` | Vercel | Form and order emails; without a key, emails are logged, not sent |

## House rules

Australian English, no em dashes, real club numbers only, footer credit to 3P
Digital on every deployment. Full rules in the repo root `CLAUDE.md`.
