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

246Labs is newly founded. Copy MUST NOT invent: years in business, number of
clients, named clients, case studies, team size beyond the one founder, awards,
or partner statuses not held (the "Built on AWS" wording stays — not "AWS
Partner"). The About page runs on conviction and standard, not a track record
that does not yet exist. Where proof would normally go, the copy leans on the
demonstrable (the studio's own engineering) and forward intent, never fabricated
history.

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
  pillars in the brand voice — 2 short items or a tight paragraph. This is the
  only structural addition; no FAQ/process sections this pass (YAGNI).
- Keep the condensed service grid and the closing flag-blue CTA band; tighten
  their copy to match the sharpened voice.

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
  4. The standard/close: the broken-trident meaning (independence, building
     things that last) + the descriptor line + "Built on AWS" badge (kept).
- Written so it hands off cleanly to a future case-study page (the "proof" that
  substantiates "the region competes") without depending on it now.

## Non-Goals

- No new routes/pages (case study is a separate later batch).
- No new components beyond editing `ServiceCard`.
- No analytics, no photos/headshots, no client logos.
- No design/layout overhaul — copy and the minimal Services data/rendering only.

## Testing

- `web/lib/services.ts`: unit-assert each of the six groups has a non-empty
  `description` and at least one `deliverable`, keys unchanged, still six groups.
- Page tests updated for new key phrases: Home asserts the thesis line + the
  "Why 246Labs" pillars render; About asserts the founder name/title and the
  mission line; Services asserts a deliverables item renders. Existing brand
  assertions (badge "Built on AWS", descriptor line, sr-only H1) keep passing.
- Full gate (`npm test && lint && tsc && build`) green; ships as one PR through
  the CI/CD pipeline (verify → auto-merge → deploy) + a live read-through.

## Decisions recorded

- Message spine = "built in the Caribbean, delivered anywhere" + two pillars
  (region competes / value stays home) — from the founder's stated reasons.
- Founder published as **Christopher Corbin, Founder & Principal Engineer**.
- Newly-founded honesty: conviction over track record; zero fabricated proof.
- Services data model extended (`description` + `deliverables`); Home grid keeps
  the short blurb.
