# Basin Wildcats website: handover and ownership

Prepared by 3P Digital, September 2026. This is the "who owns what" record
for the committee. Logins are never written here; they are held by the club
and shared through the admin's own invite flow.

## What the site is

- Live site: https://basin-wildcats.vercel.app (moves to basinwildcats.com once
  the domain is sorted, see below)
- Admin: https://basin-wildcats.vercel.app/admin
- Built with Next.js and an admin panel inside the site that works like
  WordPress: Pages, News, Media, Documents, Sponsors, Navigation, Footer, Site
  settings, Shop (Products, Orders), Users.
- Code lives in the GitHub repository `3PDigitalGrowth/basin-wildcats`, folder
  `site/`. Every push to `main` deploys automatically.

## Accounts, and who owns them today

| Service | What it does | Owned by (Sep 2026) | Transfers to the club when |
|---------|--------------|---------------------|----------------------------|
| Vercel project `basin-wildcats` | Hosting, builds, cron | 3P Digital team | Club nominates an owner email |
| Neon database `basin-wildcats-db` (Sydney) | All content and orders | Vercel marketplace, 3P team | Moves with the Vercel project |
| Vercel Blob `basin-wildcats-media` | Photos and documents | 3P team | Moves with the Vercel project |
| GitHub `basin-wildcats` | Source code | 3PDigitalGrowth | Transfer to a club GitHub organisation |
| Stripe | Shop payments | Not created yet | Club creates the account; 3P adds the keys |
| ScrapeCreators | Instagram feed pull | 3P Digital | Stays with 3P (covered under the SCCS arrangement) |
| Resend (email) | Form and order emails | 3P Digital domain | Optional move to a club domain later |
| Domain basinwildcats.com | Address | Unknown registrant at GoDaddy | See "Domain" below |

3P Digital keeps collaborator access on every service after transfer so
updates under the SCCS arrangement keep flowing.

## Roles in the admin

- Admin: committee executive and 3P support. Can do everything, including
  inviting people and changing roles.
- Editor: committee members and volunteers. Pages, News, Media, Documents,
  Sponsors, Navigation, Footer, Site settings, form submissions.
- Customer: created automatically when someone buys from the shop. No admin
  access.

The first admin account is alex@3pdigital.com.au (3P support). The committee's
first admin is created from Users, then that person invites the rest.

## Editing, in WordPress terms

- Pages are built from blocks (hero, text, image and text, cards, tables,
  document lists, forms, feeds). Open a page, edit, Publish. Drafts and
  scheduled publishing work like WordPress.
- News is the blog. Photo, a couple of sentences, publish.
- Documents is the file library. Upload a policy or resource once; it appears
  wherever a Document list block includes its category. Tick "superseded" to
  retire an old version without deleting it.
- Navigation is the mega menu. Each top-level item has an intro (a photo and
  one or two sentences) and dropdown items, each with a small graphic and one
  line of helper text. Change the words or swap a photo there and the menu
  updates across the site.
- Sponsors, Footer and Site settings cover everything else that is not a page
  (contacts, social links, announcement bar, homepage stat chips).
- Shop: Products carry sizes, price and stock. Orders show who paid and what to
  hand them at training, with a collection status and notes.

## Domain

The old site ran at basinwildcats.com/wordpress on HostPapa, domain at
GoDaddy. Nobody on the committee had located the login by 17 September 2026.

- Login found: point the domain at Vercel (A record 76.76.21.21 and CNAME
  cname.vercel-dns.com for www) and add the domain to the Vercel project.
  Every old /wordpress/ address already redirects to its new page.
- Login lost: GoDaddy account recovery by the registrant, two-week ceiling.
- Unrecoverable: register a new domain under the club and leave the old site
  with a banner until it lapses.

## Still to collect from the club

1. Club email to own the accounts above.
2. GoDaddy status and original registrant.
3. Mascot source artwork and costume photos (the site uses cut-outs from the
   club's own Instagram graphics as placeholders).
4. Stripe account under the club, then live keys.
5. Facebook page URL and the members group link (Site settings, Social tab).
6. Current season fees and dates to replace the 2025 table.
7. Names and emails for the committee editors.
8. Any milestone certificate files, if the club has them offline.

## Support

Updates and fixes are covered under the SCCS sponsorship arrangement. Email
3P Digital.
