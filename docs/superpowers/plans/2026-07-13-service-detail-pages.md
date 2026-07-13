# Service Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated `/services/<slug>` detail page per service, make service cards link to them, and hand off to Contact pre-filled with the chosen service.

**Architecture:** One data-driven dynamic route (`app/services/[slug]/page.tsx`) reads the six entries in `SERVICE_GROUPS` (slug = existing `key`), prerendered via `generateStaticParams`. Per-service copy (intro, how-we-work steps, CTA label, optional real-product proof) lives as typed data in `lib/services.ts`; proof reuses real product data from `lib/work.ts` via a new `slug`. Cards become links; the detail-page CTA links to `/contact?service=<slug>`, which seeds the contact message.

**Tech Stack:** Next.js 16 (App Router, async `params`/`searchParams`), React 19, TypeScript, Tailwind v3.4, lucide-react, Vitest + React Testing Library.

## Global Constraints

- All app code in `web/`; run commands from `web/`. Test: `npm test` (`vitest run`). Build gate: `npm run build`.
- No new dependencies. No changes to the brand palette (`navy`, `flag-blue`, `gold`, `ink`, `muted`, `hairline`, `paper`, `white`), layout system, or CI/CD.
- Slug = the existing service `key`: `ai`, `build`, `run`, `cloud`, `assurance`, `hardware` (in that order).
- Product slugs (new `Work.slug`): `sumdeting`, `bimweather`, `cargolink`.
- Proof precedence on a detail page: if `relatedWork` resolves to ≥1 product, show product links under "See it live"; else if `proofNote` is set, show it under "We practice what we preach"; else show no proof block.
- Copy is authored verbatim from the approved spec `docs/superpowers/specs/2026-07-13-service-detail-pages-design.md` — use those exact strings.
- Unknown slug → `notFound()` (404). Unknown/absent `?service=` → no contact prefill.

---

### Task 1: Data model + per-service copy

**Files:**
- Modify: `web/lib/work.ts` (add `slug` to `Work` + each entry)
- Modify: `web/lib/services.ts` (extend `ServiceGroup` + populate copy)
- Modify: `web/tests/lib/work.test.ts`, `web/tests/lib/services.test.ts`
- Modify: `web/tests/components/WorkCard.test.tsx` (fixture needs `slug` now that it's required)

**Interfaces:**
- Produces: `Work` gains `slug: string`. `ServiceGroup` gains `longIntro: string`, `howWeWork: string[]`, `relatedWork?: string[]`, `proofNote?: string`, `ctaLabel: string`.

- [ ] **Step 1: Write failing tests**

Append to `web/tests/lib/services.test.ts`:
```ts
import { SELECTED_WORK } from "@/lib/work";

describe("SERVICE_GROUPS detail content", () => {
  it("gives every group intro, steps, and a CTA label", () => {
    for (const g of SERVICE_GROUPS) {
      expect(g.longIntro.length).toBeGreaterThan(0);
      expect(g.howWeWork.length).toBeGreaterThanOrEqual(3);
      expect(g.ctaLabel.length).toBeGreaterThan(0);
    }
  });

  it("resolves every relatedWork slug to a real product", () => {
    const slugs = new Set(SELECTED_WORK.map((w) => w.slug));
    for (const g of SERVICE_GROUPS) {
      for (const s of g.relatedWork ?? []) {
        expect(slugs.has(s)).toBe(true);
      }
    }
  });
});
```

Append to `web/tests/lib/work.test.ts` (inside the existing `describe`, add an `it`):
```ts
  it("gives each product a unique slug", () => {
    const slugs = SELECTED_WORK.map((w) => w.slug);
    expect(slugs).toEqual(["sumdeting", "bimweather", "cargolink"]);
    expect(new Set(slugs).size).toBe(3);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/`
Expected: FAIL — `slug`, `longIntro`, `howWeWork`, `ctaLabel` don't exist yet (type/assert errors).

- [ ] **Step 3: Add `slug` to `Work`**

In `web/lib/work.ts`, extend the type and each entry:
```ts
export type Work = {
  name: string;
  blurb: string;
  href: string;
  image?: string;
  slug: string;
};
```
Add to the three entries respectively: `slug: "sumdeting"`, `slug: "bimweather"`, `slug: "cargolink"` (keep all existing fields incl. `image`).

- [ ] **Step 4: Extend `ServiceGroup` and populate copy**

In `web/lib/services.ts`, extend the type:
```ts
export type ServiceGroup = {
  key: string;
  title: string;
  blurb: string;
  description: string;
  deliverables: string[];
  items: string[];
  longIntro: string;
  howWeWork: string[];
  relatedWork?: string[];
  proofNote?: string;
  ctaLabel: string;
};
```
Then add these fields to each existing group object (keep all current fields). Use these EXACT strings:

`ai`:
```ts
    longIntro:
      "Put AI to work where it actually moves the needle — no hype, no science projects. We help teams adopt AI that earns its place: automating the workflows that eat your week and shipping AI features customers actually use. If it won't move a number that matters, we'll tell you before you spend on it.",
    howWeWork: [
      "Find the wedge — we start from a workflow or a metric, not a model.",
      "Prove it small — a scoped pilot against your real data before you commit.",
      "Ship to production — built on Claude via Amazon Bedrock, in your own AWS.",
      "Measure and hand off — you own it, with the numbers to show it worked.",
    ],
    relatedWork: ["sumdeting"],
    ctaLabel: "Start an AI project →",
```
`build`:
```ts
    longIntro:
      "Ship the product. We design and build web and mobile-ready applications end to end — and rebuild the sites and apps that have outgrown what they started as, without a rewrite for its own sake. You get software that works, that you can maintain, and that looks like you meant it.",
    howWeWork: [
      "Scope the real thing — the smallest version that's actually useful, shipped first.",
      "Design and build in the open — you see working software early, not just mockups.",
      "Wire up the plumbing — APIs, auth, payments, and the integrations you depend on.",
      "Launch and keep improving — on infrastructure we can run and hand back to you.",
    ],
    relatedWork: ["cargolink", "bimweather"],
    ctaLabel: "Start a build project →",
```
`run`:
```ts
    longIntro:
      "Keep it live and fast. We host what you've shipped, deploy it with push-button pipelines, and handle the unglamorous upkeep that prevents the 2 a.m. outage — patching, backups, monitoring, and the alerts that reach us before they reach your customers.",
    howWeWork: [
      "Take stock — what's running, where, and what breaks it.",
      "Make deploys boring — push-button pipelines, no hand-edited servers.",
      "Watch it — monitoring and alerts that page us, not you.",
      "Keep it current — patches, backups, and the quiet maintenance that keeps you out of the news.",
    ],
    relatedWork: ["sumdeting", "bimweather", "cargolink"],
    ctaLabel: "Talk to us about hosting →",
```
`cloud`:
```ts
    longIntro:
      "AWS done properly. We build cloud environments the right way — infrastructure as code, least-privilege access, sane environments, and automation you can hand off and trust. Not a pile of hand-clicked resources nobody dares touch.",
    howWeWork: [
      "Design for your scale — not a diagram from a conference talk.",
      "Codify everything — Terraform / OpenTofu, versioned and reviewable.",
      "Automate the path to production — CI/CD, environments, and guardrails.",
      "Hand over the keys — documented, least-privilege, yours to run.",
    ],
    proofNote:
      "This site — and every product we've shipped — runs on AWS we set up this way: infrastructure as code, a CI/CD pipeline with no stored keys, and least-privilege roles. We run our own practice before we sell it.",
    ctaLabel: "Start a cloud project →",
```
`assurance`:
```ts
    longIntro:
      "Know where you stand. We run security and compliance reviews that produce findings ranked by what actually matters, each with a plan to fix it — not a 200-page PDF that gathers dust. Built for teams that would rather hear it from us than from an attacker.",
    howWeWork: [
      "Scope honestly — what you have, what you must protect, what you're measured against.",
      "Test and review — infrastructure, access, code, and configuration.",
      "Rank by real risk — the handful that matter first, not an alphabetised dump.",
      "Hand you a plan — prioritised remediation you can actually work through.",
    ],
    proofNote:
      "We hold ourselves to the same bar: our own analytics run on a hardened, SSM-only instance — no SSH, IMDSv2 enforced, encrypted at rest. If we'd flag it in your audit, we don't ship it in ours.",
    ctaLabel: "Request an audit →",
```
`hardware`:
```ts
    longIntro:
      "When the problem is physical, we handle that too. Practical diagnosis and repair for the machines your work depends on — no runaround, no upsell to a box you don't need. Sometimes the fastest fix is a screwdriver, not a subscription.",
    howWeWork: [
      "Diagnose first — find the actual fault before quoting a fix.",
      "Fix or advise — repair, upgrade, or an honest \"replace it\" when that's cheaper.",
      "Set it up right — configured, updated, and ready to work.",
    ],
    ctaLabel: "Get hardware help →",
```

- [ ] **Step 5: Fix the WorkCard test fixture (slug now required)**

In `web/tests/components/WorkCard.test.tsx`, add `slug` to the inline `work` object so it satisfies `Work`:
```ts
const work = {
  name: "SumDeTing",
  blurb: "An AI math tutor.",
  href: "https://sumdeting.246labs.cloud",
  slug: "sumdeting",
};
```

- [ ] **Step 6: Run tests + build**

Run: `npm test -- lib/ WorkCard`
Expected: PASS.
Run: `npm test` then `npm run build`
Expected: full suite green; build succeeds (typecheck passes with `slug` required).

- [ ] **Step 7: Commit**

```bash
git add web/lib/work.ts web/lib/services.ts web/tests/lib/work.test.ts web/tests/lib/services.test.ts web/tests/components/WorkCard.test.tsx
git commit -m "feat: service detail content model + per-service copy"
```

---

### Task 2: Service detail route

**Files:**
- Create: `web/app/services/[slug]/page.tsx`
- Test: `web/tests/pages/service-detail.test.tsx` (create)

**Interfaces:**
- Consumes: `SERVICE_GROUPS` (with Task 1 fields), `SELECTED_WORK` (with `slug`), `Button` (`{ href?, variant?, className?, children }` — renders a `next/link` when `href` set).
- Produces: default export `ServiceDetailPage` (async, `{ params: Promise<{ slug: string }> }`) and `generateStaticParams()`.

- [ ] **Step 1: Write failing tests**

Create `web/tests/pages/service-detail.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ServiceDetailPage, { generateStaticParams } from "@/app/services/[slug]/page";
import { SERVICE_GROUPS } from "@/lib/services";

describe("service detail page", () => {
  it("prerenders all six services", () => {
    const slugs = generateStaticParams().map((p) => p.slug).sort();
    expect(slugs).toEqual(SERVICE_GROUPS.map((g) => g.key).sort());
  });

  it("renders the AI page: heading, steps, deliverables, proof, prefilled CTA", async () => {
    render(await ServiceDetailPage({ params: Promise.resolve({ slug: "ai" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "AI" })).toBeInTheDocument();
    expect(screen.getByText(/How we work/i)).toBeInTheDocument();
    expect(screen.getByText(/What you get/i)).toBeInTheDocument();
    // real-product proof
    expect(screen.getByRole("link", { name: /SumDeTing/i })).toHaveAttribute(
      "href",
      "https://sumdeting.246labs.cloud",
    );
    // CTA carries the service into contact
    expect(screen.getByRole("link", { name: /Start an AI project/i })).toHaveAttribute(
      "href",
      "/contact?service=ai",
    );
    // back link
    expect(screen.getByRole("link", { name: /Services/i })).toHaveAttribute("href", "/services");
  });

  it("shows the proofNote for a service with no related product (cloud)", async () => {
    render(await ServiceDetailPage({ params: Promise.resolve({ slug: "cloud" }) }));
    expect(screen.getByText(/We run our own practice before we sell it/i)).toBeInTheDocument();
  });

  it("404s on an unknown slug", async () => {
    await expect(
      ServiceDetailPage({ params: Promise.resolve({ slug: "nope" }) }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- service-detail`
Expected: FAIL — module `@/app/services/[slug]/page` does not exist.

- [ ] **Step 3: Implement the route**

Create `web/app/services/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICE_GROUPS } from "@/lib/services";
import { SELECTED_WORK } from "@/lib/work";
import { Button } from "@/components/Button";

export function generateStaticParams() {
  return SERVICE_GROUPS.map((g) => ({ slug: g.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const group = SERVICE_GROUPS.find((g) => g.key === slug);
  if (!group) return {};
  return {
    title: `${group.title} — 246Labs`,
    description: group.blurb,
    alternates: { canonical: `/services/${group.key}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = SERVICE_GROUPS.find((g) => g.key === slug);
  if (!group) notFound();

  const proof = (group.relatedWork ?? [])
    .map((s) => SELECTED_WORK.find((w) => w.slug === s))
    .filter((w): w is (typeof SELECTED_WORK)[number] => Boolean(w));

  return (
    <>
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/services"
            className="font-mono text-xs uppercase tracking-label text-muted hover:text-gold"
          >
            ← Services
          </Link>
          <h1 className="mt-4 font-sans text-4xl font-bold tracking-wordmark text-flag-blue sm:text-5xl">
            {group.title}
          </h1>
          <p className="mt-4 text-lg text-ink/80">{group.longIntro}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-mono text-xs uppercase tracking-label text-muted">
            How we work
          </h2>
          <ol className="mt-4 space-y-4">
            {group.howWeWork.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="font-mono text-sm font-bold text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-ink/80">{step}</span>
              </li>
            ))}
          </ol>

          <h2 className="mt-12 font-mono text-xs uppercase tracking-label text-muted">
            What you get
          </h2>
          <ul className="mt-4 space-y-2">
            {group.deliverables.map((d) => (
              <li key={d} className="flex gap-2 text-ink/80">
                <span aria-hidden className="text-gold">
                  →
                </span>
                {d}
              </li>
            ))}
          </ul>

          {(proof.length > 0 || group.proofNote) && (
            <div className="mt-12">
              <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                {proof.length > 0 ? "See it live" : "We practice what we preach"}
              </h2>
              {proof.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {proof.map((w) => (
                    <li key={w.slug} className="text-ink/80">
                      <a
                        href={w.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-flag-blue underline hover:text-gold"
                      >
                        {w.name}
                      </a>
                      <span> — {w.blurb}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-ink/80">{group.proofNote}</p>
              )}
            </div>
          )}

          <div className="mt-12">
            <Button href={`/contact?service=${group.key}`} variant="primary">
              {group.ctaLabel}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- service-detail`
Expected: PASS (4 cases).

- [ ] **Step 5: Run full suite + build**

Run: `npm test` then `npm run build`
Expected: green; build prerenders `/services/ai … /services/hardware`.

- [ ] **Step 6: Commit**

```bash
git add web/app/services/[slug]/page.tsx web/tests/pages/service-detail.test.tsx
git commit -m "feat: /services/[slug] detail page (static, per-service proof + CTA)"
```

---

### Task 3: Service cards link to detail pages

**Files:**
- Modify: `web/components/ServiceCard.tsx`
- Modify: `web/tests/components/ServiceCard.test.tsx`

**Interfaces:**
- Consumes: `ServiceGroup` (`key`, `title`, `description`, `items`, `deliverables`), `/services/<key>` route from Task 2.

- [ ] **Step 1: Extend the test**

In `web/tests/components/ServiceCard.test.tsx`, add to the first `it` (after the icon/heading assertions):
```tsx
    expect(screen.getByRole("link")).toHaveAttribute("href", "/services/ai");
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- ServiceCard`
Expected: FAIL — no link (card is still a `<div>`).

- [ ] **Step 3: Wrap the card in a Link + add an "Explore" hint**

Replace the contents of `web/components/ServiceCard.tsx` with:
```tsx
import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import {
  Sparkles,
  Code,
  Server,
  Cloud,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import type { ServiceGroup } from "@/lib/services";

// key -> icon. Falls back to Sparkles if a new group key is ever added
// without a mapping (keeps the grid rendering rather than crashing).
const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  ai: Sparkles,
  build: Code,
  run: Server,
  cloud: Cloud,
  assurance: ShieldCheck,
  hardware: Cpu,
};

export function ServiceCard({ group }: { group: ServiceGroup }) {
  const Icon = ICONS[group.key] ?? Sparkles;
  return (
    <Link
      href={`/services/${group.key}`}
      className="card card-accent group block border border-hairline bg-white p-6"
    >
      <Icon aria-hidden className="h-7 w-7 text-gold" strokeWidth={1.75} />
      <h3 className="mt-3 font-sans text-xl font-bold text-flag-blue">
        {group.title}
      </h3>
      <p className="mt-2 text-ink/80">{group.description}</p>
      <ul className="mt-4 space-y-1">
        {group.items.map((item) => (
          <li
            key={item}
            className="font-mono text-xs uppercase tracking-label text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-5 font-mono text-xs uppercase tracking-label text-muted">
        You get
      </p>
      <ul className="mt-2 space-y-1 text-sm text-ink/80">
        {group.deliverables.map((d) => (
          <li key={d} className="flex gap-2">
            <span aria-hidden className="text-gold">
              →
            </span>
            {d}
          </li>
        ))}
      </ul>
      <span className="mt-5 block font-mono text-xs uppercase tracking-label text-muted group-hover:text-gold">
        Explore {group.title} →
      </span>
    </Link>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- ServiceCard`
Expected: PASS (both the updated "renders an icon…link" case and the "maps every key" case).

- [ ] **Step 5: Full suite + build**

Run: `npm test` then `npm run build`
Expected: green (home grid + `/services` index now render cards as links).

- [ ] **Step 6: Commit**

```bash
git add web/components/ServiceCard.tsx web/tests/components/ServiceCard.test.tsx
git commit -m "feat: service cards link to their detail pages"
```

---

### Task 4: Contact pre-fill from the service CTA

**Files:**
- Modify: `web/components/ContactForm.tsx` (add `defaultMessage` prop)
- Modify: `web/app/contact/page.tsx` (async, read `?service=`)
- Test: `web/tests/pages/contact.test.tsx` (create)
- Modify: `web/tests/components/ContactForm.test.tsx` (add a prefill case)

**Interfaces:**
- Consumes: `SERVICE_GROUPS` (title lookup by `key`).
- Produces: `ContactForm({ defaultMessage?: string })`; `ContactPage` async with `{ searchParams: Promise<{ service?: string }> }`.

- [ ] **Step 1: Write failing tests**

Add to `web/tests/components/ContactForm.test.tsx` (new `it` in the existing describe):
```tsx
  it("seeds the message textarea when defaultMessage is provided", () => {
    render(<ContactForm defaultMessage={"I'm interested in: AI\n\n"} />);
    expect(screen.getByLabelText(/message/i)).toHaveValue("I'm interested in: AI\n\n");
  });
```

Create `web/tests/pages/contact.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContactPage from "@/app/contact/page";

describe("contact page prefill", () => {
  it("prefills the message from a known ?service", async () => {
    render(await ContactPage({ searchParams: Promise.resolve({ service: "ai" }) }));
    expect(screen.getByLabelText(/message/i)).toHaveValue("I'm interested in: AI\n\n");
  });

  it("leaves the message empty for an unknown or absent service", async () => {
    render(await ContactPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByLabelText(/message/i)).toHaveValue("");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- contact ContactForm`
Expected: FAIL — `ContactForm` ignores `defaultMessage`; `ContactPage` isn't async / doesn't prefill.

- [ ] **Step 3: Add `defaultMessage` to `ContactForm`**

In `web/components/ContactForm.tsx`, change the signature and the textarea:
```tsx
export function ContactForm({ defaultMessage }: { defaultMessage?: string } = {}) {
```
and give the message `<textarea>` a default value:
```tsx
        <textarea
          id="message"
          name="message"
          rows={5}
          defaultValue={defaultMessage}
          className="mt-1 w-full rounded-tile-sm border border-hairline bg-white p-3 text-ink"
        />
```
(Leave the rest of the component unchanged.)

- [ ] **Step 4: Make the contact page read `?service=`**

Replace `web/app/contact/page.tsx` with:
```tsx
import { ContactForm } from "@/components/ContactForm";
import { SERVICE_GROUPS } from "@/lib/services";

export const metadata = {
  title: "Contact — 246Labs",
  description:
    "Start a project with 246Labs — cloud, AI, and DevOps engineering from Barbados. We reply within 1 business day.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const group = service
    ? SERVICE_GROUPS.find((g) => g.key === service)
    : undefined;
  const defaultMessage = group
    ? `I'm interested in: ${group.title}\n\n`
    : undefined;

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-label text-muted">
        Contact
      </p>
      <h1 className="mt-2 font-sans text-4xl font-bold tracking-wordmark text-flag-blue">
        Start a project.
      </h1>
      <p className="mt-4 text-lg text-ink/80">
        Tell us what you&apos;re building. Or email{" "}
        <a className="text-flag-blue underline" href="mailto:hello@246labs.cloud">
          hello@246labs.cloud
        </a>
        .
      </p>
      <p className="mt-2 font-mono text-xs uppercase tracking-label text-muted">
        Based in Barbados · Working across the Caribbean and beyond · We reply
        within 1 business day
      </p>
      <div className="mt-10">
        <ContactForm defaultMessage={defaultMessage} />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- contact ContactForm`
Expected: PASS (prefill present for `ai`, empty otherwise; existing ContactForm cases still pass).

- [ ] **Step 6: Full suite + build**

Run: `npm test` then `npm run build`
Expected: green.

- [ ] **Step 7: Commit**

```bash
git add web/components/ContactForm.tsx web/app/contact/page.tsx web/tests/pages/contact.test.tsx web/tests/components/ContactForm.test.tsx
git commit -m "feat: contact form prefill from ?service= (service CTA hand-off)"
```

---

### Task 5: Sitemap includes the detail pages

**Files:**
- Modify: `web/app/sitemap.ts`
- Modify: `web/tests/seo/plumbing.test.tsx` (the sitemap assertion enumerates URLs exactly)

**Interfaces:**
- Consumes: `SERVICE_GROUPS` keys.

- [ ] **Step 1: Update the failing test**

In `web/tests/seo/plumbing.test.tsx`, replace the sitemap `it` block with:
```tsx
  it("lists the static routes and every service detail page on the canonical host", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toEqual([
      "https://246labs.cloud",
      "https://246labs.cloud/services",
      "https://246labs.cloud/about",
      "https://246labs.cloud/contact",
      "https://246labs.cloud/privacy",
      "https://246labs.cloud/services/ai",
      "https://246labs.cloud/services/build",
      "https://246labs.cloud/services/run",
      "https://246labs.cloud/services/cloud",
      "https://246labs.cloud/services/assurance",
      "https://246labs.cloud/services/hardware",
    ]);
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- plumbing`
Expected: FAIL — sitemap still returns only the five static URLs.

- [ ] **Step 3: Add service URLs to the sitemap**

Replace `web/app/sitemap.ts` with:
```ts
import type { MetadataRoute } from "next";
import { SERVICE_GROUPS } from "@/lib/services";

const BASE = "https://246labs.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/services", "/about", "/contact", "/privacy"];
  const servicePaths = SERVICE_GROUPS.map((g) => `/services/${g.key}`);
  return [...staticPaths, ...servicePaths].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.8,
  }));
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- plumbing`
Expected: PASS.

- [ ] **Step 5: Full suite + build**

Run: `npm test` then `npm run build`
Expected: green.

- [ ] **Step 6: Commit**

```bash
git add web/app/sitemap.ts web/tests/seo/plumbing.test.tsx
git commit -m "feat: add service detail pages to sitemap"
```
