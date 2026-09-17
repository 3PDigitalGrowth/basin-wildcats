# Basin Wildcats: client feedback review and finishing plan

Revised 18 Sep 2026. Sources: the full "The Basin Wildcats website enquiry"
thread (11 messages, 31 Aug to 17 Sep 2026), Bron's referral thread, the
current WordPress site pulled through its public REST API (63 pages, 9 posts,
124 media items, 9 products, saved in `content/wp-export/`), and the club's
Instagram (@thebasin.wildcats, 12 most recent posts).

Operating rule for this phase: we finish the site as far as it can go from
what we already have. No emails to Mel, the committee or Bron until the build
is ready to show. Anything that needs the club goes on the handover list in
section 8, not in an email now.

## 1. Where the thread stands

Homepage concept went live for review on 1 Sep. The committee approved the
style and direction on 2 Sep and sent a feature wishlist. The club chased on
10 Sep and 17 Sep. Bron checked in on 8 Sep. The next thing they hear from us
is a finished site, not an update.

| Date | From | What happened |
|------|------|---------------|
| 31 Aug | Mel | Enquiry. Wants club-owned logins, club email as master account, volunteer admin access, easy self-management, social integration. |
| 31 Aug | Alex | Confirmed club ownership, free updates via SCCS support, asked to keep the existing domain, promised mockups. |
| 1 Sep | Alex | Sent the live homepage concept. Asked again about GoDaddy access. |
| 1 Sep | Mel | "At first glance, I really like it." First mention of a merch shop. |
| 2 Sep | Mel | Committee sign-off on look and direction. Five feature requests plus the self-management question. |
| 8 Sep | Bron | Check-in, offered to nudge the club along. |
| 10 Sep | Mel | Follow-up before the 16 Sep committee meeting. Restated the requests. |
| 10 Sep | Alex | Apology, promised an update. |
| 17 Sep | Mel | Gentle chase. |

## 2. Feedback to decision

| Their ask (2 Sep, restated 10 Sep) | Decision |
|------------------------------------|----------|
| Look and direction | Approved. Locked. No restyle. |
| "Can we update it ourselves?" | Yes. Admin panel inside the site that works like WordPress: Pages, Posts, Media, Users. Section 3.1. |
| Team Manager and Coach section | Build it from the real content already on the old site: the team manager information page, eight coaching resource files, the policies. Section 3.4. |
| Milestone certificates | Nothing exists on the current site (only medical certificate policy text). Out of scope. Section 3.5. |
| Mascot presence | AI mascot located in the club's own Instagram posts. Cut out and used across the site as a placeholder for the source file. Section 3.6. |
| Facebook and Instagram feed | Instagram via a scheduled pull with the ScrapeCreators API we already hold, rendered in brand. Facebook via the official Page Plugin. No Graph API, no client authorisation needed. Section 3.7. |
| Merchandise store | Stripe Checkout. Seeded from the nine hoodie products on the old shop. Section 3.8. |
| Domain (still unresolved) | Build on Vercel now, redirect map ready, cutover decided at handover. Section 3.3. |

## 3. Decisions to adopt

### 3.1 Admin that feels like WordPress, inside the site

No third-party hosted CMS. The admin lives at /admin on the same Next.js
deployment, uses Payload as the framework underneath (it is code in our
repo with its own database, not a hosted service), and presents the club
with what WordPress trained them to expect:

- **Pages:** create, edit, publish, draft, reorder in navigation. Block-based
  editor with the site's own sections (hero, text, image and text, document
  list, contact cards, sponsor grid, embed) so a committee member can build a
  new page that still looks like the site.
- **Posts:** the News blog. Title, hero image, rich text, categories, publish
  date, draft and scheduled publishing.
- **Media:** upload images and documents, alt text, folders for policies,
  coach resources, team manager resources, AGM papers.
- **Documents:** the 60 PDF and Word files migrate here as a first-class
  library with title, category and season, so the resources pages are lists
  the club maintains, not hand-coded links.
- **Products and Orders:** see 3.8.
- **Site settings:** contact emails, social links, sponsors, season dates,
  fees table, announcement bar.
- **Users and roles:** Admin (committee executive), Editor (committee and
  volunteers), 3P support account.

Database: Postgres on Neon through the Vercel integration. Media: Vercel
Blob. Both created under the deployment account and transferred with it.

### 3.2 Ownership: build under 3P, transfer at handover

The club asked for everything in its own name. We cannot set that up without
them, so the build runs under 3P's Vercel team and GitHub, and a transfer
checklist moves each piece at handover: Vercel project, GitHub repository,
Neon database, Blob store, Stripe account, domain. 3P keeps collaborator
access on every service afterwards. The club has addresses at
@basinwildcats.com on the old site (secretary, president, sponsorship,
coordinators, age-group addresses) and a Gmail address on current Instagram
graphics, so a club-owned master login exists in some form. Which one becomes
the owner is a handover question.

### 3.3 Domain: build now, cut over later

- Production build ships on a Vercel URL and is demonstrable there.
- Redirect map for every current /wordpress/ URL is written into the app
  now (section 5), so the keep-domain path is a DNS change on the day.
- Sign that the domain may be at risk: the 2019 site uses @basinwildcats.com
  mailboxes, while the club's September 2026 Instagram graphics use a Gmail
  address. If the mailbox has lapsed, the registration may have too. WHOIS
  check at handover; if the domain is unrecoverable, register a new one under
  the club and run the old site with a banner until it lapses.

### 3.4 Team Managers and Coaches hub

Built entirely from migrated content:

- **Hub page:** who does what, contacts (coordinators and age-group emails
  from the old site), season shape (two seasons, 17 rounds, seven grading
  rounds, Saturday juniors and Sunday seniors, from the Season Information
  page).
- **Team managers:** the Team Manager Information page (responsibilities,
  scoring roster, fixtures, uniforms) plus the team manager information PDFs
  and the Team Manager Policy PDF.
- **Coaches:** the OneClub resources set (Terminology, Practice Plan
  Template, Half Court Spots, OneClub Parts 1 to 3, Drill Library 1 and 2,
  updated Oct 2024), the Coaching Handbook, Skills Charts and the Coaches
  Survival Kit.
- **Policies:** the nine policy pages and seven Code of Conduct PDFs on one
  indexed page.
- **Club papers:** AGM minutes and reports 2019 to 2021.

Public. No gate. Nothing on the old site is gated and the committee did not
ask for one.

### 3.5 Certificates: out of scope

The rule: if certificates exist on the current site, they come across; we do
not design new ones. Search of all 63 pages and 124 media items found none.
The Documents library in the admin gives the club a place to upload their own
certificate files later, and a "Certificates" category is pre-created so the
resources page shows them the moment they do.

### 3.6 Mascot from the club's own posts

The AI mascot is in the Instagram post for Grade Secretary volunteers
(shortcode Dc4w4dJgcVT): a black wildcat in a green pinstripe number 75
singlet with red and green shoes, holding a banner. Build step:

1. Pull further posts through ScrapeCreators to find every mascot pose.
2. Cut out the cleanest two or three poses (background removal), keep them
   at display sizes where 1080px source holds up.
3. Place: hero corner reveal, join form confirmation, Mini Cats and juniors
   moments, 404 page, footer sign-off.
4. Mark each placement in the build brief "mascot source file TBC, client to
   supply" so the handover list asks for the original artwork.

We do not generate a mascot of our own. Costume mascot photos were not found
in the 12 posts checked; keep looking during the wider pull.

### 3.7 Social feeds without the Graph API

**Instagram.** A Vercel cron hits an API route every six hours. The route
calls the ScrapeCreators Instagram profile endpoint (the key and MCP are
already in our kit; 1 credit per live pull, 0 when cached), stores the
latest 12 posts (caption, permalink, type, timestamp) in the database, and
copies each image to Vercel Blob because Instagram CDN URLs expire. The
homepage strip and a Social page render from the database, styled to the
site. Cost is about 120 credits a month against a balance above 22,000. No
Meta app, no client login, no review. If ScrapeCreators ever breaks on
Instagram, the fallback is a Behold widget, charged to 3P.

**Facebook.** The official Page Plugin embed on the Social page, plus a
"latest from Facebook" link block. It needs no authentication. Page URL to
confirm during the build (not on the old site's HTML; the members' group is
named on the Misc Information page as "The Basin Wildcats Basketball Club
Members Only Communications"). Private groups link out with a "request to
join" line.

### 3.8 Shop on Stripe

Stripe Checkout, hosted payment page, no card data on our side.

- **Products** live in the admin (name, description, price, sizes as
  variants, images, active flag) and sync to Stripe Products and Prices.
- **Checkout:** cart in the site, Stripe Checkout session, webhook writes
  the order to an Orders collection the committee sees in admin and emails
  the club secretary address.
- **Seed catalogue** from the old WooCommerce shop: Grey Hoodie, A$60,
  sizes Child 8, 10, 12, 14 and Adult S, M, L, XL, XXL, image
  Hoodies-2023.jpg, all listed in stock. Pickup at training, no shipping
  (assumption, section 7).
- **Build in Stripe test mode** under 3P keys. Swap to the club's live keys
  at handover; the account belongs to the club.
- **Uniform number request** form from the old site sits beside the shop,
  with the three-step uniform process (request number, order singlet from
  The Print Shop, optional merchandise) carried over.

## 4. Content inventory from the export

| Type | Count | Migrate | Notes |
|------|-------|---------|-------|
| Pages | 63 | 34 | 29 are theme demo pages (Arena, Trophy room, Price table, Typography, Shortcodes, Sample Page and so on) or WooCommerce system pages. Dropped. |
| Posts | 9 | 9 | 2019 to 2022 (AGMs, COVID, player of the month). Blog has been dormant; Instagram carries the club's news now. Posts migrate so News is not empty. |
| Documents | 60 | 60 | PDFs and Word files: policies, codes of conduct, coaching resources, team manager information, AGM papers. Several duplicates by version; keep latest, archive the rest under a "Superseded" category. |
| Images | 62 | about 15 | Club photos (bwch01, bwch02, HPI1, wilcats-picture 1 to 4, Life-member 1 and 2, committee), hoodie photos 2021 to 2023, policy icons. Screen shots and theme demos dropped. |
| Products | 9 | 1 with 9 variants | Grey Hoodie by size. |
| Forms | 3 | 3 | New Player Enquiry, Contact Us, Uniform Number Request (Contact Form 7 today). Rebuilt as site forms posting to the admin and emailing the club. |

Freshest content on the old site: Training Information (Jun 2025, includes
the Child Supervision Policy), Fees (Feb 2025, Winter 2025 table with family
pricing and bank details), Coaches Information (Oct 2024). These carry a
"last updated" line so the committee sees what to refresh first.

## 5. Sitemap

| New section | Pages | Migrated from |
|-------------|-------|---------------|
| Home | Homepage (built) | Home |
| About | History, Committee, Life Members, Awards | Our Club menu, Awards |
| Join | Join the Wildcats (enquiry form), Fees, Season information, Training, Game venues, Mini Cats | Join Us, New Player Enquiry, Members menu |
| Members | Policies (nine on one page), Uniform and merchandise, Misc information | Members menu, Codes of Conduct, Terms, Misc Information |
| Team Managers and Coaches | Hub, Team managers, Coaches, Club papers | Coaches and Team Managers menu |
| News | Index, post | News, Post |
| Gallery | Albums | Gallery |
| Social | Instagram feed, Facebook block, groups | Facebook Demo, Instagram Feed Demo |
| Shop | Shop, product, cart, uniform number request | Shop, Cart, Checkout, Merchandise Shop, Uniform Number Request |
| Sponsors | Sponsor page | Homepage sponsor list |
| Contact | Contact page, committee roles and emails | Contact Us, Contacts, Links |

Every old URL in the export maps to a new path in the redirect table.

Homepage changes from the feedback: the three join buttons go to the new
enquiry form instead of the old WordPress contact page; Instagram strip
above the sponsors band; Team Managers and Coaches in the navigation and
footer; mascot reveal in the hero; shop card in the join strip area once
the catalogue is live; volunteer card links to a real volunteer form.

## 6. Build sequence

Skills to load at build start: `3p-web-design` and `frontend-design`
(house rules and the 7-level playbook), then `design-scout` only if a new
section needs a reference; the homepage direction is already locked.

1. **Scaffold.** Next.js on Vercel, Payload admin, Neon Postgres, Vercel
   Blob, roles, block editor with the site's sections. Homepage ported from
   the static build with no visual change.
2. **Migrate.** Script reads `content/wp-export/*.json`, creates pages,
   posts, documents and images, downloads files from the live uploads
   folder, writes the redirect table. Manual pass to clean rendered HTML
   into blocks.
3. **Sections.** About, Join with forms, Members, Team Managers and
   Coaches, News, Gallery, Sponsors, Contact.
4. **Feeds.** Instagram cron and Blob copy, Social page, Facebook Page
   Plugin.
5. **Mascot.** Wider Instagram pull, cut-outs, placements.
6. **Shop.** Products and Orders collections, Stripe test mode, webhook,
   hoodie catalogue, uniform number form.
7. **Launch gate.** WCAG 2.2 AA, Lighthouse above 90 on every template,
   mobile pass, redirect table verified against the export, footer credit,
   handover document written.
8. **Show the client.** One email with the live URL, the admin login for a
   demo editor account, and the handover list. First contact since 10 Sep,
   so it lands with a finished site.

## 7. Assumptions we build on

- Hoodie orders are collected at training; no shipping. Pickup note on the
  product, shipping switchable in Stripe later.
- Order and form notifications go to the secretary address from the old site
  until the club nominates another.
- Fees shown are the Winter 2025 table from the old site, labelled with the
  season and a "confirm current fees" note in admin.
- Mini Cats (U8 skills sessions, named in September 2026 Instagram posts)
  gets a section on the Join page with copy drawn from those posts.
- Team Managers and Coaches content is public.
- Photos of players from the club's own public Instagram and website are
  used only where the club already published them; hero and conversion
  moments still carry the "client to supply" placeholder rule from the build
  brief.

## 8. Handover list (collected now, asked at launch, not before)

1. Club email to own Vercel, GitHub, Neon, Stripe and the domain.
2. GoDaddy status and original registrant, or the go-ahead to register a new
   domain.
3. Mascot source artwork and costume photos.
4. Stripe account under the club, live keys.
5. Facebook page URL confirmation and the members' group link.
6. Current season fees and dates to overwrite the 2025 table.
7. Names and emails for the committee editors.
8. Any milestone certificate files, if the club has them offline.

## 9. Things we will not do

- Restyle the approved direction.
- Generate our own mascot artwork.
- Use a hosted CMS or the Meta Graph API.
- Design certificates that do not exist on the current site.
- Invent fees, dates, records or milestones.
- Email the client, or Bron, before the site is ready to show.
- Leave any account without 3P collaborator access after transfer.

## 10. Build status, 18 Sep 2026

Built and deployed in one pass on 18 Sep 2026. Live at
https://basin-wildcats.vercel.app with the admin at /admin. Ownership and
transfer record: `docs/handover.md`. Developer notes: `site/README.md`.

| Area | State |
|------|-------|
| Admin (WordPress feel) | Pages with 20 block types, News, Media, Documents, Sponsors, Navigation, Footer, Site settings, Users with admin, editor and customer roles, live preview, drafts, scheduled publishing |
| Homepage | Ported block for block from the approved concept; committee can edit every word and photo |
| Content migrated | 14 pages, 9 news posts, 62 documents (15 marked superseded), 19 club photos, 144 redirects covering every old /wordpress address |
| Landing pages written | Our Club, Join (with enquiry form), Mini Cats, Volunteers, Members, Team Managers and Coaches hub, Gallery, Social, Sponsors, Contact, Club papers, Game venues |
| Forms | New player enquiry, Contact us, Uniform number request, Volunteer. Notifications go to the old site's club addresses once an email key is set |
| Instagram | 12 latest posts synced, refreshed every six hours, images copied to Blob |
| Facebook | Page Plugin block ready; needs the page URL in Site settings |
| Shop | Grey Hoodie, nine sizes, A$60, stock placeholders. Cart and checkout built. Stripe keys not yet set, so the pay step shows a holding notice |
| Mascot | Three poses cut from the club's own Instagram graphics; used on the call-to-action strips and the 404 page. Source files still wanted |
| Certificates | Out of scope, none existed. Documents library has a Certificates category ready |
| Quality | Type check and lint clean. Lighthouse figures in the final report to Alex |

Not yet done, all needing something from outside the build: Stripe account and
keys, Resend email key, Facebook page URL, domain decision, club-owned account
transfers. Listed in section 8 and in `docs/handover.md`.
