# 246Labs Content Pass — Design Spec

**Date:** 2026-07-13
**Status:** Approved (design), pending implementation plan
**Site:** https://246labs.cloud (live; repo `christophercorbin/246labs-site`, app in `web/`)

## Overview

A coordinated content rewrite across Home, Services, and About, unifying them
under one message spine. Today the pages are visually polished but thin: service
groups are one-line blurbs, About has no human or mission, and Home states what
246Labs does without staking a clear position. This pass gives the site a
coherent thesis, real service depth, and a founder-led mission — the substance a
prospect needs before making contact. Copy only; no new routes or components.

## The message spine (runs across all three pages)

> World-class cloud & AI engineering — **built in the Caribbean, delivered
> anywhere.**

Two pillars beneath it:
- **The region competes.** The same engineering rigor as a firm in San Francisco
  or London, delivered from Barbados, for clients anywhere.
- **Value stays home.** Expertise built and kept in the Caribbean rather than
  outsourced abroad or drained away with emigrating talent.

This reframes the existing tagline "Cloud infrastructure, built in the
Caribbean." from a location tag into the company thesis. Both pillars trace to
the founder's stated reason for starting 246Labs.

## Honesty constraints (bind all copy)

246Labs is a newly founded company **with real shipped work** (see Selected
Work). Copy MAY cite the three named, live products below (owner cleared them
for public naming/linking) and the demonstrable stack behind them. Copy MUST
NOT invent anything beyond that: no fabricated client names/counts, no
years-in-business, no team beyond the one founder, no awards, no partner
statuses not held ("Built on AWS" stays — not "AWS Partner"). Proof = the three
real products; everything else is conviction and standard, not invented history.

## Selected Work (real, verified, cleared for public naming)

Three live products, all Caribbean-rooted — they demonstrate the thesis rather
than assert it. Cited by name + link; described from what each actually is
(verified 2026-07-13). Ownership is a mix of own-products and client work; copy
frames them neutrally as work 246Labs built (never implying a product is a
client's or vice versa).

- **SumDeTing** — `https://sumdeting.246labs.cloud` — AI math tutor for Caribbean
  students (Common Entrance → CSEC/CAPE). Socratic step-by-step guidance, text/
  photo/past-paper input, timed practice, progress tracking. **Built on Claude
  (Anthropic) via Amazon Bedrock.** The flagship proof: AI, built in the
  Caribbean, on the exact stack 246Labs sells.
- **Bim Weather** — `https://bimweather.246labs.cloud` — Barbados weather &
  hurricane-tracking app: real-time conditions, 7-day forecast, live rain
  radar/satellite, storm tracking, parish emergency shelters, threat-level push
  alerts (June–Nov season).
- **CargoLink Barbados** — `https://cargolinkbarbados.com` — shipping/logistics
  platform; tagline "The Smarter Way to Ship."

Note: `cargolink.com` (the old domain) now redirects to an unrelated company —
always link `cargolinkbarbados.com`, never `cargolink.com`.

## Voice

The locked brand voice: confident and technical, never corporate. "An engineer
who happens to live somewhere beautiful — precise about the work, proud of the
place." Short, declarative, concrete. No buzzword filler ("synergy",
"cutting-edge", "solutions provider").

## Page-by-page

### Home (`web/app/page.tsx`)
- **Hero value-prop paragraph:** rewrite to carry the thesis — not "we do cloud
  and AI" but the built-in-the-Caribbean-delivered-anywhere position. Keep the
  boot animation, sr-only H1, and CTAs.
- **New positioning beat ("Why 246Labs"):** one compact section stating the two
  pillars in the brand voice — 2 short items or a tight paragraph.
- **New "Selected work" strip:** three cards (name · one-line description ·
  external link) for SumDeTing, Bim Weather, CargoLink Barbados — placed after
  the service grid, before the closing CTA. Reuses card styling (a small
  `WorkCard` or inline markup; no new route). This is the site's social proof.
- Keep the closing flag-blue CTA band; tighten copy to the sharpened voice.
- Structural additions this pass are limited to the positioning beat + the work
  strip; no FAQ/process sections (YAGNI).

### Services (`web/app/services/page.tsx` + `web/lib/services.ts`)
- Expand the `ServiceGroup` data model so each of the six groups
  (`ai`, `build`, `run`, `cloud`, `assurance`, `hardware`) carries, beyond the
  existing `title`/`blurb`/`items`:
  - a longer **description** (2–3 sentences: what this actually is and who it's
    for), and
  - **deliverables** (a short list of concrete outputs a client receives).
- The `/services` page renders the richer cards: title, description, the
  included items, and the deliverables. An intro line frames engagements as
  "pick a lane or hand us the whole thing" (existing) plus a one-line note on
  how engagements run (scoped project or ongoing retainer).
- `ServiceCard` component gains the description + deliverables rendering.
- The Home condensed grid keeps using the short `blurb` (no deliverables) so the
  two surfaces stay visually distinct.

### About (`web/app/about/page.tsx`)
- Rebuilt as the **mission narrative**, in this arc:
  1. The thesis and why it matters (the two pillars, in conviction).
  2. What "built in the Caribbean" actually means for a client (rigor + place).
  3. The founder: **Christopher Corbin, Founder & Principal Engineer** — named,
     framed as the engineer doing the work; newly founded, high standard, no
     invented résumé.
  4. **Proof, briefly:** a sentence pointing to the Selected Work as evidence the
     standard is real — SumDeTing especially (AI for Caribbean students, on
     Claude/Bedrock) as the thesis made concrete. Links, not a full case study.
  5. The standard/close: the broken-trident meaning (independence, building
     things that last) + the descriptor line + "Built on AWS" badge (kept).
- Written so it hands off cleanly to a future case-study page (deeper proof)
  without depending on it now.

## Non-Goals

- No new routes/pages (a full case-study/portfolio page is a later batch).
- No new components beyond editing `ServiceCard` and a small `WorkCard` (or
  inline markup) for the Selected Work strip.
- No analytics, no photos/headshots, no logo images (work strip is text + links).
- No design/layout overhaul — copy, the Services data/rendering, and the work
  strip only.

## Testing

- `web/lib/services.ts`: unit-assert each of the six groups has a non-empty
  `description` and at least one `deliverable`, keys unchanged, still six groups.
- Page tests updated for new key phrases: Home asserts the thesis line, the
  "Why 246Labs" pillars, AND the Selected Work strip (the three product names
  render as links to their exact URLs — `sumdeting.246labs.cloud`,
  `bimweather.246labs.cloud`, `cargolinkbarbados.com`); About asserts the founder
  name/title, the mission line, and a SumDeTing reference; Services asserts a
  deliverables item renders. Existing brand assertions (badge "Built on AWS",
  descriptor line, sr-only H1) keep passing. A test guards that no link uses the
  stale `cargolink.com` domain.
- Full gate (`npm test && lint && tsc && build`) green; ships as one PR through
  the CI/CD pipeline (verify → auto-merge → deploy) + a live read-through.

## Decisions recorded

- Message spine = "built in the Caribbean, delivered anywhere" + two pillars
  (region competes / value stays home) — from the founder's stated reasons.
- Founder published as **Christopher Corbin, Founder & Principal Engineer**.
- Newly-founded honesty: conviction over track record; proof = three real,
  verified, owner-cleared products (SumDeTing, Bim Weather, CargoLink Barbados);
  zero fabricated clients/counts/history beyond them.
- Selected Work strip added to Home (+ About reference); always link
  `cargolinkbarbados.com`, never the stale `cargolink.com`.
- Services data model extended (`description` + `deliverables`); Home grid keeps
  the short blurb.
