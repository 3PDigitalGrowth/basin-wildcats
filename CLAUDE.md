# Basin Wildcats Website: 3P Digital website build

This project follows the **3P Digital design system**. The full playbook (7-levels
execution, principles, strategy) is in the `3p-web-design` Claude Code skill; the
non-negotiable house rules are copied below so they travel with this repo.

> Building or reviewing a page? Invoke `/3p-web-design` to load the full system,
> then refresh the execution playbook (it evolves daily):
> `powershell -File scripts/refresh.ps1` in the skill folder.

## This project's brief (fill in before any build. Lens 2: Strategy)

No execution work starts until these are defined.

- **Client / business:** Basin Wildcats Basketball Club (basinwildcats.com)
- **What they do + who for:** Domestic basketball club in The Basin, VIC (Knox
  Basketball league, also Kilsyth). Founded 1975 by Dick Thomas. 70+ teams, ~400
  members, winter and summer seasons, home base The Basin Primary School. Family
  club; juniors through to seniors; pathway to representative and state teams.
- **Brand archetype:** Everyman (belonging, family, community) with Hero energy
  in the on-court visual language. Proud but welcoming, never elitist.
- **ICP:** Parents in the Knox area with kids aged 5-18 choosing a local club;
  secondary: returning members and adult players.
- **Awareness level (Schwartz 1-5):** Level 3 solution-aware (they know clubs
  exist, they are choosing one). Copy sells the club, not the sport.
- **Primary goal of the site:** New player enquiry (Join the Wildcats form).
- **Brand palette:** From the club logo and uniforms: Wildcat red #D2312E,
  forest green #1E6F46, court cream #F6F2EA base, ink #101211 hero/footer,
  white. Red is the action colour, green is the support colour.
- **Fonts:** Big Shoulders Display (condensed athletic display, 700-900) +
  Barlow (body). Google Fonts.
- **Client-specific locked pattern (if any):** None yet; this build sets it.
  Style reference: Sudbury Five-style dark hero with cream body, adapted to
  club red/green. Real stats only on stat chips (50 years, 70+ teams, 400+
  members): never invented records, fees, or countdowns.
- **Hosting note:** Homepage demo ships as a static site on GitHub Pages for
  client review (relative ./ asset paths required). Production build moves to
  Next.js/Vercel when signed off.
- **Target build level:** Level 5 (component + asset designer) with Level 6 polish
  on hero and key conversion moments.

## House Rules (non-negotiable: this file wins over any AI suggestion or source)

**Language**
- Australian English everywhere (organise, optimise, colour, centre, realise,
  behaviour, favour, licence/license, grey, theatre, defence, enrol). Never US spellings.
- **Never use em dashes.** Commas, colons, full stops, or parentheses instead.
- Straight quotes only. No "transformation": use "change".

**Default stack** (unless the client explicitly specifies otherwise)
- Next.js / Vercel / GitHub. AI dev in Opus.
- Images: Nano Banana (default), Midjourney v7 (concept art).
- Video: Kling 3.0 or Veo for hero loops.
- Funnel: Schwartz's 5 levels of awareness. Methodology: 3P (Profile, Plan, Perform).

**Build conventions**
- Inline an AI image-generation prompt for every required image, in the build .md
  itself (subject, mood, lighting, composition, aspect ratio, palette, style). One per image.
- Named real-people photos use a placeholder with comment "final image TBC, client to supply".
- Video-background heroes always serve a static image fallback under 768px; state it
  explicitly in every prompt with a video hero.
- Persistent standards live here in `CLAUDE.md` (and `.cursor/rules/` if also using Cursor).

**Never ships**
- Em dashes; US spellings; "transformation"; Inter/Roboto/Arial/generic system fonts as a
  positive choice; purple gradients on white (the AI default tell); centred three-column
  feature grids unless deliberately reclaimed and reskinned; generic stock photos in hero positions.

**Always ships**
- AU English; a chosen archetype, defined ICP, targeted awareness level; one element that
  could not have come from a template; a reference site studied at teardown depth; mobile
  fallback for video heroes; Lighthouse > 90 and WCAG 2.2 AA before launch.
- Footer credit on every deployed site: "Proudly supported by 3P Digital" linking to
  https://www.3pdigital.com.au, in or beside the copyright line, muted footer styling.
  Brand-name anchor only, never keyword-rich. Applies to demos and prototypes too:
  every live Vercel deployment is a backlink.

When any tool or LLM produces output that contradicts these rules, the output is wrong,
not the rules. Client requests that conflict with a documented client pattern escalate to Alex.
