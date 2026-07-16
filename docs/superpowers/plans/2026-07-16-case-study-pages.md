# Case Study Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each "Selected work" item an on-site case-study page at `/work/[slug]` so visitors land on 246Labs instead of leaving to the live product.

**Architecture:** Extend the `Work` type in `lib/work.ts` with optional case-study fields (narrative-first, metrics optional), add one shared route `app/work/[slug]/page.tsx` mirroring the existing `app/services/[slug]/page.tsx`, repoint `WorkCard` at the internal page, and register the new URLs in the sitemap. No CMS, no MDX — structured data only.

**Tech Stack:** Next.js 16 (App Router, async `params`), React 19, TypeScript, Tailwind, Vitest + Testing Library (jsdom).

## Global Constraints

- Run all commands from `web/` (the Next app root). Tests: `npm test` (vitest run).
- No fabricated metrics. `metrics` stays unset for real products until the owner supplies numbers. All narrative copy is derived from existing blurbs / the About page.
- Follow existing patterns: async `params: Promise<{ slug: string }>`, `notFound()` for unknown slugs, `alternates.canonical` per page, design tokens (`bg-paper`, `bg-white`, `flag-blue`, `gold`, `ink`, `muted`, `border-hairline`, `rounded-tile-sm`, `tracking-wordmark`, `tracking-label`).
- Path alias `@/` maps to `web/`.

---

### Task 1: Extend the Work model and seed case-study content

**Files:**
- Modify: `web/lib/work.ts`
- Test: `web/tests/lib/work.test.ts` (add cases; keep existing ones passing)

**Interfaces:**
- Produces: `type Metric = { label: string; value: string }`. `Work` gains optional `problem?: string`, `approach?: string[]`, `outcome?: string`, `stack?: string[]`, `metrics?: Metric[]`, `relatedServices?: string[]`. Existing fields (`name`, `blurb`, `href`, `image?`, `slug`) unchanged. `SELECTED_WORK` still exported, length 3, slugs `["sumdeting","bimweather","cargolink"]`.

- [ ] **Step 1: Write the failing test**

Add to `web/tests/lib/work.test.ts` inside the `describe("SELECTED_WORK", …)` block:

```ts
  it("gives each product narrative case-study content and valid related-service keys", () => {
    const SERVICE_KEYS = ["ai", "build", "run", "cloud", "assurance", "hardware"];
    for (const w of SELECTED_WORK) {
      expect(w.problem && w.problem.length).toBeGreaterThan(0);
      expect(w.approach && w.approach.length).toBeGreaterThan(0);
      expect(w.stack && w.stack.length).toBeGreaterThan(0);
      for (const key of w.relatedServices ?? []) {
        expect(SERVICE_KEYS).toContain(key);
      }
    }
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/lib/work.test.ts`
Expected: FAIL — the new test errors because `problem`/`approach`/`stack` are `undefined`.

- [ ] **Step 3: Replace `web/lib/work.ts` with the extended model + content**

```ts
export type Metric = { label: string; value: string };

export type Work = {
  name: string;
  blurb: string;
  href: string; // live product URL (external)
  image?: string; // e.g. "/work/sumdeting.webp"; omit until the file is committed
  slug: string;
  // Case-study fields (optional; narrative-first, metrics-ready).
  problem?: string;
  approach?: string[];
  outcome?: string;
  stack?: string[];
  metrics?: Metric[];
  relatedServices?: string[]; // SERVICE_GROUPS keys to cross-link
};

export const SELECTED_WORK: Work[] = [
  {
    name: "SumDeTing",
    blurb:
      "An AI math tutor for Caribbean students, from Common Entrance to CXC — Socratic and patient, built on Claude via Amazon Bedrock.",
    href: "https://sumdeting.246labs.cloud",
    image: "/work/sumdeting.webp",
    slug: "sumdeting",
    problem:
      "Caribbean students preparing for Common Entrance and CXC rarely have access to one-on-one tutoring, and generic math apps don't teach to the exams or the way local curricula expect.",
    approach: [
      "Built a Socratic tutor that guides students to the answer instead of handing it over.",
      "Grounded it in the Caribbean path from Common Entrance through CXC.",
      "Ran it on Claude via Amazon Bedrock, inside our own AWS.",
      "Shipped it as a web app any student can use from any device.",
    ],
    outcome:
      "A patient, always-available tutor that meets Caribbean students where they are — the same standard of AI product we'd build for a client.",
    stack: ["Claude", "Amazon Bedrock", "AWS"],
    relatedServices: ["ai", "build"],
  },
  {
    name: "Bim Weather",
    blurb:
      "Real-time weather and hurricane tracking for Barbados — live radar, forecasts, and storm alerts down to the parish.",
    href: "https://bimweather.246labs.cloud",
    image: "/work/bimweather.webp",
    slug: "bimweather",
    problem:
      "Barbados sits in the hurricane belt, but residents often rely on regional forecasts that don't resolve down to the parish or update fast enough as a storm moves.",
    approach: [
      "Pulled live radar, forecasts, and storm data into one real-time view.",
      "Resolved it to parish-level detail for Barbados.",
      "Built storm alerts that surface quickly when conditions change.",
      "Hosted it on AWS infrastructure we run and monitor.",
    ],
    outcome:
      "Real-time weather and hurricane tracking Barbadians can rely on when it matters most.",
    stack: ["AWS"],
    relatedServices: ["build", "run"],
  },
  {
    name: "CargoLink Barbados",
    blurb:
      "A smarter way to ship — a logistics platform for moving cargo to and from Barbados.",
    href: "https://cargolinkbarbados.com",
    image: "/work/cargolink.webp",
    slug: "cargolink",
    problem:
      "Moving cargo to and from Barbados meant juggling brokers, forms, and phone calls, with little visibility into where a shipment stood.",
    approach: [
      "Built a logistics platform to coordinate cargo moving to and from Barbados.",
      "Brought booking and tracking into one place.",
      "Designed it mobile-ready for operators who aren't at a desk.",
      "Deployed it on AWS with our standard CI/CD and least-privilege setup.",
    ],
    outcome:
      "A smarter way to ship — logistics coordination without the runaround.",
    stack: ["AWS"],
    relatedServices: ["build", "run"],
  },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/lib/work.test.ts`
Expected: PASS (all cases, including the three pre-existing ones).

- [ ] **Step 5: Commit**

```bash
git add web/lib/work.ts web/tests/lib/work.test.ts
git commit -m "feat: add case-study fields and content to Work model"
```

---

### Task 2: Add the `/work/[slug]` route

**Files:**
- Create: `web/app/work/[slug]/page.tsx`
- Test: `web/tests/pages/work-detail.test.tsx`

**Interfaces:**
- Consumes: `SELECTED_WORK` and `Work`/`Metric` from `@/lib/work`; `SERVICE_GROUPS` from `@/lib/services`; `Button` from `@/components/Button`.
- Produces: default export `WorkDetailPage({ params })` (async), named `generateStaticParams()` returning `{ slug }[]`, named `generateMetadata({ params })`.

- [ ] **Step 1: Write the failing test**

Create `web/tests/pages/work-detail.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WorkDetailPage, { generateStaticParams } from "@/app/work/[slug]/page";
import { SELECTED_WORK } from "@/lib/work";

describe("work detail page", () => {
  it("prerenders all work items", () => {
    const slugs = generateStaticParams().map((p) => p.slug).sort();
    expect(slugs).toEqual(SELECTED_WORK.map((w) => w.slug).sort());
  });

  it("renders SumDeTing: heading, problem, what-we-built, live link, related services", async () => {
    render(await WorkDetailPage({ params: Promise.resolve({ slug: "sumdeting" }) }));
    expect(
      screen.getByRole("heading", { level: 1, name: "SumDeTing" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/The problem/i)).toBeInTheDocument();
    expect(screen.getByText(/What we built/i)).toBeInTheDocument();
    // live product link (external)
    expect(screen.getByRole("link", { name: /Visit it live/i })).toHaveAttribute(
      "href",
      "https://sumdeting.246labs.cloud",
    );
    // related service cross-link
    expect(screen.getByRole("link", { name: /^AI$/ })).toHaveAttribute(
      "href",
      "/services/ai",
    );
    // back link
    expect(screen.getByRole("link", { name: /Work/i })).toHaveAttribute("href", "/#work");
  });

  it("omits the metrics band when no metrics are set", async () => {
    const { container } = render(
      await WorkDetailPage({ params: Promise.resolve({ slug: "sumdeting" }) }),
    );
    expect(container.querySelector("[data-metrics]")).toBeNull();
  });

  it("404s on an unknown slug", async () => {
    await expect(
      WorkDetailPage({ params: Promise.resolve({ slug: "nope" }) }),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/pages/work-detail.test.tsx`
Expected: FAIL — cannot resolve `@/app/work/[slug]/page`.

- [ ] **Step 3: Create `web/app/work/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SELECTED_WORK } from "@/lib/work";
import { SERVICE_GROUPS } from "@/lib/services";
import { Button } from "@/components/Button";

export function generateStaticParams() {
  return SELECTED_WORK.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = SELECTED_WORK.find((w) => w.slug === slug);
  if (!work) return {};
  return {
    title: `${work.name} — 246Labs`,
    description: work.blurb,
    alternates: { canonical: `/work/${work.slug}` },
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = SELECTED_WORK.find((w) => w.slug === slug);
  if (!work) notFound();

  const services = (work.relatedServices ?? [])
    .map((k) => SERVICE_GROUPS.find((g) => g.key === k))
    .filter((g): g is (typeof SERVICE_GROUPS)[number] => Boolean(g));

  return (
    <>
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/#work"
            className="font-mono text-xs uppercase tracking-label text-muted hover:text-gold"
          >
            ← Work
          </Link>
          <h1 className="mt-4 font-sans text-4xl font-bold tracking-wordmark text-flag-blue sm:text-5xl">
            {work.name}
          </h1>
          <p className="mt-4 text-lg text-ink/80">{work.blurb}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          {work.metrics && work.metrics.length > 0 && (
            <dl data-metrics className="mb-12 grid gap-6 sm:grid-cols-3">
              {work.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="font-sans text-3xl font-bold text-flag-blue">
                    {m.value}
                  </dt>
                  <dd className="mt-1 font-mono text-xs uppercase tracking-label text-muted">
                    {m.label}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {work.problem && (
            <>
              <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                The problem
              </h2>
              <p className="mt-4 text-ink/80">{work.problem}</p>
            </>
          )}

          {work.approach && work.approach.length > 0 && (
            <>
              <h2 className="mt-12 font-mono text-xs uppercase tracking-label text-muted">
                What we built
              </h2>
              <ol className="mt-4 space-y-4">
                {work.approach.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="font-mono text-sm font-bold text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-ink/80">{step}</span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {work.outcome && (
            <>
              <h2 className="mt-12 font-mono text-xs uppercase tracking-label text-muted">
                The result
              </h2>
              <p className="mt-4 text-ink/80">{work.outcome}</p>
            </>
          )}

          {work.stack && work.stack.length > 0 && (
            <>
              <h2 className="mt-12 font-mono text-xs uppercase tracking-label text-muted">
                The stack
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {work.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-tile-sm border border-hairline px-4 py-2 font-mono text-xs uppercase tracking-label text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-12">
            <a
              href={work.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-label text-flag-blue underline hover:text-gold"
            >
              Visit it live ↗
            </a>
          </div>

          <div className="mt-8">
            <Button href="/contact" variant="primary">
              Start a project
            </Button>
          </div>

          {services.length > 0 && (
            <div className="mt-12">
              <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                Related services
              </h2>
              <ul className="mt-4 space-y-2">
                {services.map((g) => (
                  <li key={g.key}>
                    <Link
                      href={`/services/${g.key}`}
                      className="font-bold text-flag-blue underline hover:text-gold"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/pages/work-detail.test.tsx`
Expected: PASS (4 cases).

Note on the `/^AI$/` matcher: the related-service link text is exactly the service `title` (`"AI"`); the anchored regex avoids matching "Start a project" or other text.

- [ ] **Step 5: Commit**

```bash
git add web/app/work/[slug]/page.tsx web/tests/pages/work-detail.test.tsx
git commit -m "feat: add /work/[slug] case-study pages"
```

---

### Task 3: Point WorkCard at the internal case-study page

**Files:**
- Modify: `web/components/WorkCard.tsx`
- Test: `web/tests/components/WorkCard.test.tsx` (rewrite link assertions)
- Test: `web/tests/pages/home.test.tsx` (update the "selected work" case)

**Interfaces:**
- Consumes: `Work` from `@/lib/work` (uses `work.slug`).
- Produces: `WorkCard` now renders a Next.js `<Link href="/work/{slug}">` (no `target`/`rel`); the external live link no longer lives on the card.

- [ ] **Step 1: Update the failing tests first**

Replace the body of `web/tests/components/WorkCard.test.tsx` with:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WorkCard } from "@/components/WorkCard";

const work = {
  name: "SumDeTing",
  blurb: "An AI math tutor.",
  href: "https://sumdeting.246labs.cloud",
  slug: "sumdeting",
};

describe("WorkCard", () => {
  it("links internally to the case study with name, blurb, and a thumbnail zone", () => {
    const { container } = render(<WorkCard work={work} />);
    const link = screen.getByRole("link", { name: /SumDeTing/i });
    expect(link).toHaveAttribute("href", "/work/sumdeting");
    expect(link).not.toHaveAttribute("target");
    expect(screen.getByText("An AI math tutor.")).toBeInTheDocument();
    expect(container.querySelector("[data-work-thumb]")).not.toBeNull();
  });

  it("shows the gradient placeholder (no <img>) when no image is set", () => {
    const { container } = render(<WorkCard work={work} />);
    const thumb = container.querySelector("[data-work-thumb]")!;
    expect(thumb.querySelector("img")).toBeNull();
    expect(thumb.textContent).toContain("SumDeTing");
  });

  it("renders a screenshot image with alt text when image is set", () => {
    const { container } = render(
      <WorkCard work={{ ...work, image: "/work/sumdeting.webp" }} />,
    );
    const thumb = container.querySelector("[data-work-thumb]")!;
    const img = thumb.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "SumDeTing screenshot");
    expect(thumb.className).toContain("relative");
  });
});
```

In `web/tests/pages/home.test.tsx`, replace the `it("shows the selected work with external links", …)` case with:

```tsx
  it("links selected work to their case-study pages", () => {
    render(<Home />);
    expect(
      screen.getByRole("link", { name: /SumDeTing/i }),
    ).toHaveAttribute("href", "/work/sumdeting");
    expect(
      screen.getByRole("link", { name: /Bim Weather/i }),
    ).toHaveAttribute("href", "/work/bimweather");
    expect(
      screen.getByRole("link", { name: /CargoLink Barbados/i }),
    ).toHaveAttribute("href", "/work/cargolink");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/components/WorkCard.test.tsx tests/pages/home.test.tsx`
Expected: FAIL — WorkCard still links to the external `href` with `target="_blank"`.

- [ ] **Step 3: Update `web/components/WorkCard.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/lib/work";

export function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/work/${work.slug}`}
      className="card group flex flex-col overflow-hidden border border-hairline bg-white"
    >
      {/* Thumbnail zone — a real screenshot (16:9) when `image` is set,
          otherwise the brand-gradient placeholder with the product name. */}
      <div
        data-work-thumb
        className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-navy to-flag-blue"
      >
        {work.image ? (
          <Image
            src={work.image}
            alt={`${work.name} screenshot`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <span className="font-sans text-lg font-bold tracking-wordmark text-white/90">
            {work.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-sans text-xl font-bold text-flag-blue">
          {work.name}
        </h3>
        <p className="mt-2 flex-1 text-ink/80">{work.blurb}</p>
        <span className="mt-4 font-mono text-xs uppercase tracking-label text-muted group-hover:text-gold">
          View case study →
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/components/WorkCard.test.tsx tests/pages/home.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/components/WorkCard.tsx web/tests/components/WorkCard.test.tsx web/tests/pages/home.test.tsx
git commit -m "feat: link work cards to their case-study pages"
```

---

### Task 4: Register work pages in the sitemap

**Files:**
- Modify: `web/app/sitemap.ts`
- Test: `web/tests/seo/plumbing.test.tsx` (extend the expected URL list)

**Interfaces:**
- Consumes: `SELECTED_WORK` from `@/lib/work`.
- Produces: sitemap output now includes `/work/{slug}` for each work item, appended after the service paths.

- [ ] **Step 1: Update the failing test first**

In `web/tests/seo/plumbing.test.tsx`, extend the expected array in the sitemap test to append the three work URLs after the service ones:

```tsx
      "https://246labs.cloud/services/hardware",
      "https://246labs.cloud/work/sumdeting",
      "https://246labs.cloud/work/bimweather",
      "https://246labs.cloud/work/cargolink",
    ]);
```

(That closing `]);` replaces the existing one — the only change is inserting the three `/work/*` lines before it.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/seo/plumbing.test.tsx`
Expected: FAIL — sitemap is missing the three `/work/*` URLs.

- [ ] **Step 3: Update `web/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { SERVICE_GROUPS } from "@/lib/services";
import { SELECTED_WORK } from "@/lib/work";

const BASE = "https://246labs.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/services", "/about", "/contact", "/privacy"];
  const servicePaths = SERVICE_GROUPS.map((g) => `/services/${g.key}`);
  const workPaths = SELECTED_WORK.map((w) => `/work/${w.slug}`);
  return [...staticPaths, ...servicePaths, ...workPaths].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.8,
  }));
}
```

- [ ] **Step 4: Run the full suite to verify everything passes**

Run: `npm test`
Expected: PASS — all suites green, including `work.test.ts`, `work-detail.test.tsx`, `WorkCard.test.tsx`, `home.test.tsx`, `seo/plumbing.test.tsx`.

- [ ] **Step 5: Commit**

```bash
git add web/app/sitemap.ts web/tests/seo/plumbing.test.tsx
git commit -m "feat: add work case-study pages to sitemap"
```

---

## Verification (after all tasks)

- [ ] `npm run lint` — clean.
- [ ] `npm run build` — succeeds; `/work/sumdeting`, `/work/bimweather`, `/work/cargolink` appear as statically prerendered routes in the build output.
- [ ] `npm test` — all suites pass.
- [ ] Manual: `npm run dev`, open `/`, click a work card → lands on the case-study page; "Visit it live ↗" opens the product in a new tab; "Related services" links reach the service pages; an unknown `/work/xyz` renders the 404 page.

## Self-Review notes

- **Spec coverage:** data model (Task 1), route + layout + metrics-optional + related services (Task 2), WorkCard internal link + bidirectional cross-link (Task 2 renders related services; service pages already render related work) (Task 3), sitemap (Task 4), tests (every task). Error handling via `notFound()` (Task 2). All spec sections covered.
- **No invented metrics:** `metrics` left unset; band is guarded and tested absent.
- **Type consistency:** `Work`, `Metric`, `relatedServices`, `generateStaticParams`, `WorkDetailPage` names match across tasks and tests.
