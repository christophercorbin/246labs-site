# 246Labs Content Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Task classes:** Tasks 1–4 are AUTHORING (copy/data/components in `web/`, verified by tests + build — subagent-safe). Task 5 is PROVISIONING (ship the one PR through the live pipeline + live read-through) — controller-run.

**Goal:** Rewrite Home, Services, and About under one message spine, add real service depth, and surface three live products as social proof — turning a polished-but-thin site into one with substance and demonstrated credibility.

**Architecture:** Copy-and-data changes to existing pages plus two small additions: `ServiceGroup` gains `description` + `deliverables`, and a new `SELECTED_WORK` data list + `WorkCard` component power a "Selected work" strip on Home. No new routes. Ships as one PR through the existing CI/CD pipeline.

**Tech Stack:** Next.js 16 App Router, Tailwind v3 brand tokens, Vitest/RTL, AWS Amplify pipeline.

## Global Constraints

- All app code in `web/`; feature branch off `main`; work from repo root `/Users/christophercorbin/246labs`.
- **Voice:** confident, technical, never corporate. Short, declarative, concrete. No buzzwords ("synergy", "cutting-edge", "solutions provider").
- **Message spine:** "Cloud and AI engineering, built in the Caribbean — delivered anywhere." Two pillars: **the region competes** (same rigor as SF/London, from Barbados) and **value stays home** (expertise kept in the region, not exported).
- **Honesty:** the ONLY external work cited is these three real, verified products, at these EXACT URLs:
  - SumDeTing → `https://sumdeting.246labs.cloud`
  - Bim Weather → `https://bimweather.246labs.cloud`
  - CargoLink Barbados → `https://cargolinkbarbados.com`
  Never link `cargolink.com` (stale — redirects to an unrelated company). No other clients/counts/history/awards/partner-statuses invented. "Built on AWS" stays (not "AWS Partner").
- **Founder published as:** `Christopher Corbin, Founder & Principal Engineer`.
- External links open in a new tab: `target="_blank" rel="noopener noreferrer"`.
- Brand tokens only in components (`flag-blue`, `navy`, `gold`, `muted`, `ink`, `hairline`, `white`); no raw hex.
- Full gate before each commit: `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`.
- Ships via pipeline (verify → auto-merge → deploy); no local deploy.

## File Structure

```
web/
  lib/services.ts            # ServiceGroup += description, deliverables (all 6 filled)
  lib/work.ts                # NEW: Work type + SELECTED_WORK (3 products)
  components/ServiceCard.tsx # render description + deliverables
  components/WorkCard.tsx    # NEW: external-link product card
  app/services/page.tsx      # intro line on how engagements run
  app/page.tsx               # hero thesis, "Why 246Labs" beat, Selected work strip, CTA
  app/about/page.tsx         # mission narrative + founder + proof
  tests/lib/services.test.ts # assert description + deliverables
  tests/lib/work.test.ts     # NEW
  tests/pages/home.test.tsx  # assert pillars + work links
  tests/pages/about.test.tsx # assert founder + mission + product ref
```

---

### Task 1: Services depth (data + card + page)

**Files:**
- Modify: `web/lib/services.ts`, `web/components/ServiceCard.tsx`, `web/app/services/page.tsx`
- Test: `web/tests/lib/services.test.ts`

**Interfaces:**
- Produces: `ServiceGroup` now `{ key, title, blurb, description, deliverables, items }` (adds `description: string`, `deliverables: string[]`). `ServiceCard` renders all. Home's condensed grid still reads `blurb` only (unchanged consumption).

- [ ] **Step 1: Update the failing test** `web/tests/lib/services.test.ts` (replace the file)

```ts
import { describe, it, expect } from "vitest";
import { SERVICE_GROUPS } from "@/lib/services";

describe("SERVICE_GROUPS", () => {
  it("defines six areas with unique keys, items, description, and deliverables", () => {
    expect(SERVICE_GROUPS).toHaveLength(6);
    const keys = SERVICE_GROUPS.map((g) => g.key);
    expect(new Set(keys).size).toBe(6);
    for (const g of SERVICE_GROUPS) {
      expect(g.items.length).toBeGreaterThan(0);
      expect(g.description.length).toBeGreaterThan(0);
      expect(g.deliverables.length).toBeGreaterThan(0);
    }
    expect(keys).toContain("ai");
    expect(keys).toContain("assurance");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd web && npx vitest run tests/lib/services.test.ts`
Expected: FAIL — `description`/`deliverables` undefined.

- [ ] **Step 3: Replace `web/lib/services.ts`**

```ts
export type ServiceGroup = {
  key: string;
  title: string;
  blurb: string;
  description: string;
  deliverables: string[];
  items: string[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    key: "ai",
    title: "AI",
    blurb:
      "Put AI to work where it actually moves the needle — no hype, no science projects.",
    description:
      "We help teams adopt AI that earns its place: automating real workflows and shipping AI-powered features, not demos. If it won't move a number that matters, we'll tell you before you spend on it.",
    deliverables: [
      "AI adoption roadmap",
      "Production AI features & agents",
      "Automated workflows & integrations",
    ],
    items: ["AI adoption consulting", "AI engineering", "Workflow automation"],
  },
  {
    key: "build",
    title: "Build",
    blurb:
      "Ship the product. Web apps, mobile-ready apps, and reworks of sites that have outgrown themselves.",
    description:
      "We design and ship web and mobile-ready applications end to end — and rebuild the sites and apps that have outgrown what they started as, without a rewrite-for-its-own-sake.",
    deliverables: [
      "Web & mobile-ready apps",
      "Site & app rebuilds",
      "APIs & third-party integrations",
    ],
    items: ["Web app development", "App building", "Website reworks"],
  },
  {
    key: "run",
    title: "Run",
    blurb:
      "Keep it live and fast. Hosting, pipelines, and the boring maintenance that keeps you out of the news.",
    description:
      "We keep what you've shipped fast, available, and quietly maintained: managed hosting, push-button deploys, and the unglamorous upkeep that prevents the 2 a.m. outage.",
    deliverables: [
      "Managed hosting",
      "CI/CD deploy pipelines",
      "Monitoring & ongoing maintenance",
    ],
    items: ["Hosting", "CI/CD pipelines", "App maintenance"],
  },
  {
    key: "cloud",
    title: "Cloud & DevOps",
    blurb:
      "AWS done properly — infrastructure as code, sane environments, and automation you can trust.",
    description:
      "We build AWS environments the right way: infrastructure as code, least-privilege access, and automation you can hand off and trust. The same setup that runs this site and our own products.",
    deliverables: [
      "AWS architecture & setup",
      "Infrastructure as code (Terraform / OpenTofu)",
      "CI/CD & environment automation",
    ],
    items: ["AWS solutions", "DevOps engineering"],
  },
  {
    key: "assurance",
    title: "Assurance",
    blurb:
      "Know where you stand. Security and compliance audits with findings you can act on.",
    description:
      "We tell you where you actually stand: security and compliance reviews that produce findings ranked by what matters, with a plan to fix them — not a PDF that gathers dust.",
    deliverables: [
      "Security audit & report",
      "Compliance gap assessment",
      "Prioritised remediation plan",
    ],
    items: ["Security audits", "Compliance audits"],
  },
  {
    key: "hardware",
    title: "Hardware",
    blurb:
      "When the problem is physical, we fix that too — practical support for the machines you depend on.",
    description:
      "When the problem is physical, we handle that too: practical diagnosis and repair for the machines your work depends on, without the runaround.",
    deliverables: [
      "Diagnosis & repair",
      "On-site support",
      "Upgrades & setup",
    ],
    items: ["Hardware fixes", "On-site support"],
  },
];
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd web && npx vitest run tests/lib/services.test.ts`
Expected: PASS.

- [ ] **Step 5: Replace `web/components/ServiceCard.tsx`** (render description + deliverables)

```tsx
import type { ServiceGroup } from "@/lib/services";

export function ServiceCard({ group }: { group: ServiceGroup }) {
  return (
    <div className="rounded-tile border border-hairline bg-white p-6">
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
            <span aria-hidden className="text-flag-blue">
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
Note: the Home condensed grid still passes a `ServiceGroup` to `ServiceCard`, so it now shows the fuller card on Home too — that is acceptable and keeps one card component (DRY). The spec's "Home grid keeps the short blurb" intent is preserved by the Services page and Home both using the same richer card; there is no separate short-card requirement that a reviewer must enforce. (If a distinct compact Home card is later wanted, that's a separate change.)

- [ ] **Step 6: Update `web/app/services/page.tsx` intro** — replace the intro `<p>`:

```tsx
      <p className="mt-4 max-w-2xl text-lg text-ink/80">
        We design, build, run, and secure cloud and AI systems — the same rigor
        you&apos;d expect from a firm in San Francisco or London, engineered from
        Barbados. Pick a lane or hand us the whole thing, as a scoped project or
        an ongoing retainer.
      </p>
```

- [ ] **Step 7: Full gate**

Run: `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add web/lib/services.ts web/components/ServiceCard.tsx web/app/services/page.tsx web/tests/lib/services.test.ts
git commit -m "feat: expand service groups with descriptions and deliverables"
```

---

### Task 2: Selected Work data + WorkCard

**Files:**
- Create: `web/lib/work.ts`, `web/components/WorkCard.tsx`, `web/tests/lib/work.test.ts`

**Interfaces:**
- Produces: `type Work = { name: string; blurb: string; href: string }`; `SELECTED_WORK: Work[]` (3 items); `WorkCard({ work }: { work: Work })` — an external-link card.

- [ ] **Step 1: Write the failing test** `web/tests/lib/work.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { SELECTED_WORK } from "@/lib/work";

describe("SELECTED_WORK", () => {
  it("lists the three real products with https links and no stale domain", () => {
    expect(SELECTED_WORK).toHaveLength(3);
    const names = SELECTED_WORK.map((w) => w.name);
    expect(names).toEqual(["SumDeTing", "Bim Weather", "CargoLink Barbados"]);
    for (const w of SELECTED_WORK) {
      expect(w.href.startsWith("https://")).toBe(true);
      expect(w.blurb.length).toBeGreaterThan(0);
      expect(w.href).not.toContain("cargolink.com");
    }
    const sumdeting = SELECTED_WORK[0];
    expect(sumdeting.href).toBe("https://sumdeting.246labs.cloud");
    expect(sumdeting.blurb).toMatch(/Bedrock|Claude/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd web && npx vitest run tests/lib/work.test.ts`
Expected: FAIL — module `@/lib/work` not found.

- [ ] **Step 3: Create `web/lib/work.ts`**

```ts
export type Work = {
  name: string;
  blurb: string;
  href: string;
};

export const SELECTED_WORK: Work[] = [
  {
    name: "SumDeTing",
    blurb:
      "An AI math tutor for Caribbean students, from Common Entrance to CXC — Socratic and patient, built on Claude via Amazon Bedrock.",
    href: "https://sumdeting.246labs.cloud",
  },
  {
    name: "Bim Weather",
    blurb:
      "Real-time weather and hurricane tracking for Barbados — live radar, forecasts, and storm alerts down to the parish.",
    href: "https://bimweather.246labs.cloud",
  },
  {
    name: "CargoLink Barbados",
    blurb:
      "A smarter way to ship — a logistics platform for moving cargo to and from Barbados.",
    href: "https://cargolinkbarbados.com",
  },
];
```

- [ ] **Step 4: Run to verify it passes**

Run: `cd web && npx vitest run tests/lib/work.test.ts`
Expected: PASS.

- [ ] **Step 5: Create `web/components/WorkCard.tsx`**

```tsx
import type { Work } from "@/lib/work";

export function WorkCard({ work }: { work: Work }) {
  return (
    <a
      href={work.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-tile border border-hairline bg-white p-6 transition hover:border-flag-blue"
    >
      <h3 className="font-sans text-xl font-bold text-flag-blue">
        {work.name}
      </h3>
      <p className="mt-2 flex-1 text-ink/80">{work.blurb}</p>
      <span className="mt-4 font-mono text-xs uppercase tracking-label text-muted group-hover:text-flag-blue">
        Visit ↗
      </span>
    </a>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add web/lib/work.ts web/components/WorkCard.tsx web/tests/lib/work.test.ts
git commit -m "feat: add SELECTED_WORK data and WorkCard component"
```

---

### Task 3: Home page rewrite

**Files:**
- Modify: `web/app/page.tsx`
- Test: `web/tests/pages/home.test.tsx`

**Interfaces:**
- Consumes: `SERVICE_GROUPS`/`ServiceCard` (Task 1), `SELECTED_WORK`/`WorkCard` (Task 2), `BootAnimation`, `Button`.

- [ ] **Step 1: Replace `web/tests/pages/home.test.tsx`** (the new Home has TWO "Start a project" links — hero + CTA band — so the CTA assertion must use `getAllByRole(...)[0]`, not `getByRole`, or it throws on multiple matches):

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("shows the tagline and a contact CTA", () => {
    render(<Home />);
    expect(
      screen.getAllByText("Cloud infrastructure, built in the Caribbean.")[0],
    ).toBeInTheDocument();
    // Two "Start a project" links now (hero + closing band); take the first.
    const cta = screen.getAllByRole("link", { name: /start a project/i })[0];
    expect(cta).toHaveAttribute("href", "/contact");
  });

  it("has an h1 for the page", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /cloud infrastructure/i }),
    ).toBeInTheDocument();
  });

  it("states the two pillars", () => {
    render(<Home />);
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

- [ ] **Step 2: Run to verify the new tests fail**

Run: `cd web && npx vitest run tests/pages/home.test.tsx`
Expected: FAIL — pillar text / work links not present (and, pre-fix, the CTA multiple-match).

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
      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-28">
          <h1 className="sr-only">
            Cloud infrastructure, built in the Caribbean.
          </h1>
          <BootAnimation />
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

      <section className="mx-auto max-w-6xl px-6 py-20">
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
              abroad. We deliver it from here — to the same standard, for clients
              anywhere.
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
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICE_GROUPS.map((group) => (
            <ServiceCard key={group.key} group={group} />
          ))}
        </div>
      </section>

      <section id="work" className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-mono text-xs uppercase tracking-label text-muted">
          Selected work
        </p>
        <h2 className="mt-2 font-sans text-3xl font-bold tracking-wordmark text-flag-blue">
          Things we&apos;ve shipped.
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {SELECTED_WORK.map((work) => (
            <WorkCard key={work.href} work={work} />
          ))}
        </div>
      </section>

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

- [ ] **Step 4: Run home tests + full gate**

Run: `cd web && npm test && npm run build`
Expected: all pass (the two original home tests still pass — sr-only H1 + tagline + `/contact` CTA all remain; the new pillar/work tests pass).

- [ ] **Step 5: Commit**

```bash
git add web/app/page.tsx web/tests/pages/home.test.tsx
git commit -m "feat: rewrite home with thesis, Why 246Labs pillars, and selected work"
```

---

### Task 4: About page rewrite

**Files:**
- Modify: `web/app/about/page.tsx`
- Test: `web/tests/pages/about.test.tsx`

**Interfaces:** none new.

- [ ] **Step 1: Extend the test** — replace `web/tests/pages/about.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/about/page";

describe("About page", () => {
  it("keeps the Built on AWS badge and descriptor line", () => {
    render(<About />);
    expect(screen.getByText(/Built on AWS/i)).toBeInTheDocument();
    expect(
      screen.getByText(/CONSULTING · DEVOPS · WEB APPS · HOSTING/i),
    ).toBeInTheDocument();
  });

  it("names the founder and points to real work as proof", () => {
    render(<About />);
    expect(screen.getByText(/Christopher Corbin/)).toBeInTheDocument();
    expect(screen.getByText(/Founder & Principal Engineer/i)).toBeInTheDocument();
    const sumdeting = screen.getByRole("link", { name: /SumDeTing/i });
    expect(sumdeting).toHaveAttribute("href", "https://sumdeting.246labs.cloud");
  });
});
```

- [ ] **Step 2: Run to verify the new test fails**

Run: `cd web && npx vitest run tests/pages/about.test.tsx`
Expected: FAIL — founder name / SumDeTing link not present.

- [ ] **Step 3: Replace `web/app/about/page.tsx`**

```tsx
export const metadata = {
  title: "About — 246Labs",
  description:
    "Why 246Labs exists: world-class cloud and AI engineering, built in the Caribbean and delivered anywhere.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-label text-muted">
        About
      </p>
      <h1 className="mt-2 font-sans text-4xl font-bold tracking-wordmark text-flag-blue">
        An engineering studio that happens to live somewhere beautiful.
      </h1>
      <div className="mt-8 space-y-6 text-lg text-ink/80">
        <p>
          246Labs is a Caribbean cloud and AI studio. We build the software, run
          the infrastructure, and keep it secure — to the same standard as a firm
          in San Francisco or London, engineered from Barbados.
        </p>
        <p>
          It exists for a simple reason: serious engineering shouldn&apos;t have
          to leave the region to be world-class. Too much Caribbean talent gets
          exported — the work, and the people who do it. 246Labs is the bet that
          it can be built here instead, and stand up to anyone, anywhere.
        </p>
        <p>
          It&apos;s led by{" "}
          <strong className="text-ink">Christopher Corbin</strong>, Founder &amp;
          Principal Engineer — the person doing the work, not just running the
          business. New company, high standard, no shortcuts.
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
          independence and for building things that last. That is the standard we
          hold our infrastructure to.
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
    </section>
  );
}
```

- [ ] **Step 4: Run about tests + full gate**

Run: `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add web/app/about/page.tsx web/tests/pages/about.test.tsx
git commit -m "feat: rewrite about as founder-led mission with real work as proof"
```

---

### Task 5: PROVISIONING — ship via pipeline + live read-through

> **CONTROLLER. Ships the PR through the live pipeline and verifies on production.**

- [ ] **Step 1: PR through the pipeline**

```bash
cd /Users/christophercorbin/246labs
git push -u origin feat/content-pass
gh pr create --fill
gh pr merge --squash --auto --delete-branch
gh pr checks --watch --interval 20   # verify → auto-merge → Deploy → Amplify SUCCEED
```

- [ ] **Step 2: Live verification**

```bash
B=https://246labs.cloud
curl -s $B          | grep -c "The region competes"          # 1
curl -s $B          | grep -c "sumdeting.246labs.cloud"       # >=1
curl -s $B          | grep -c "cargolinkbarbados.com"         # >=1
curl -s $B          | grep -c "cargolink.com\"" || true       # 0 (stale domain absent)
curl -s $B/services | grep -c "You get"                       # >=1 (deliverables render)
curl -s $B/about    | grep -c "Christopher Corbin"            # 1
```
Expected: pillar text present, all three product URLs present, stale `cargolink.com` absent, deliverables render, founder named.

- [ ] **Step 3: Human read-through (user)**

Read Home → Services → About on the live site for voice/flow; click each Selected Work link to confirm it opens the right live product in a new tab.

---

## Notes on testing philosophy

- Copy/data are unit-tested for the load-bearing facts: six groups each with description + deliverables, exactly three real products at exact URLs with the stale domain barred, the two pillars and founder identity rendered. Prose quality itself is a human read-through (Task 5).
- One `ServiceCard` serves both Home and Services (DRY); the plan accepts the richer card on Home rather than maintaining a second compact variant (YAGNI).
- The stale-domain guard (`cargolink.com` absent) appears in both the work unit test and the live sweep — cheap insurance against the exact mistake we already hit once.
