# 246Labs Visual Overhaul — Design Spec

**Date:** 2026-07-13
**Status:** Approved (design), pending implementation plan
**Site:** https://246labs.cloud (live; repo `christophercorbin/246labs-site`, app in `web/`)

## Overview

A refined-premium visual pass over the live site. The content and structure are
right; the look is clean but flat — a long low-contrast light midsection, plain
bordered cards, no accent use, no visible hero headline, no imagery. This pass
adds section-band rhythm, elevated cards with gold accents, a visible display
hero headline, subtle brand-motif and motion polish, and restyles the Selected
Work strip with styled thumbnail cards (real screenshots wired later). It also
removes the traffic dots from the on-page logo and moves them into the favicon.

Strictly visual/presentational: no copy rewrites, no new routes, no new
dependencies. Stays entirely within the locked brand system.

## Direction

**Refined & premium.** Confident, clean, high polish; not a bold/editorial or
dark-developer reskin. The brand palette and type are the constant: Deep Navy
`#001042`, Flag Blue `#00267F`, Panel Blue `#0A2E7A`, Trident Gold `#FFC726`
(the single accent, used sparingly), Ink `#14161A`, Muted `#5A6273`, Hairline
`#E3E5EA`, Paper `#F6F7FB`, white; Space Grotesk (display/UI) + IBM Plex Mono
(labels/meta). Terminal-window + broken-trident motifs.

## Foundations (shared)

Added once in `web/app/globals.css` (+ `tailwind.config.ts` if a token helps),
consumed across pages/components:

- **Card elevation utility** — a soft shadow + `rounded-tile`, with a hover
  state (slight lift / shadow increase / border→flag-blue). One class both
  card components use.
- **Gold accent** — a thin gold top rule (or hairline) treatment for cards /
  section headers; the single accent, applied sparingly.
- **Section-band rhythm** — sections alternate surfaces (navy / paper / white /
  flag-blue) with consistent generous vertical padding; a hairline or subtle
  divider between adjacent light bands.
- **Scroll-reveal utility** — a fade+translate-in on section enter, implemented
  CSS-first (e.g. `@starting-style`/animation or an IntersectionObserver-lite
  class), **fully wrapped so `prefers-reduced-motion: reduce` disables it** and
  content is visible without JS/motion (no layout shift, no hidden-by-default
  content that could stick).
- **Display type scale** — a larger, tighter display heading style (Space
  Grotesk 700, negative tracking) for hero + section headers; a "lead"
  paragraph style. Applied via utilities, not per-element magic numbers.

## Logo change (traffic dots)

- **Remove the three traffic-dot spans** from `web/components/Logo.tsx` (the
  `bg-traffic-red/amber/green` dots inside the titlebar strip). The panel-blue
  titlebar strip **remains** as a clean minimal bar. This affects every on-page
  logo: hero (BootAnimation), Nav, and Footer.
- **Add the three dots to the favicon** — `web/app/icon.tsx` (32px) currently
  omits them; add the three traffic dots to its titlebar (accepting they render
  small). `web/app/apple-icon.tsx` already has them — unchanged.
- The `Logo` accessible name (`role="img"` + `aria-label="246Labs"`), wordmark,
  trident, cursor, and `animated` boot behavior are otherwise unchanged.

## Home (`web/app/page.tsx`)

- **Hero** — keep the boot-animation logo lockup; **promote a visible `<h1>`**
  display headline carrying the thesis (replacing the current `sr-only` h1). The
  BootAnimation tagline and the h1 must not be redundant duplicates — the h1 is
  the value statement; the lockup's tagline stays as the brand line. Lead
  paragraph + the two CTAs remain.
- **Bands** — Why 246Labs (paper) → Services grid (white) → **Selected Work on a
  navy band** (dark) → closing CTA (flag-blue) → footer (navy). A subtle
  broken-trident or island **watermark** on the navy Selected Work band
  (low-opacity, decorative, `aria-hidden`).
- Section-enter reveal applied to the major sections.

## Cards

- **`ServiceCard`** — elevation utility, hover state, gold accent; keep the
  title / description / items / "You get" deliverables content unchanged.
- **`WorkCard`** — elevation + hover; add a **styled thumbnail zone** at the top
  (brand gradient block, e.g. navy→flag-blue, with the product name) as the
  screenshot placeholder. Built so a real image later drops into the same fixed
  box (same aspect ratio) with no layout change. Sits on the navy band, so card
  surface/contrast tuned to pop against dark.

## Services & About pages

- Apply the same band/card/type/motion treatment for site-wide consistency:
  section heading type scale, card elevation (Services grid), a band or accent
  where it improves rhythm, scroll-reveal, and hover/focus states. No copy
  changes; About keeps its founder narrative + product links + badges.

## Motion & accessibility

- Hover states on all cards/buttons/links; visible `focus-visible` rings on all
  interactive elements.
- Scroll-reveal and any hover motion honor `prefers-reduced-motion` (the
  existing global reduce block stays; new motion must no-op under it, leaving
  content fully visible).
- Maintain color contrast — especially WorkCards and text on the navy band.
- No cumulative layout shift from reveals or the thumbnail zone.

## Non-Goals

- No copy/content changes, no new routes, no new npm dependencies.
- No real product screenshots this pass (styled placeholders; images = later
  src swap).
- No change to the CI/CD, IaC, or contact backend.
- Not a rebrand — palette, type, and logo geometry (minus dots) are fixed.

## Testing

- Existing suite stays green; update only assertions the visual changes touch:
  - Home: the h1 is now visible (still queryable via `getByRole("heading",
    {level:1})`); keep/adjust the tagline + pillars + work-link assertions.
  - Logo/BootAnimation/Nav tests: still pass (no assertion depends on the
    traffic dots; if one does, update it). Accessible-name test unchanged.
- No test asserts on shadows/animation visuals (not unit-testable); those are a
  human read-through on the deployed preview.
- Full gate (`npm test && lint && tsc && build`) green; ships as one PR through
  the pipeline (verify → auto-merge → deploy) + a live visual read-through
  (desktop + mobile widths).

## Decisions recorded

- Direction: refined & premium; brand system unchanged.
- Traffic dots: removed from on-page logo (titlebar strip kept), added to the
  32px favicon.
- Hero h1 promoted from sr-only to visible display headline.
- Selected Work on a navy band with styled thumbnail cards; real screenshots
  are a later src-swap (owner will provide images to `web/public/work/`).
- Scope covers Home, Services, About, shared components, and the favicon.
