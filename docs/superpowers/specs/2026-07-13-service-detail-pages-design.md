# Service Detail Pages — Design Spec

**Date:** 2026-07-13
**Status:** Approved (design)
**Site:** https://246labs.cloud · repo `christophercorbin/246labs-site` (app in `web/`)

## Overview

Clicking a service (e.g. "AI") currently does nothing — `ServiceCard` is a plain
`<div>` with a hover-elevation it never honors (a false affordance). This adds a
dedicated detail page per service at `/services/<slug>`, makes the service cards
link to them (on both the home grid and the `/services` index), and hands off to
Contact with the service pre-filled. Pages are "lean & credible": expanded intro,
how-we-work steps, deliverables, and — where one genuinely applies — a link to a
real 246Labs product as proof. No fabricated case studies or FAQs.

## Goals

- Give each of the six services a real URL with depth (SEO + shareable + linkable).
- Convert interest into a scoped inquiry: each page CTA → Contact pre-filled.
- Fix the false-affordance: cards become real links.
- Stay DRY and honest: one data-driven dynamic route; proof only where true.

## Non-Goals

- No per-service pricing, FAQ, or invented case studies (deferred/out of scope).
- No CMS. Content lives in `lib/services.ts` as typed data.
- No change to the brand, layout system, or CI/CD.

## Architecture

**One dynamic route:** `app/services/[slug]/page.tsx`, driven by `SERVICE_GROUPS`
(slug = existing `key`). `generateStaticParams()` returns all six keys →
prerendered at build. An unknown slug → `notFound()`. `generateMetadata()` sets
title/description/canonical per page.

**Data model (`lib/services.ts`):** extend `ServiceGroup` with:
- `longIntro: string` — expanded intro paragraph for the detail page.
- `howWeWork: string[]` — 3–4 short steps.
- `relatedWork?: string[]` — slugs of real products to show as proof.
- `proofNote?: string` — a credibility line for services with no product link.
- `ctaLabel: string` — the detail-page CTA button text.

**Product linkage (`lib/work.ts`):** add `slug: string` to `Work`
(`sumdeting`, `bimweather`, `cargolink`) so a service's `relatedWork` can look up
the real product's name + href (DRY — proof reuses the actual product data).

**Cards become links (`ServiceCard.tsx`):** wrap the card in
`<Link href={`/services/${group.key}`}>`, keep the `.card` hover (now a true
affordance), and add a bottom "Explore <title> →" hint (mirrors WorkCard's
"Visit ↗"). Used unchanged by both the home grid and `/services` index.

**CTA → Contact prefill:** detail CTA links to `/contact?service=<slug>`.
`app/contact/page.tsx` becomes `async`, reads `searchParams.service`, maps it to
the service title via `SERVICE_GROUPS`, and passes `defaultMessage="I'm interested
in: <Title>\n\n"` to `ContactForm`. `ContactForm` gains an optional
`defaultMessage?: string` prop used as the message textarea's `defaultValue`
(unknown/missing slug → no prefill, current behavior).

**Sitemap (`app/sitemap.ts`):** append `/services/<key>` for all six (derived
from `SERVICE_GROUPS`, not hardcoded).

## Page template (every service)

`← Services` back-link · **H1** (title) · `longIntro` · **How we work**
(numbered `howWeWork`) · **What you get** (existing `deliverables`) · **Proof**
(product links from `relatedWork`, else `proofNote`, else nothing) · **CTA**
(`ctaLabel` → `/contact?service=<slug>`).

## Drafted copy (for review)

### AI (`ai`) — proof: SumDeTing
- **longIntro:** "Put AI to work where it actually moves the needle — no hype, no science projects. We help teams adopt AI that earns its place: automating the workflows that eat your week and shipping AI features customers actually use. If it won't move a number that matters, we'll tell you before you spend on it."
- **howWeWork:**
  1. Find the wedge — we start from a workflow or a metric, not a model.
  2. Prove it small — a scoped pilot against your real data before you commit.
  3. Ship to production — built on Claude via Amazon Bedrock, in your own AWS.
  4. Measure and hand off — you own it, with the numbers to show it worked.
- **relatedWork:** `["sumdeting"]`
- **ctaLabel:** "Start an AI project →"

### Build (`build`) — proof: CargoLink, Bim Weather
- **longIntro:** "Ship the product. We design and build web and mobile-ready applications end to end — and rebuild the sites and apps that have outgrown what they started as, without a rewrite for its own sake. You get software that works, that you can maintain, and that looks like you meant it."
- **howWeWork:**
  1. Scope the real thing — the smallest version that's actually useful, shipped first.
  2. Design and build in the open — you see working software early, not just mockups.
  3. Wire up the plumbing — APIs, auth, payments, and the integrations you depend on.
  4. Launch and keep improving — on infrastructure we can run and hand back to you.
- **relatedWork:** `["cargolink", "bimweather"]`
- **ctaLabel:** "Start a build project →"

### Run (`run`) — proof: all three products
- **longIntro:** "Keep it live and fast. We host what you've shipped, deploy it with push-button pipelines, and handle the unglamorous upkeep that prevents the 2 a.m. outage — patching, backups, monitoring, and the alerts that reach us before they reach your customers."
- **howWeWork:**
  1. Take stock — what's running, where, and what breaks it.
  2. Make deploys boring — push-button pipelines, no hand-edited servers.
  3. Watch it — monitoring and alerts that page us, not you.
  4. Keep it current — patches, backups, and the quiet maintenance that keeps you out of the news.
- **relatedWork:** `["sumdeting", "bimweather", "cargolink"]`
- **ctaLabel:** "Talk to us about hosting →"

### Cloud & DevOps (`cloud`) — proof: meta (this site + products)
- **longIntro:** "AWS done properly. We build cloud environments the right way — infrastructure as code, least-privilege access, sane environments, and automation you can hand off and trust. Not a pile of hand-clicked resources nobody dares touch."
- **howWeWork:**
  1. Design for your scale — not a diagram from a conference talk.
  2. Codify everything — Terraform / OpenTofu, versioned and reviewable.
  3. Automate the path to production — CI/CD, environments, and guardrails.
  4. Hand over the keys — documented, least-privilege, yours to run.
- **proofNote:** "This site — and every product we've shipped — runs on AWS we set up this way: infrastructure as code, a CI/CD pipeline with no stored keys, and least-privilege roles. We run our own practice before we sell it."
- **ctaLabel:** "Start a cloud project →"

### Assurance (`assurance`) — proof: dogfooded hardening note
- **longIntro:** "Know where you stand. We run security and compliance reviews that produce findings ranked by what actually matters, each with a plan to fix it — not a 200-page PDF that gathers dust. Built for teams that would rather hear it from us than from an attacker."
- **howWeWork:**
  1. Scope honestly — what you have, what you must protect, what you're measured against.
  2. Test and review — infrastructure, access, code, and configuration.
  3. Rank by real risk — the handful that matter first, not an alphabetised dump.
  4. Hand you a plan — prioritised remediation you can actually work through.
- **proofNote:** "We hold ourselves to the same bar: our own analytics run on a hardened, SSM-only instance — no SSH, IMDSv2 enforced, encrypted at rest. If we'd flag it in your audit, we don't ship it in ours."
- **ctaLabel:** "Request an audit →"

### Hardware (`hardware`) — no proof block
- **longIntro:** "When the problem is physical, we handle that too. Practical diagnosis and repair for the machines your work depends on — no runaround, no upsell to a box you don't need. Sometimes the fastest fix is a screwdriver, not a subscription."
- **howWeWork:**
  1. Diagnose first — find the actual fault before quoting a fix.
  2. Fix or advise — repair, upgrade, or an honest "replace it" when that's cheaper.
  3. Set it up right — configured, updated, and ready to work.
- **ctaLabel:** "Get hardware help →"

## Testing

- **Data:** every `ServiceGroup` has non-empty `longIntro`, `howWeWork` (≥3),
  `ctaLabel`; each `relatedWork` slug resolves to a real `SELECTED_WORK` entry.
- **Route:** `generateStaticParams` returns the six keys; a valid slug renders
  H1, steps, deliverables, and a CTA linking to `/contact?service=<slug>`; an
  unknown slug returns 404.
- **ServiceCard:** renders a link to `/services/<key>` (keeps icon + title).
- **ContactForm:** with `defaultMessage`, the textarea shows it; without, empty.
- **Contact page:** `?service=ai` seeds the message with the AI title; unknown/absent → no prefill.
- **Sitemap:** includes all six `/services/<key>` URLs.
- Full suite + `next build` green; ships via the pipeline.

## Decisions recorded

- Dynamic `app/services/[slug]` driven by `SERVICE_GROUPS`; `generateStaticParams`.
- Data-driven copy in `lib/services.ts`; proof only where a real product/claim applies.
- Cards link to detail pages on BOTH home grid and `/services` index.
- CTA → `/contact?service=<slug>`; contact page seeds the message (light prefill).
- Sitemap + per-page canonical metadata for all six.
