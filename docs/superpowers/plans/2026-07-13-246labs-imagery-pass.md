# Site Imagery Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real product screenshots to the Selected Work cards (with a graceful gradient fallback) and brand-tinted icons to the Services grid, to make the site livelier and more credible to customers.

**Architecture:** Two independent site-only changes in the Next.js app (`web/`). (1) `ServiceCard` renders a `lucide-react` icon chosen by a local `key → icon` map, keeping `lib/services.ts` a pure data module. (2) `Work` gains an optional `image?` field; `WorkCard` renders a `next/image` (`fill` + `object-cover`) in the existing 16:9 thumbnail box when `image` is set, otherwise the current gradient placeholder — so the code is correct and shippable before any screenshot file exists.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v3.4, `lucide-react` (new dep), Vitest + React Testing Library.

## Global Constraints

- All app code lives in `web/`. Run every command from `web/`.
- **Lockfile must stay npm-10-compatible.** Install new deps with `npx npm@10 install <pkg>` (NOT a newer npm), or CI's `npm ci` breaks on missing `@emnapi` entries.
- New dependency limit: `lucide-react` is the ONLY new dependency permitted by this plan. Add nothing else.
- Do not change copy, the brand palette (`navy`, `flag-blue`, `gold`, `ink`, `muted`, `hairline`), layout structure, or CI/CD.
- Product screenshots are local files under `web/public/work/`. `Work.image` is populated ONLY for a product whose file is committed — a missing image must fall back to the gradient, never a broken `<img>`.
- Tests live under `web/tests/`. Test command: `npm test` (`vitest run`). Build gate: `npm run build`.
- Icon tint uses the existing `text-gold` Tailwind class; icons are `aria-hidden` (the title is the accessible label).

---

### Task 1: Service icons on the Services grid

**Files:**
- Modify: `web/package.json` + `web/package-lock.json` (add `lucide-react`)
- Modify: `web/components/ServiceCard.tsx`
- Test: `web/tests/components/ServiceCard.test.tsx` (create)

**Interfaces:**
- Consumes: `ServiceGroup` from `@/lib/services` (`{ key, title, blurb, description, deliverables, items }`) — unchanged.
- Produces: nothing consumed by later tasks (self-contained).

- [ ] **Step 1: Add the lucide-react dependency (npm 10)**

Run from `web/`:
```bash
npx npm@10 install lucide-react
```
Expected: `lucide-react` appears under `dependencies` in `package.json` and in `package-lock.json`. Confirm npm 10 was used:
```bash
npx npm@10 --version   # prints 10.x
```

- [ ] **Step 2: Write the failing test**

Create `web/tests/components/ServiceCard.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ServiceCard } from "@/components/ServiceCard";
import { SERVICE_GROUPS } from "@/lib/services";

const ai = SERVICE_GROUPS.find((g) => g.key === "ai")!;

describe("ServiceCard", () => {
  it("renders an icon plus the title, items, and deliverables", () => {
    const { container } = render(<ServiceCard group={ai} />);
    // Icon present (lucide renders an <svg>), and hidden from a11y tree.
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    // Existing content still renders.
    expect(screen.getByRole("heading", { name: ai.title })).toBeInTheDocument();
    expect(screen.getByText(ai.items[0])).toBeInTheDocument();
    expect(screen.getByText(ai.deliverables[0])).toBeInTheDocument();
  });

  it("maps every service group key to an icon", () => {
    for (const g of SERVICE_GROUPS) {
      const { container } = render(<ServiceCard group={g} />);
      expect(container.querySelector("svg")).not.toBeNull();
    }
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- ServiceCard`
Expected: FAIL — no `<svg>` rendered yet (`expect(svg).not.toBeNull()` fails).

- [ ] **Step 4: Implement the icon map + render**

Replace the contents of `web/components/ServiceCard.tsx` with:
```tsx
import type { ComponentType, SVGProps } from "react";
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
    <div className="card card-accent border border-hairline bg-white p-6">
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
    </div>
  );
}
```
Note: lucide icons accept `aria-hidden` and render `aria-hidden="true"` on the `<svg>`. Keep the JSX attribute as `aria-hidden` (matches the existing `→` span convention in this file).

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- ServiceCard`
Expected: PASS (both cases).

- [ ] **Step 6: Run the full suite + build**

Run: `npm test`
Expected: all tests pass (existing `services.test.ts`, `pages/services.test.tsx`, etc. unaffected).
Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add web/package.json web/package-lock.json web/components/ServiceCard.tsx web/tests/components/ServiceCard.test.tsx
git commit -m "feat: add service icons to the Services grid (lucide-react)"
```

---

### Task 2: Optional product screenshots in WorkCard

**Files:**
- Modify: `web/lib/work.ts` (add optional `image?` to `Work` type)
- Modify: `web/components/WorkCard.tsx`
- Test: `web/tests/components/WorkCard.test.tsx` (extend existing)

**Interfaces:**
- Consumes: `Work` from `@/lib/work` (`{ name, blurb, href }`).
- Produces: extended `Work` type `{ name: string; blurb: string; href: string; image?: string }`.

- [ ] **Step 1: Add the optional `image` field to the `Work` type**

In `web/lib/work.ts`, change the type only (leave `SELECTED_WORK` entries as-is — no `image` values yet, files not committed):
```ts
export type Work = {
  name: string;
  blurb: string;
  href: string;
  image?: string; // e.g. "/work/sumdeting.webp"; omit until the file is committed
};
```

- [ ] **Step 2: Write the failing tests**

Replace `web/tests/components/WorkCard.test.tsx` with:
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
    expect(container.querySelector("[data-work-thumb]")).not.toBeNull();
  });

  it("shows the gradient placeholder (no <img>) when no image is set", () => {
    const { container } = render(<WorkCard work={work} />);
    const thumb = container.querySelector("[data-work-thumb]")!;
    expect(thumb.querySelector("img")).toBeNull();
    // Product name shown as the placeholder label inside the thumb.
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
    // Fill layout requires a positioned container.
    expect(thumb.className).toContain("relative");
  });
});
```

- [ ] **Step 3: Run the tests to verify the new ones fail**

Run: `npm test -- WorkCard`
Expected: the first two cases PASS, the third FAILs (no `<img>` rendered; `relative` not on the thumb).

- [ ] **Step 4: Implement conditional image rendering**

Replace the contents of `web/components/WorkCard.tsx` with:
```tsx
import Image from "next/image";
import type { Work } from "@/lib/work";

export function WorkCard({ work }: { work: Work }) {
  return (
    <a
      href={work.href}
      target="_blank"
      rel="noopener noreferrer"
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
          Visit ↗
        </span>
      </div>
    </a>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- WorkCard`
Expected: all three cases PASS.

- [ ] **Step 6: Run the full suite + build**

Run: `npm test`
Expected: all tests pass.
Run: `npm run build`
Expected: build succeeds (no image files required — none are referenced yet).

- [ ] **Step 7: Commit**

```bash
git add web/lib/work.ts web/components/WorkCard.tsx web/tests/components/WorkCard.test.tsx
git commit -m "feat: WorkCard renders product screenshots with gradient fallback"
```

---

## Post-plan: wiring the screenshots (data-only, done when files arrive)

Not a coded task — a one-line-per-product data edit performed once the user commits the image files:

1. User commits `web/public/work/sumdeting.webp`, `bimweather.webp`, `cargolink.webp` (~1200×750, WebP preferred, <300 KB each).
2. Add the matching `image` value to each entry in `web/lib/work.ts`, e.g. `image: "/work/sumdeting.webp"`.
3. `npm run build` locally to confirm the images resolve; commit; ship via the pipeline.

Products without a committed file keep the gradient — the pass can go out partially and fill in as screenshots are gathered.
