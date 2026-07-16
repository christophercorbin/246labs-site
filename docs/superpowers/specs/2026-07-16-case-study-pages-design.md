# Case Study Pages — Design Spec
**Date:** 2026-07-16 · **Status:** approved (design) · **Branch:** `feat/case-study-pages`

## Goal
Give each item in "Selected work" its own on-site case-study page, so visitors land on 246Labs (not off-site) and see real proof of what we've shipped. This is the highest-leverage conversion gap identified in `docs/market-positioning-2026-07.md`: strong service copy, zero case studies.

## Approach (chosen: C — narrative-first, metric-ready)
Case studies lead with a narrative (problem → what we built → stack), not invented numbers. An optional metrics band renders **only when** real figures are supplied later — honest today, upgradeable with no rework. No metrics are fabricated.

## Non-goals (YAGNI)
- No CMS, MDX, or markdown pipeline — structured data in `lib/work.ts`, matching the existing `SERVICE_GROUPS` pattern.
- No new imagery beyond the existing `public/work/*.webp`.
- No per-case-study custom layouts — one shared template.

## Data model
Extend the `Work` type in `lib/work.ts` (existing fields `name`, `blurb`, `href`, `image?`, `slug` unchanged). Add optional case-study fields so any item without them still compiles and simply has no detail page content beyond the basics:

```ts
export type Metric = { label: string; value: string };

export type Work = {
  name: string;
  blurb: string;
  href: string;              // live product URL (external)
  image?: string;
  slug: string;
  // case-study fields (optional; C = narrative-first)
  problem?: string;          // the situation / what needed solving
  approach?: string[];       // what we built, as ordered steps (mirrors services' howWeWork)
  outcome?: string;          // qualitative result / why it matters
  stack?: string[];          // key tech (e.g. "Next.js", "Amazon Bedrock", "AWS")
  metrics?: Metric[];        // OPTIONAL hard numbers; band hidden if absent
  relatedServices?: string[]; // service keys to cross-link (reverse of services.relatedWork)
};
```

Seed `problem`/`approach`/`outcome`/`stack`/`relatedServices` for the three existing items (SumDeTing, Bim Weather, CargoLink) with truthful narrative content derived from their existing blurbs and the About page. Leave `metrics` unset for now.

## Route
`app/work/[slug]/page.tsx`, mirroring `app/services/[slug]/page.tsx`:
- `generateStaticParams()` from `SELECTED_WORK`.
- `generateMetadata()` — title `"{name} — 246Labs"`, description from `blurb`, `alternates.canonical: /work/{slug}`.
- `notFound()` for unknown slugs.

### Page layout (top → bottom)
1. Back link `← Work` (to `/#work` or a future `/work` index; use `/#work` for now).
2. `<h1>` name + blurb.
3. **Metrics band** — renders only if `metrics?.length`. Simple responsive grid of value/label pairs.
4. **The problem** — `problem` paragraph (section hidden if unset).
5. **What we built** — numbered list from `approach` (mirrors the "How we work" numbered style on service pages).
6. **The stack** — chips from `stack`.
7. CTAs: **Visit it live ↗** (external `href`, `target=_blank rel=noopener noreferrer`) + **Start a project** (`/contact`, primary `Button`).
8. **Related services** — links to `/services/{key}` for each `relatedServices` entry.

Reuse existing primitives: `Button`, the `font-mono` section-label style, `tracking-wordmark`, color tokens (`bg-paper`, `bg-white`, `flag-blue`, `gold`, `ink`). No new components required beyond the page itself.

## Wiring changes
- **`WorkCard`**: link internally to `/work/{slug}` instead of the external `href`. The external "visit live" link now lives on the case-study page. (Verify no other consumer depends on the old behavior.)
- **`SERVICE_GROUPS.relatedWork` ↔ `Work.relatedServices`**: service detail pages already show related work; case-study pages now link back to related services — bidirectional cross-linking.
- **`app/sitemap.ts`**: add `/work/{slug}` for each item (mirrors how service detail URLs were added).

## Error handling
- Unknown slug → `notFound()` (renders existing `app/not-found.tsx`).
- All case-study sections guard on their optional field being present, so a bare `Work` (basics only) renders a minimal valid page.

## Testing (vitest, matching `web/tests/`)
- Each `SELECTED_WORK` slug renders its `name` as an `<h1>`.
- Metrics band is absent when `metrics` is unset, present when set (test with a fixture).
- Optional sections (`problem`, `approach`, `stack`, `relatedServices`) are omitted when their field is absent.
- `generateStaticParams` returns one entry per work item.

## Rollout
Single branch `feat/case-study-pages`; PR to `main`. Content is truthful narrative; metrics added later by the owner when available.
