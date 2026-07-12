# 246Labs Launch Polish — Design Spec

**Date:** 2026-07-12
**Status:** Approved (design), pending implementation plan
**Site:** https://246labs.cloud (live; repo `christophercorbin/246labs-site`, app in `web/`)

## Overview

Post-launch polish batch for the live 246Labs site: replace the scaffold's
default favicon with the brand mark, add OpenGraph/Twitter social cards, add
SEO plumbing (sitemap, robots, JSON-LD), and implement the brand's signature
hero **boot animation** that was deferred at v1. Ships as one PR through the
existing CI/CD pipeline (verify gate → auto-merge → Amplify deploy).

## Goals

- The browser-tab icon (favicon) and touch icons show the 246Labs terminal-tile
  mark, not the create-next-app default.
- Links shared on social/chat render a branded card (og:image + metadata).
- Search engines get a sitemap, robots.txt, and `ProfessionalService`
  structured data.
- The hero plays the handoff's signature boot reveal: cursor types out the
  trident, wordmark reveals, tagline fades in; plays once, cursor blinks at rest.

## Non-Goals (later batches)

- Case-study/portfolio page, analytics, blog, booking links, perf audit.

## Components

### 1. Brand icons (code-generated)

- `web/app/icon.tsx` — 32×32 favicon and `web/app/apple-icon.tsx` — 180×180
  touch icon, both via Next's `ImageResponse` file convention (JSX → PNG at
  build). Rendering: navy (`#001042`) rounded tile, panel-blue titlebar strip
  with the three traffic dots, centered gold trident + gold cursor bar per the
  handoff proportions (titlebar 1u; trident 1.55u; cursor = trident height,
  ~0.14 width; gap 0.25u; tile radius 0.23 × width).
- Trident artwork: satori (ImageResponse's renderer) cannot do CSS masks or
  `currentColor` recoloring, so the site's white mask source is unusable here.
  Instead copy `design_handoff_246labs_brand/assets/trident-gold.png` →
  `web/public/brand/trident-gold.png` and embed it: `fs.readFile` at build →
  base64 data URI → `<img>` in the JSX.
- At 32px the titlebar dots are ≤2px — acceptable per the handoff's small-size
  guidance (dots may be omitted below 20px if unreadable; implementer may drop
  dots from `icon.tsx` only, keeping them in `apple-icon.tsx`).
- Delete: `web/app/favicon.ico`, `web/public/file.svg`, `globe.svg`,
  `next.svg`, `vercel.svg`, `window.svg` (scaffold leftovers).

### 2. Social card (OG/Twitter)

- `web/app/opengraph-image.tsx` — 1200×630 via `ImageResponse`: deep-navy
  background, terminal tile at left, `246La` + island glyph + gold `s` wordmark
  (island via embedded gold map PNG, copied as
  `web/public/brand/map-gold.png`), gold mono tagline
  "CLOUD INFRASTRUCTURE, BUILT IN THE CARIBBEAN.", faint `246labs.cloud`
  footer. Alt text: "246Labs — Cloud infrastructure, built in the Caribbean."
- No separate `twitter-image.tsx` — Twitter/X falls back to `og:image`; the
  `twitter.card` metadata below is sufficient.
- Root layout `metadata` gains: `openGraph: { siteName, type: "website",
  locale: "en_US", url }` and `twitter: { card: "summary_large_image" }`.
  (Title/description/images are auto-composed by Next from existing metadata +
  the image file conventions.)

### 3. SEO plumbing

- `web/app/sitemap.ts` — `MetadataRoute.Sitemap` listing `/`, `/services`,
  `/about`, `/contact` off `metadataBase` (already `https://246labs.cloud`).
- `web/app/robots.ts` — allow all agents, `sitemap: https://246labs.cloud/sitemap.xml`.
- JSON-LD in the root layout: one `<script type="application/ld+json">` with
  `@type: ProfessionalService` — name 246Labs, url,
  logo `https://246labs.cloud/apple-icon` (the generated 180px icon route), description,
  `areaServed: ["Barbados", "Caribbean"]`, `email: hello@246labs.cloud`,
  `sameAs: ["https://github.com/christophercorbin/246labs-site"]`. Rendered
  via `dangerouslySetInnerHTML` with `JSON.stringify` of a typed object.

### 4. Hero boot animation

Timeline (~4.5s total, CSS-only keyframes, plays ONCE; cursor blink runs
infinitely afterward):

1. 0–0.4s: tile scales in (`0.86→1`) + fades in.
2. 0.5–1.6s: trident **types out** — an `overflow:hidden` wrapper animates
   width `0→100%` (steps or ease-in-out), with the gold cursor bar sitting
   immediately right of the trident in a flex row so it rides the leading edge.
3. 1.6s+: cursor **blinks** — `opacity 1↔0`, `step-end`, ~1.05s cycle,
   `infinite`.
4. 1.8–3.0s: wordmark reveals left→right via `clip-path: inset()` animation.
5. 3.0–3.6s: tagline fades up (existing `.boot-tagline` timing adjusted to
   chain after the wordmark).

Implementation notes:

- `Logo` gains `animated?: boolean` (default false). When true, the trident
  span is wrapped in the width-reveal wrapper, the cursor bar gets the blink
  class, and the wordmark gets the clip-path reveal class. Nav/Footer keep
  static logos.
- `BootAnimation` passes `animated` and sequences the tagline delay.
- **Reduced-motion safety:** base styles are the FINAL visible state; every
  keyframe animates `from` the hidden state (e.g. `from { width: 0 }`,
  `from { opacity: 0 }`) with `animation-fill-mode: backwards` for delayed
  starts. The existing global `@media (prefers-reduced-motion: reduce)
  { animation: none !important }` then leaves the lockup fully visible and
  static. No new per-component media queries.
- All timing values as CSS custom properties or Tailwind arbitrary values in
  one place (globals.css keyframes + utility classes), so the timeline is
  tunable without touching component markup.

## Error handling

- Icon/OG routes are build-time; a missing brand PNG fails the build loudly
  (fs.readFile throws) — caught by CI's build gate, never ships broken.
- JSON-LD is static content; no runtime failure modes.

## Testing

- Unit: `sitemap()` returns the 4 URLs with `metadataBase` host; `robots()`
  points at the sitemap; root layout renders the JSON-LD script containing
  `"@type":"ProfessionalService"`; `Logo animated` renders the reveal wrapper
  classes; existing BootAnimation/Logo/page tests keep passing.
- Build gate compiles the `ImageResponse` routes (satori errors fail the build).
- Visual: animation fidelity + favicon/OG appearance checked on the deployed
  preview against the handoff reference (human).
- Delivery: single PR; `verify` must pass; auto-merge → OIDC deploy → live.

## Decisions recorded

- Icons/OG generated in code via `ImageResponse` (no design-tool exports;
  reproducible; brand tokens inline).
- Gold PNGs embedded (satori can't recolor via mask/currentColor).
- Animation plays once then rests with a blinking cursor (user choice).
- Scaffold SVGs and favicon.ico deleted.
