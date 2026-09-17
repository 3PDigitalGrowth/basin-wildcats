# Basin Wildcats homepage: build brief and asset register

Homepage concept for client review. Static build on GitHub Pages; production
moves to Next.js/Vercel when signed off. Strategy brief lives in `CLAUDE.md`.

## Style reference

Sudbury Five-style club homepage: dark rounded hero card with condensed display
type and a player cutout, cream body, ticket-style gallery cards, stat chips.
Adapted to Basin Wildcats brand: red #D2312E and green #1E6F46 from the club
logo and uniforms, court cream #F6F2EA base, ink #0F1210. The club's own
wildcat eyes motif (from their "Excellence in Basketball" banner) is redrawn as
an SVG and sits in the hero. Type: Big Shoulders Display + Barlow.

## Copy sources (no invented facts)

- Founded 1975 by Dick Thomas; 50 seasons; ~400 members; 70+ teams: club
  History page.
- Knox and Kilsyth competitions, winter and summer seasons, home base The Basin
  Primary School, "fun, family orientated club", pathway to representative and
  state teams: club homepage and About copy.
- Sponsors and what each sponsors: club homepage sponsor list.
- Stat chips carry real numbers only. No invented records, fees, or countdowns.

## Asset register

Real club assets (from basinwildcats.com):

| File | Source | Used in |
|------|--------|---------|
| assets/img/logo.png | Club logo (WP uploads) | Header, footer, favicon |
| assets/img/photo-game.jpg | bwch01.jpg game action | Gallery card 1 |
| assets/img/photo-court.jpg | bwch02.jpg junior huddle | Gallery card 2 |
| assets/img/photo-club.png | HPI1.png club banner | Gallery card 3 |

Generated assets (Higgsfield, 31 Aug 2026). One prompt per image, kept here so
any asset can be re-rolled:

### assets/img/hero-player.webp (hero cutout, 3:4, soul_2, background removed)

> Athletic young adult basketball player, chest-up editorial portrait, holding a
> completely plain orange leather basketball with no printed text in both hands
> at chest height, wearing a completely plain forest green basketball singlet
> with red trim edging on the shoulders, the singlet fabric is blank with
> absolutely no logos, no badges, no patches, no brand symbols, no swoosh, no
> lettering anywhere, confident calm expression looking slightly past camera,
> short dark hair, dark charcoal studio background, dramatic rim lighting from
> the left with a warm key light, sharp focus, premium sports magazine
> photography

Placeholder rule: this is a generated athlete, not a club member. Final hero
image TBC, client to supply a real senior player photo if preferred.

### assets/img/ball.jpg (about section, 1:1, nano_banana_pro)

> Close-up still life of a weathered leather basketball resting on a polished
> hardwood court in near darkness, single warm spotlight from upper right, deep
> black background, visible pebbled texture and black seams, moody editorial
> sports photography, high contrast, cinematic

### assets/img/net.jpg (about section, 4:5, nano_banana_pro)

> Low angle photograph looking up at a basketball hoop as the ball drops through
> a white nylon net, dark gymnasium background fading to black, warm backlight
> glowing through the net fibres, frozen motion, high contrast editorial sports
> photography

### assets/img/court-wide.jpg (seasons band poster and sub-768px fallback, 16:9, nano_banana_pro)

> Empty indoor basketball court at night, polished honey-coloured hardwood floor
> with painted centre circle and keyway lines, deep shadows, two dramatic pools
> of warm light, subtle forest green and deep red ambient light wash on the far
> wall, cinematic wide establishing shot, moody atmosphere, no people

### assets/video/net-swish.mp4 (seasons band background loop, 16:9, 5s, seedance_2_5)

> Extreme slow motion: a basketball swishes cleanly through a white nylon net,
> camera fixed slightly below the rim looking up, dark gymnasium background
> fading to black, one warm spotlight backlighting the net so the fibres glow,
> net fabric ripples as the ball passes, faint dust particles drifting in the
> light beam, cinematic sports commercial look, seamless loop-friendly framing,
> no people, no text

Video hero rule: the seasons band serves a static image fallback
(court-wide.jpg) under 768px, and the video pauses off screen and under
prefers-reduced-motion.

## Mascot (placeholder from club social posts)

The club never asked us to invent a mascot: it already has one, an AI-drawn
black wildcat in a green pinstripe number 75 singlet with red and green
shoes, built by the club itself and posted through its own Instagram
(@thebasin.wildcats). House rule for this build: reuse the club's own
published artwork as a placeholder, never generate our own. See section 3.6
of `docs/client-feedback-plan.md` for the decision.

### Source posts

Pulled the last 120 posts from @thebasin.wildcats through the ScrapeCreators
Instagram API (11 credits used against a balance in the tens of thousands)
to find every appearance of the mascot, back to 11 February 2026. Full list
with shortcodes, dates and what each post shows is scripted and saved for
the record; the posts that carry the illustrated mascot or a costume-mascot
photo are:

| Date | Shortcode | What it shows |
|------|-----------|----------------|
| 5 Sep 2026 | Dc4w4dJgcVT | Illustrated mascot holding a blank banner, Grade Secretary volunteer call-out. Cut for **mascot-banner**. |
| 3 Sep 2026 | Dc0BPk1gRnp | Illustrated mascot with a clipboard and stopwatch, grading volunteers call-out. |
| 29 Aug 2026 | DcpCcn7gXht | Illustrated mascot, fist pump, team selections graphic. |
| 28 Aug 2026 | DckvHH8DQwn | Illustrated mascot, fist pump, good luck for the final round. |
| 26 Aug 2026 | DcgLvWGlNaR | Illustrated mascot dribbling, Mini Cats skills session graphic. Cut for **mascot-dribble**. |
| 10 Aug 2026 | Db2Y-edASDe | Same dribbling artwork, reused for a second Mini Cats post. |
| 29 Jun 2026 | DaJpabbjrs_ | Illustrated mascot dribbling, school holidays graphic. |
| 25 May 2026 | DYwaVgQgTK5 | Illustrated mascot, paws up, thank you to the behind-the-scenes crew. |
| 18 Apr 2026 | DXQjW5sAay4 | Illustrated mascot thumbs up, plus a real costume-mascot photo with a U10 team. |
| 16 Apr 2026 | DXL7Vy0AUel | Illustrated mascot dribbling and pointing, season-start graphic. |
| 30 Mar 2026 | DWhwcDwgFh0 | Real costume-mascot photo with a junior team, plus the illustrated pointing pose in the same collage. |
| 27 Mar 2026 | DWZwcoEikTk | Illustrated mascot with a trophy, grand final weekend graphic. Background removal could not separate the reflective gold trophy from the confetti backdrop cleanly in the time available, so this pose was not used. |
| 20 Mar 2026 | DWH-l1HAfjc | Illustrated mascot in a McDonald's sponsor welcome graphic. |
| 18 Mar 2026 | DWA8PjXgVjs | Small illustrated mascot corner graphic, U16 boys wanted. |
| 16 Mar 2026 | DV9c69nAWgu | Illustrated mascot mid-dunk, grand final bound graphic. Cut for **mascot-dunk**. |
| 16 Mar 2026 | DV7UKcLgY-W | Illustrated mascot, second McDonald's sponsor graphic. |
| 5 Mar 2026 | DVhRHzkgYnN | Illustrated mascot dribbling and pointing, registrations closing graphic. |
| 26 Feb 2026 | DVPNQN3ioeN | Illustrated mascot dribbling, winter registrations open graphic. |
| 26 Feb 2026 | DVN4D6DAfkQ | Small illustrated mascot inset, team selections reminder. |
| 11 Feb 2026 | DUnOng_krlB | Flat 2D growling cat-head crest icon (the club's badge mark, not the full mascot character). |
| 13 Sep 2026 | DdOIKReDMrC | Real costume-mascot photo: a person in a full wildcat suit with a girls' team at a live game (U8 Encouragement Day). |

### What was cut out

Three poses, background removed with `rembg` (isnet-general-use model,
run locally; the Higgsfield `remove_background` tool was tried first but its
saliency model kept whole AI-generated stadium/confetti backgrounds as
"foreground" on these images, so the local model with manual clean-up of a
couple of leftover text overlays gave a cleaner result):

- **mascot-banner** (from Dc4w4dJgcVT): full-body, banner held overhead.
- **mascot-dribble** (from DcgLvWGlNaR): 3/4 action pose, dribbling.
- **mascot-dunk** (from DV9c69nAWgu): mid-air dunk, cropped just above the
  shoe to stay clear of the "Grand Final Bound" headline text baked into
  the original graphic.

Each is saved at full cut resolution (source was 1080px) plus a 600px-wide
WebP, in `site/public/mascot/`. The trophy pose (DWZwcoEikTk) was attempted
as a fourth option but dropped: the trophy's gold reflections read as
background to the segmentation model and could not be recovered cleanly.

### Where it is placed

- **Homepage hero** (`src/heros/ClubHero/index.tsx`): the dunk pose peeks
  in from the bottom-right corner of the hero card, behind the player
  cutout, hidden under 820px so it never competes with the mobile layout.
- **404 page** (`src/app/(frontend)/not-found.tsx`): the banner pose sits
  beside the "Nothing here" copy, in a right-hand column on desktop and
  above the copy on mobile.
- **Footer**: skipped. The mascot's fur is near-black and the footer
  background is ink (#101211); at the 90px size asked for, the character's
  outline disappeared into the background in a test render and just read as
  a smudge next to the club logo. Not used.

Final artwork TBC, club to supply the original mascot files and any costume
photos at handover (already on the handover list in
`docs/client-feedback-plan.md`, section 8).
