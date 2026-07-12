# 246labs.cloud — Content & QA Audit
**Date:** 2026-07-12 · **Pages reviewed:** Home, Services, About, Contact, 404, /api/contact · **Source cross-checked:** `web/` (Next.js app)

## Verdict
The site is fast, clean, and the copy has a strong voice. It is **not yet ready to market** — sharing a link on LinkedIn/WhatsApp today shows no preview card, there's no privacy policy behind the contact form, and there's zero social proof. All fixable in a day or two.

---

## 🔴 Blockers — fix before you start marketing

1. **No Open Graph / Twitter card tags.** Zero `og:` or `twitter:` tags on any page. Every link you share (LinkedIn, WhatsApp, X, Slack) renders as a bare URL with no image or title. This is the single biggest marketing blocker. Fix: add `openGraph` + `twitter` to the `metadata` export in `app/layout.tsx`, plus an `opengraph-image` (1200×630) — there's no OG image asset in `public/` yet.

2. **No privacy policy or terms.** The contact form collects name, email, company. Google Ads, Meta Ads, and LinkedIn Ads all require a privacy policy URL, and it's a trust signal for a company selling *compliance audits*. Add `/privacy` and link it in the footer.

3. **"AWS Partner" badge (About page).** Only display this if 246Labs is actually enrolled in the AWS Partner Network — AWS restricts use of the term. If you're enrolled, fine; if not, change to "Built on AWS" before running any ads.

4. **Contact form untested end-to-end.** The API route is deployed and validates correctly (verified live), and the honeypot works — but the honeypot also returns `ok: true` without sending mail, so a working-looking form proves nothing about SES config (`SES_REGION/SENDER/RECIPIENT` env vars). **Do one real test submission and confirm the email lands in hello@246labs.cloud before driving traffic.** Note SES sandbox mode silently limits recipients.

5. **No sitemap.xml or robots.txt** (both 404). You already have Google Search Console verified (TXT record found) but nothing to submit to it. Fix: add `app/sitemap.ts` and `app/robots.ts` — ~10 lines each in Next.

## 🟠 High priority

6. **www is a duplicate site.** `https://www.246labs.cloud` serves the full site with a 200 and no redirect, and there are no canonical tags anywhere. Google may index both. Fix: 301 www → apex (Amplify domain settings), and add `alternates.canonical` per page.

7. **Homepage has no H1.** The hero is the logo animation + a paragraph; `<h1>` never appears. Services and About have proper H1s. Add a visually-styled (or sr-only) H1 like "Cloud infrastructure, built in the Caribbean."

8. **Zero social proof.** No clients, case studies, testimonials, or team. For a services company this is what converts. Even one short "what we built" case study or 2–3 client logos on the homepage would materially help. Related: footer has no LinkedIn/GitHub links — set up at least a LinkedIn company page before marketing.

9. **No security headers.** Missing HSTS, `X-Content-Type-Options`, `X-Frame-Options`/CSP, `Referrer-Policy`. Cheap to add via `next.config.ts` headers — and awkward if a prospect runs securityheaders.com on a company that sells *security audits*. (Anyone evaluating you will.)

10. **No analytics.** Nothing detected (GA/Plausible/PostHog/etc.). You'll be marketing blind. Plausible or PostHog is a 5-minute add and keeps the privacy policy simple.

## 🟡 Nice to have

11. **Default Next.js 404 page** ("404: This page could not be found." in system font, off-brand). Add `app/not-found.tsx`.
12. **Wordmark reads "246Las" as text.** The trident replaces the "b" with `aria-hidden`, so crawlers/copy-paste see "246Las". The `aria-label="246Labs"` covers accessibility; consider an sr-only "b" so text extraction is correct too.
13. **Leftover boilerplate in `public/`:** `next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg` — delete.
14. **No structured data.** Add Organization/ProfessionalService JSON-LD (name, logo, email, areaServed) — helps local/brand search.
15. **Contact page is thin.** Add expected response time ("we reply within 1 business day"), and consider location (Barbados) — being Caribbean is your differentiator, lean into it here too.
16. **Contact meta description** is just "Start a project with 246Labs." — expand slightly.
17. **No apple-touch-icon** — favicon.ico exists but no icons for iOS/PWA contexts.

## ✅ What's already good

Fast: ~190ms TTFB, ~30KB HTML. HTTP→HTTPS 301 works. Mail is real: Google Workspace MX + SPF (Google + SES) on the domain. Form validation and honeypot both work (tested live). Copy voice is distinctive and confident ("no hype, no science projects", "keeps you out of the news"). Meta titles/descriptions present on all pages. Clean semantic structure on Services/About. Search Console verification already in place.

## Suggested order of attack
Day 1: OG tags + OG image, sitemap/robots, www redirect + canonicals, homepage H1, real form test.
Day 2: Privacy page, security headers, analytics, custom 404, verify/replace AWS Partner badge.
Then: one case study + LinkedIn page, and start marketing.
