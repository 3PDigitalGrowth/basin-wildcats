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
