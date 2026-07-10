# 246Labs Marketing Site — Design Spec

**Date:** 2026-07-10
**Status:** Approved (design), pending implementation plan
**Domain:** `246labs.bb`

## Overview

Public marketing website for **246Labs**, a Barbados-based cloud-engineering
studio ("Cloud infrastructure, built in the Caribbean."). The site presents the
studio's services, tells the Barbados story, and captures leads. It is also a
portfolio piece: the site's own engineering and AWS deployment are part of the
sell, so build and hosting quality matter as much as visual polish.

The brand system is already defined and delivered (see
`design_handoff_246labs_brand/`): logo, colors, typography, motion, and voice.
This project implements that brand as a live site — it does not redesign it.

## Goals

- Present the full service catalog in a clear, credible way.
- Implement the brand system faithfully (logo mark, boot animation, tokens, voice).
- Capture inbound leads via a working contact form.
- Deploy on AWS with push-to-deploy CI/CD (dogfooding the studio's own capability).

## Non-Goals (this version)

- Blog / writing section
- CMS or content editing UI
- Analytics / marketing pixels
- Real client case studies (placeholder-free copy comes later)
- E-commerce, auth, or client portal

## Architecture

- **Framework:** Next.js (App Router) + Tailwind CSS.
- **Rendering:** Mostly static pages; one server API route for contact.
- **Hosting:** AWS Amplify Hosting in SSR-capable mode. Amplify builds on git
  push, serves via its CDN, and manages the `246labs.bb` domain and SSL.
- **Server compute:** The Next.js `/api/contact` route runs as Amplify-managed
  Lambda — no separate API Gateway or hand-authored Lambda to wire up.
- **Email:** Amazon SES sends contact submissions to the studio inbox.

**Decision — Amplify SSR + Next.js API route vs. static export + standalone
Lambda:** Chosen the former. Keeps everything in one repo and one deploy;
Amplify provisions the compute. The static-export path would require a
separately managed API Gateway + Lambda and CORS wiring for marginal cost
savings not worth the added moving parts at this scale.

## Pages (routes)

### `/` — Home
- Hero with the signature **boot-reveal animation** (cursor types out the
  trident, then the wordmark, then tagline) per the handoff hero timeline.
- One-line value proposition.
- Condensed service grid linking to `/services`.
- Barbados-story teaser linking to `/about`.
- Primary CTA to `/contact`.

### `/services`
Full catalog grouped into six areas:
- **AI** — AI adoption consulting, AI engineering, automation.
- **Build** — web app development, app building, website reworks.
- **Run** — hosting, CI/CD pipelines, app maintenance.
- **Cloud & DevOps** — AWS solutions, DevOps.
- **Assurance** — security & compliance audits.
- **Hardware** — hardware fixes / support.

### `/about`
Studio + Barbados story in brand voice. Meaning of the broken trident, the
"AWS Partner" badge, and the descriptor line
`CONSULTING · DEVOPS · WEB APPS · HOSTING`.

### `/contact`
Contact form (name, email, company, message) plus direct email/phone fallback.

## Shared Components

- **`Logo`** — rebuilt per handoff: CSS terminal tile (titlebar + three traffic
  dots) + trident SVG + gold cursor bar + wordmark where the "b" is the island
  glyph and the final "s" is the accent color. Supports color variants via
  `currentColor`.
- **`BootAnimation`** — the hero boot reveal and (optionally) the app-icon loop,
  honoring `prefers-reduced-motion`.
- **`Nav`**, **`Footer`**, **`ServiceCard`**, **`Button`**, **`ContactForm`**.
- Trident PNG replaced with a single optimized SVG using `fill: currentColor`,
  as the handoff recommends.

## Contact Data Flow

1. `ContactForm` (client component) validates inputs and submits.
2. `POST /api/contact` (server route) re-validates server-side, checks the
   honeypot field, and applies basic rate limiting.
3. Route calls **SES `SendEmail`** to the studio recipient.
4. Success/failure state returns to the form for inline feedback.

- **Spam control:** hidden honeypot field; reject if filled.
- **Config:** SES region, verified sender identity, and recipient address come
  from environment variables (set in Amplify). No secrets in the repo.

## Brand Implementation

- All 13 color tokens (Deep Navy, Flag Blue, Panel Blue, Trident Gold, Ink,
  Muted, Faint, Hairline, Paper, Page bg, traffic red/amber/green) mapped into
  `tailwind.config` as named colors.
- **Fonts:** Space Grotesk (display/UI, 400–700) and IBM Plex Mono
  (labels/metadata, 400–500) loaded via `next/font`.
- Radius scale from the handoff wired into the Tailwind theme.
- Wordmark accent letter: gold on dark, Flag Blue on light.
- `prefers-reduced-motion` disables/short-circuits the boot animation.

## Error Handling

- **Form:** inline field validation; on API failure show a graceful, generic
  error and keep the user's input.
- **API route:** validate all inputs server-side; on SES failure, log the error
  server-side and return a generic error to the client (no internal detail
  leaked).
- **Honeypot triggered:** return a success-looking response without sending.

## Testing

- Component tests for `ContactForm` validation (required fields, email format,
  honeypot).
- Test for `/api/contact` with SES stubbed/mocked — success path and SES-failure
  path.
- Build + lint gate must pass.
- Manual visual check of the boot animation and brand fidelity against the
  handoff reference.

## Content

Copy drafted in the defined 246Labs brand voice ("confident and technical, never
corporate") with **placeholder contact details** (email/phone) for the owner to
replace before launch. No fabricated client names or case studies.

## Deployment

- Git repository connected to AWS Amplify Hosting.
- Amplify build settings for a Next.js SSR app.
- Custom domain `246labs.bb` with managed SSL.
- Environment variables for SES configured in Amplify (not committed).
- SES sender identity and recipient must be verified in the target AWS account
  before the form works in production.

## Open Items for Implementation Plan

- Confirm which AWS account/profile hosts the site and SES (candidate:
  `personal-*` family per environment notes).
- Placeholder contact email/phone values to use until real ones are provided.
