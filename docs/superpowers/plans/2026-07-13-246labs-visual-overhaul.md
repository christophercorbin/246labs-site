# 246Labs Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Implementers doing the visual craft should consult the `frontend-design` skill.

**Goal:** A refined-premium visual pass over the live 246Labs site — section-band rhythm, elevated gold-accented cards, a visible hero headline, brand-motif + motion polish, restyled Selected Work strip — plus removing the traffic dots from the on-page logo and adding them to the favicon.

**Architecture:** Shared CSS utilities (card elevation, scroll-reveal, gold accent) added once in `globals.css`, consumed by both card components and all three pages. Logo drops its dots (kept titlebar bar); the 32px favicon gains them. Home gets banded sections + a visible `<h1>` + a navy Selected Work band with styled thumbnail cards; Services/About get the same card/band/type/motion treatment. Ships as one PR through the pipeline.

**Tech Stack:** Next.js 16 App Router, Tailwind v3 (brand tokens), CSS scroll-driven animations (`animation-timeline: view()`, progressively enhanced), `next/og` ImageResponse (favicon), Vitest/RTL, AWS Amplify pipeline.

## Global Constraints

- All app code in `web/`; feature branch off `main`; work from repo root `/Users/christophercorbin/246labs`.
- **Presentational only:** no copy/content rewrites, no new routes, no new npm dependencies, no backend/CI/IaC changes. Not a rebrand.
- **Brand palette (hex allowed in globals.css + ImageResponse only; components use Tailwind tokens):** navy `#001042`, flag-blue `#00267F`, panel-blue `#0A2E7A`, gold `#FFC726` (single accent, sparing), ink `#14161A`, muted `#5A6273`, faint `#9199A8`, hairline `#E3E5EA`, paper `#F6F7FB`, white `#FFFFFF`. Fonts: Space Grotesk (display/UI) + IBM Plex Mono (labels/meta).
- **Motion is progressive enhancement:** every reveal/hover animation must be invisible-to-absent under `prefers-reduced-motion: reduce` AND leave content fully visible when the animation is unsupported or off (base state = visible; motion only enhances). No content hidden-by-default without a visible fallback. No cumulative layout shift.
- **Traffic dots:** removed from the on-page `Logo`; the panel-blue titlebar strip stays. Added to `app/icon.tsx` (32px). `app/apple-icon.tsx` unchanged.
- **Hero:** a visible `<h1>` replaces the current `sr-only` one; BootAnimation (logo + tagline) stays; h1 text is distinct from the tagline (no duplicate line).
- Full gate before each commit: `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`.
- Ships via pipeline (verify → auto-merge → deploy); live visual read-through at desktop + mobile widths.

## File Structure

```
web/
  app/globals.css            # + .card, .card-accent, .reveal (scroll-driven, PE), section helpers
  app/icon.tsx               # + three traffic dots in the favicon titlebar
  components/Logo.tsx        # − three traffic-dot spans (keep titlebar bar)
  components/ServiceCard.tsx # use .card + hover + gold accent
  components/WorkCard.tsx    # .card + styled thumbnail zone (image-ready)
  app/page.tsx               # banded sections, visible h1, navy work band + watermark, reveals
  app/services/page.tsx      # band/type/reveal polish
  app/about/page.tsx         # band/type/reveal polish
  tests/…                    # update assertions touched by dots/h1
```

---

### Task 1: Foundations + logo dots + favicon dots

**Files:**
- Modify: `web/app/globals.css`, `web/components/Logo.tsx`, `web/app/icon.tsx`
- Test: `web/tests/components/Logo.test.tsx`

**Interfaces:**
- Produces CSS utilities consumed by Tasks 2–4: `.card` (elevation + hover),
  `.card-accent` (gold top rule), `.reveal` (progressive scroll-reveal).
- Logo renders with NO `bg-traffic-*` dots; titlebar bar retained.

- [ ] **Step 1: Append foundations to `web/app/globals.css`** (after the existing boot-animation block)

```css
/* ---- Visual overhaul foundations ---- */

/* Elevated card: soft shadow, rounded, lifts on hover. Colours/borders come
   from the consuming component (works on light or dark bands). */
.card {
  border-radius: theme("borderRadius.tile");
  box-shadow:
    0 1px 2px rgba(0, 16, 66, 0.04),
    0 8px 24px rgba(0, 16, 66, 0.06);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}
.card:hover {
  box-shadow:
    0 2px 4px rgba(0, 16, 66, 0.06),
    0 16px 40px rgba(0, 16, 66, 0.12);
  transform: translateY(-2px);
}

/* Gold single-accent top rule for cards/section headers. */
.card-accent {
  border-top: 2px solid theme("colors.gold");
}

/* Scroll-reveal — progressive enhancement only. Base state is fully visible;
   the fade/rise applies ONLY where scroll-timelines are supported AND motion
   is allowed. Unsupported browsers, no-JS, and reduced-motion all render the
   final visible state with zero layout shift. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    @keyframes reveal-in {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
    }
    .reveal {
      animation: reveal-in linear both;
      animation-timeline: view();
      animation-range: entry 5% cover 20%;
    }
  }
}
```

- [ ] **Step 2: Update the failing Logo test** — append to `web/tests/components/Logo.test.tsx`:

```tsx
  it("no longer renders traffic dots (moved to the favicon)", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector(".bg-traffic-red")).toBeNull();
    expect(container.querySelector(".bg-traffic-amber")).toBeNull();
    expect(container.querySelector(".bg-traffic-green")).toBeNull();
  });
```

- [ ] **Step 3: Run to verify it fails**

Run: `cd web && npx vitest run tests/components/Logo.test.tsx`
Expected: FAIL — the three dot spans still exist.

- [ ] **Step 4: Remove the dots in `web/components/Logo.tsx`** — replace the titlebar `<span>` (the one containing the three `bg-traffic-*` spans) with an empty bar:

```tsx
          <span className="h-[13px] bg-panel-blue" />
```
(Removes the three dot child spans; keeps the panel-blue titlebar strip. Everything else in `Logo.tsx` — wrapper, trident, cursor, wordmark, `animated` classes, `aria-label` — is unchanged.)

- [ ] **Step 5: Run to verify it passes**

Run: `cd web && npx vitest run tests/components/Logo.test.tsx`
Expected: PASS (the dot-absence test + existing wordmark/accessible-name tests).

- [ ] **Step 6: Add the dots to the favicon** — in `web/app/icon.tsx`, replace the titlebar `<div style={{ height: 8, background: "#0A2E7A" }} />` with a bar holding three tiny dots:

```tsx
        <div
          style={{
            height: 9,
            display: "flex",
            alignItems: "center",
            gap: 2,
            paddingLeft: 3,
            background: "#0A2E7A",
          }}
        >
          <div style={{ width: 3, height: 3, borderRadius: 2, background: "#FF5F56" }} />
          <div style={{ width: 3, height: 3, borderRadius: 2, background: "#FFBD2E" }} />
          <div style={{ width: 3, height: 3, borderRadius: 2, background: "#27C93F" }} />
        </div>
```
(The body `<div>` below it is unchanged; slightly shorter titlebar leaves room for the trident.)

- [ ] **Step 7: Full gate**

Run: `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: all pass; build renders `/icon`.

- [ ] **Step 8: Commit**

```bash
git add web/app/globals.css web/components/Logo.tsx web/app/icon.tsx web/tests/components/Logo.test.tsx
git commit -m "feat: card/reveal foundations; drop logo traffic dots; add dots to favicon"
```

---

### Task 2: Card restyle (ServiceCard + WorkCard)

**Files:**
- Modify: `web/components/ServiceCard.tsx`, `web/components/WorkCard.tsx`
- Test: `web/tests/lib/work.test.ts` unaffected; add `web/tests/components/WorkCard.test.tsx`

**Interfaces:**
- Consumes `.card` / `.card-accent` (Task 1). `WorkCard` prop unchanged (`{ work: Work }`); adds a thumbnail zone (image-ready).

- [ ] **Step 1: Restyle `web/components/ServiceCard.tsx`** — swap the flat border box for the elevation utility + gold accent (content unchanged):

```tsx
import type { ServiceGroup } from "@/lib/services";

export function ServiceCard({ group }: { group: ServiceGroup }) {
  return (
    <div className="card card-accent border border-hairline bg-white p-6">
      <h3 className="font-sans text-xl font-bold text-flag-blue">
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
    </div>
  );
}
```
(Deliverable arrows recolored `text-flag-blue`→`text-gold` for the accent; content identical.)

- [ ] **Step 2: Write the failing WorkCard test** `web/tests/components/WorkCard.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WorkCard } from "@/components/WorkCard";

const work = {
  name: "SumDeTing",
  blurb: "An AI math tutor.",
  href: "https://sumdeting.246labs.cloud",
};

describe("WorkCard", () => {
  it("links out with the name, blurb, and a thumbnail zone", () => {
    const { container } = render(<WorkCard work={work} />);
    const link = screen.getByRole("link", { name: /SumDeTing/i });
    expect(link).toHaveAttribute("href", "https://sumdeting.246labs.cloud");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("An AI math tutor.")).toBeInTheDocument();
    // Thumbnail zone present (data-attr marks the image-ready block).
    expect(container.querySelector('[data-work-thumb]')).not.toBeNull();
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `cd web && npx vitest run tests/components/WorkCard.test.tsx`
Expected: FAIL — no `[data-work-thumb]` element yet.

- [ ] **Step 4: Restyle `web/components/WorkCard.tsx`** with the thumbnail zone (image-ready)

```tsx
import type { Work } from "@/lib/work";

export function WorkCard({ work }: { work: Work }) {
  return (
    <a
      href={work.href}
      target="_blank"
      rel="noopener noreferrer"
      className="card group flex flex-col overflow-hidden border border-hairline bg-white"
    >
      {/* Thumbnail zone — brand gradient placeholder; a real screenshot later
          drops into this same 16:9 box (add an <img> with object-cover). */}
      <div
        data-work-thumb
        className="flex aspect-video items-center justify-center bg-gradient-to-br from-navy to-flag-blue"
      >
        <span className="font-sans text-lg font-bold tracking-wordmark text-white/90">
          {work.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-sans text-xl font-bold text-flag-blue">
          {work.name}
        </h3>
        <p className="mt-2 flex-1 text-ink/80">{work.blurb}</p>
        <span className="mt-4 font-mono text-xs uppercase tracking-label text-muted group-hover:text-gold">
          Visit ↗
        </span>
      </div>
    </a>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `cd web && npx vitest run tests/components/WorkCard.test.tsx`
Expected: PASS.

- [ ] **Step 6: Full gate**

Run: `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: all pass (Home/Services tests still pass — they query the same names/links, now inside restyled cards).

- [ ] **Step 7: Commit**

```bash
git add web/components/ServiceCard.tsx web/components/WorkCard.tsx web/tests/components/WorkCard.test.tsx
git commit -m "feat: elevate service/work cards; add image-ready work thumbnail zone"
```

---

### Task 3: Home rebrand (bands, visible h1, navy work band, reveals)

**Files:**
- Modify: `web/app/page.tsx`
- Test: `web/tests/pages/home.test.tsx`

**Interfaces:** consumes `.card`/`.reveal` (Task 1), restyled cards (Task 2), `BootAnimation`, `Button`, `SERVICE_GROUPS`, `SELECTED_WORK`.

- [ ] **Step 1: Update `web/tests/pages/home.test.tsx`** — the h1 is now a visible distinct headline; replace the file:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("shows a visible display h1 and a contact CTA", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /build, run, and secure/i }),
    ).toBeInTheDocument();
    const cta = screen.getAllByRole("link", { name: /start a project/i })[0];
    expect(cta).toHaveAttribute("href", "/contact");
  });

  it("keeps the brand tagline and the two pillars", () => {
    render(<Home />);
    expect(
      screen.getAllByText("Cloud infrastructure, built in the Caribbean.")[0],
    ).toBeInTheDocument();
    expect(screen.getByText(/the region competes/i)).toBeInTheDocument();
    expect(screen.getByText(/value stays home/i)).toBeInTheDocument();
  });

  it("shows the selected work with external links", () => {
    render(<Home />);
    expect(
      screen.getByRole("link", { name: /SumDeTing/i }),
    ).toHaveAttribute("href", "https://sumdeting.246labs.cloud");
    expect(
      screen.getByRole("link", { name: /Bim Weather/i }),
    ).toHaveAttribute("href", "https://bimweather.246labs.cloud");
    expect(
      screen.getByRole("link", { name: /CargoLink Barbados/i }),
    ).toHaveAttribute("href", "https://cargolinkbarbados.com");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd web && npx vitest run tests/pages/home.test.tsx`
Expected: FAIL — no visible h1 matching /build, run, and secure/.

- [ ] **Step 3: Replace `web/app/page.tsx`**

```tsx
import type { Metadata } from "next";
import { BootAnimation } from "@/components/BootAnimation";
import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { WorkCard } from "@/components/WorkCard";
import { SERVICE_GROUPS } from "@/lib/services";
import { SELECTED_WORK } from "@/lib/work";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* Hero (navy) */}
      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-28">
          <BootAnimation />
          <h1 className="max-w-3xl font-sans text-4xl font-bold leading-tight tracking-wordmark text-white sm:text-5xl">
            We build, run, and secure your cloud &amp; AI.
          </h1>
          <p className="max-w-2xl text-xl text-white/80">
            246Labs is a Caribbean cloud and AI studio. We build the software,
            run the infrastructure, and keep it secure — the same rigor
            you&apos;d expect from a firm in San Francisco or London, engineered
            from Barbados and delivered anywhere.
          </p>
          <div className="flex gap-4">
            <Button href="/contact" variant="primary">
              Start a project
            </Button>
            <Button href="/services" variant="ghost">
              See services
            </Button>
          </div>
        </div>
      </section>

      {/* Why (paper) */}
      <section className="reveal bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-label text-muted">
            Why 246Labs
          </p>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-sans text-2xl font-bold text-flag-blue">
                The region competes.
              </h2>
              <p className="mt-2 text-ink/80">
                Serious cloud and AI work doesn&apos;t have to be outsourced
                abroad. We deliver it from here — to the same standard, for
                clients anywhere.
              </p>
            </div>
            <div>
              <h2 className="font-sans text-2xl font-bold text-flag-blue">
                Value stays home.
              </h2>
              <p className="mt-2 text-ink/80">
                Every system we build keeps expertise and opportunity in the
                Caribbean, instead of draining away with the talent that leaves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services (white) */}
      <section className="reveal bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-label text-muted">
            What we do
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICE_GROUPS.map((group) => (
              <ServiceCard key={group.key} group={group} />
            ))}
          </div>
        </div>
      </section>

      {/* Selected work (navy band, with trident watermark) */}
      <section id="work" className="reveal relative overflow-hidden bg-navy">
        <span
          aria-hidden
          className="mark-mask pointer-events-none absolute -right-16 top-1/2 h-[420px] w-[420px] -translate-y-1/2 text-white/5"
          style={{
            WebkitMaskImage: "url(/brand/trident-white.png)",
            maskImage: "url(/brand/trident-white.png)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-label text-gold">
            Selected work
          </p>
          <h2 className="mt-2 font-sans text-3xl font-bold tracking-wordmark text-white">
            Things we&apos;ve shipped.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {SELECTED_WORK.map((work) => (
              <WorkCard key={work.href} work={work} />
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA (flag-blue) */}
      <section className="bg-flag-blue">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20">
          <h2 className="font-sans text-3xl font-bold tracking-wordmark text-white">
            Built in the Caribbean, delivered anywhere.
          </h2>
          <div className="flex gap-4">
            <Button href="/contact" variant="primary">
              Start a project
            </Button>
            <Button href="/about" variant="ghost">
              Our story
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
```
Note: the old `sr-only` h1 is gone (replaced by the visible one). BootAnimation still renders the tagline "Cloud infrastructure, built in the Caribbean." — distinct from the h1, so no duplicate. The trident watermark uses the existing `.mark-mask` + `text-white/5` (very low opacity), `aria-hidden`, `pointer-events-none`.

- [ ] **Step 4: Run home tests + full gate**

Run: `cd web && npm test && npm run build`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add web/app/page.tsx web/tests/pages/home.test.tsx
git commit -m "feat: rebrand home with visible h1, section bands, navy work band + reveals"
```

---

### Task 4: Services & About polish

**Files:**
- Modify: `web/app/services/page.tsx`, `web/app/about/page.tsx`
- Test: existing `web/tests/pages/services.test.tsx`, `web/tests/pages/about.test.tsx` (must still pass unchanged)

**Interfaces:** consumes `.reveal` (Task 1) + restyled `ServiceCard` (Task 2). Copy unchanged.

- [ ] **Step 1: Polish `web/app/services/page.tsx`** — add a paper hero band + reveal + bigger heading; the card grid already uses the restyled `ServiceCard`. Replace the file:

```tsx
import { SERVICE_GROUPS } from "@/lib/services";
import { ServiceCard } from "@/components/ServiceCard";

export const metadata = {
  title: "Services — 246Labs",
  description:
    "AI, build, run, cloud & DevOps, assurance, and hardware — everything 246Labs offers.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-paper">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="font-mono text-xs uppercase tracking-label text-muted">
            What we do
          </p>
          <h1 className="mt-2 font-sans text-4xl font-bold tracking-wordmark text-flag-blue sm:text-5xl">
            Services
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/80">
            We design, build, run, and secure cloud and AI systems — the same
            rigor you&apos;d expect from a firm in San Francisco or London,
            engineered from Barbados. Pick a lane or hand us the whole thing, as
            a scoped project or an ongoing retainer.
          </p>
        </div>
      </section>
      <section className="reveal bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICE_GROUPS.map((group) => (
              <ServiceCard key={group.key} group={group} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Polish `web/app/about/page.tsx`** — wrap the existing content in a paper band + reveal + larger h1; keep ALL copy, links, badges verbatim. Replace the file:

```tsx
export const metadata = {
  title: "About — 246Labs",
  description:
    "Why 246Labs exists: world-class cloud and AI engineering, built in the Caribbean and delivered anywhere.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <section className="reveal bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-label text-muted">
          About
        </p>
        <h1 className="mt-2 font-sans text-4xl font-bold tracking-wordmark text-flag-blue sm:text-5xl">
          An engineering studio that happens to live somewhere beautiful.
        </h1>
        <div className="mt-8 space-y-6 text-lg text-ink/80">
          <p>
            246Labs is a Caribbean cloud and AI studio. We build the software,
            run the infrastructure, and keep it secure — to the same standard as
            a firm in San Francisco or London, engineered from Barbados.
          </p>
          <p>
            It exists for a simple reason: serious engineering shouldn&apos;t
            have to leave the region to be world-class. Too much Caribbean talent
            gets exported — the work, and the people who do it. 246Labs is the
            bet that it can be built here instead, and stand up to anyone,
            anywhere.
          </p>
          <p>
            It&apos;s led by{" "}
            <strong className="text-ink">Christopher Corbin</strong>, Founder
            &amp; Principal Engineer — the person doing the work, not just running
            the business. New company, high standard, no shortcuts.
          </p>
          <p>
            The standard isn&apos;t a promise; it&apos;s already running.{" "}
            <a
              className="text-flag-blue underline"
              href="https://sumdeting.246labs.cloud"
              target="_blank"
              rel="noopener noreferrer"
            >
              SumDeTing
            </a>{" "}
            is an AI math tutor for Caribbean students built on Claude and Amazon
            Bedrock;{" "}
            <a
              className="text-flag-blue underline"
              href="https://bimweather.246labs.cloud"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bim Weather
            </a>{" "}
            tracks storms across Barbados in real time; and{" "}
            <a
              className="text-flag-blue underline"
              href="https://cargolinkbarbados.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              CargoLink Barbados
            </a>{" "}
            moves cargo smarter. Same stack we&apos;d build yours on.
          </p>
          <p>
            The broken trident in our mark is Barbados&apos; own. It stands for
            independence and for building things that last. That is the standard
            we hold our infrastructure to.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <span className="rounded-tile-sm border border-hairline px-4 py-2 font-mono text-xs uppercase tracking-label text-muted">
            Built on AWS
          </span>
          <span className="font-mono text-xs uppercase tracking-label text-muted">
            CONSULTING · DEVOPS · WEB APPS · HOSTING
          </span>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run tests + full gate**

Run: `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: all pass (services + about tests unchanged and green; copy byte-identical so their assertions hold).

- [ ] **Step 4: Commit**

```bash
git add web/app/services/page.tsx web/app/about/page.tsx
git commit -m "feat: apply band/type/reveal polish to services and about"
```

---

### Task 5: PROVISIONING — ship via pipeline + live visual read-through

> **CONTROLLER. Ships the PR through the live pipeline; verifies on production at two widths.**

- [ ] **Step 1: PR through the pipeline**

```bash
cd /Users/christophercorbin/246labs
git push -u origin feat/visual-overhaul
gh pr create --fill
gh pr merge --squash --auto --delete-branch
gh pr checks --watch --interval 20   # verify → auto-merge → Deploy → Amplify SUCCEED
```
If CI's "Set up job" fails on a transient GitHub Actions "Service Unavailable", re-run the failed run; if the branch shows BEHIND (strict protection), `git merge origin/main` and push.

- [ ] **Step 2: Wait for the NEW Amplify release, then verify live** (poll a job id newer than the current latest to `SUCCEED` before checking — do not check too early):

```bash
P=personal-246labs
# record current latest job id, then wait for a higher one to SUCCEED
aws amplify list-jobs --app-id d6h6ewkweev1n --branch-name main --max-items 1 \
  --profile $P --region us-east-1 --query 'jobSummaries[0].[jobId,status]' --output text
# (poll until a newer jobId shows SUCCEED)
B=https://246labs.cloud
curl -s -o /dev/null -w "home %{http_code}\n" $B
curl -s "$B/?cb=$RANDOM" | grep -c "build, run, and secure"    # visible h1 present
curl -s "$B/?cb=$RANDOM" | grep -c "Selected work"             # work band present
```
Expected: 200; h1 present; work band present.

- [ ] **Step 3: Human visual read-through (user)**

- Desktop + mobile: hero visible headline + boot animation; section bands read as distinct (navy → paper → white → navy work band → flag-blue); cards have elevation + hover; the trident watermark on the work band; scroll-reveal feels subtle (and the site is fully readable with reduced-motion on).
- **Browser tab:** favicon now shows the three traffic dots; the on-page logo (hero/nav/footer) shows the clean titlebar with NO dots.
- Selected Work cards show the gradient thumbnail placeholders (real screenshots are the later src-swap).

---

## Notes on testing philosophy

- Visual properties (shadows, gradients, reveal motion) aren't unit-testable; they're verified by the build gate + the live read-through. Tests guard the *structural* facts that must not regress: logo has no traffic dots, the hero h1 is visible, cards still expose the same names/links, the work thumbnail zone exists.
- Motion is progressive enhancement by construction (base = visible; `@supports` + `prefers-reduced-motion: no-preference` gate the animation), so reduced-motion and older browsers can't end up with hidden content — no test needed to prove a hidden-content regression that the CSS structurally prevents.
- Copy is byte-identical on Services/About, so their existing content/honesty tests (founder, product URLs, badge) remain valid unchanged.
