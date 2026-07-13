# 246Labs Site Imagery Pass — Design Spec

**Date:** 2026-07-13
**Status:** Approved (design)
**Site:** https://246labs.cloud · repo `christophercorbin/246labs-site` (app in `web/`)

## Overview

Make the marketing site livelier and more compelling to customers by adding two
kinds of imagery: **real product screenshots** in the Selected Work cards
(turning claims into visible proof) and **service icons** on the Services grid
(visual rhythm and scanability). Scope was deliberately narrowed to these two —
no founder photo and no hero/mood stock imagery — to avoid the "generic stock"
failure mode and keep every added pixel earning its place.

This is a small site-only change. It ships through the existing CI/CD pipeline
(verify → deploy). No infra, brand, or backend changes.

## Goals

- Replace the flat gradient placeholders in the Selected Work cards with real
  screenshots of the shipped products, when those image files exist.
- Add one brand-tinted icon per service group to the Services grid.
- Ship the code safely **before** every screenshot exists — a missing image
  falls back to the current gradient placeholder, never a broken image.

## Non-Goals

- No founder photo (About page unchanged).
- No hero background or section-band mood imagery.
- No CMS, no image upload flow, no `next/image` remote loaders — images are
  local files committed under `web/public/`.
- No change to copy, brand palette, layout structure, or CI/CD.

## Component 1 — Product screenshots in WorkCard

**Data (`web/lib/work.ts`):** add an optional field to the `Work` type:

```ts
export type Work = {
  name: string;
  blurb: string;
  href: string;
  image?: string; // e.g. "/work/sumdeting.webp"; omit until the file is committed
};
```

The `image` field is populated **only** for products whose screenshot file is
committed under `web/public/work/`. Until then it is omitted, and the card uses
the gradient fallback. Each real screenshot is then a one-line data edit.

**Render (`web/components/WorkCard.tsx`):** the existing 16:9 thumbnail box
(`data-work-thumb`, `aspect-video`) renders:
- **if `work.image` is set:** a `next/image` with `fill` + `object-cover`, a
  `sizes` hint, lazy loading, and `alt={`${work.name} screenshot`}`. The box
  gets `relative` positioning (required by `fill`).
- **if `work.image` is absent:** the current brand-gradient placeholder with the
  product name (unchanged).

**Image files (user-provided):** landscape ~1200×750 (16:9-ish), WebP preferred
(PNG/JPG accepted), target <300 KB each, committed at
`web/public/work/{sumdeting,bimweather,cargolink}.<ext>`.

## Component 2 — Service icons

**Dependency:** add `lucide-react` (ISC, tree-shakeable — only the icons
imported ship). This is the site's first icon dependency; justified by giving
six consistent, professionally-drawn line icons without hand-authoring SVGs.

**Icon mapping:** a `key → icon` lookup lives in `ServiceCard.tsx` (keeps
`lib/services.ts` a pure data module with no React import):

| group key   | icon         |
|-------------|--------------|
| `ai`        | `Sparkles`   |
| `build`     | `Code`       |
| `run`       | `Server`     |
| `cloud`     | `Cloud`      |
| `assurance` | `ShieldCheck`|
| `hardware`  | `Cpu`        |

**Render (`web/components/ServiceCard.tsx`):** the icon renders above the group
title, tinted brand gold (`text-gold`), `aria-hidden` (the title is the
accessible label), sized ~28px. Card layout and the existing `card-accent` gold
top rule are otherwise unchanged.

## Testing / verification

- **`work.ts` / `WorkCard`:** unit test that a `Work` with `image` set renders
  an image element in the thumbnail box (and that the box is `relative`), and
  that a `Work` with no `image` renders the gradient placeholder with the name.
- **`ServiceCard`:** unit test that each card renders an icon (`svg` present)
  and still renders title, items, and deliverables.
- Existing tests stay green; full suite + `next build` gate green; ships via the
  pipeline (verify → deploy).
- **Live:** once screenshots are committed, confirm the three Work cards show
  real images on https://246labs.cloud and the Services grid shows icons.

## Decisions recorded

- Two imagery types only: product screenshots + service icons. No founder photo,
  no mood/stock imagery.
- Screenshots are local files under `web/public/work/`; `Work.image` optional
  with gradient fallback → code is shippable before any screenshot exists.
- `next/image` with `fill` + `object-cover` for the thumbnails (local optimizer;
  Amplify SSR supports it).
- `lucide-react` for icons (first icon dep); icon mapping in `ServiceCard`, not
  in the pure `lib/services.ts` data module.
