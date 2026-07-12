# 246Labs Launch Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Task classes:** Tasks 1–7 are **AUTHORING** (code/tests in `web/`, verified by the test suite + `npm run build`; safe for subagents). Task 8 is **PROVISIONING/VERIFY** (ships the PR through the live pipeline, sets the www→apex redirect on Amplify, live-verifies) — controller-run.

**Goal:** Ship the launch-polish batch on https://246labs.cloud — brand favicon/touch icons, OG social card, sitemap/robots/JSON-LD, the signature hero boot animation, plus the audit fixes (privacy page, security headers, www→apex 301 + canonicals, homepage H1, "Built on AWS" badge, custom 404, contact polish, sr-only wordmark "b").

**Architecture:** All icons and the OG card are code-generated with Next's `ImageResponse` (satori) using vendored brand assets (gold PNGs + OFL font TTFs committed to the repo) — no design-tool exports. The boot animation is CSS-only keyframes layered onto `Logo` via an opt-in `animated` prop, reduced-motion-safe (base styles = final visible state, keyframes animate `from` hidden with `backwards` fill). Everything ships as one PR through the existing pipeline; the www redirect is an Amplify custom rule set post-merge.

**Tech Stack:** Next.js 16 App Router (`ImageResponse` from `next/og`, `MetadataRoute` for sitemap/robots), Tailwind v3 brand tokens, Vitest/RTL, AWS Amplify custom rules.

## Global Constraints

- All app code in `web/`; work from repo root `/Users/christophercorbin/246labs` on a feature branch off `main`.
- Brand tokens only in components (no raw hex in TSX/class names); hex values ARE allowed inside `ImageResponse` JSX `style` objects and `app/globals.css` (satori/CSS can't read Tailwind config). Palette: navy `#001042`, panel-blue `#0A2E7A`, gold `#FFC726`, faint `#9199A8`, traffic `#FF5F56`/`#FFBD2E`/`#27C93F`, white `#FFFFFF`.
- Canonical host: `https://246labs.cloud` (www 301s to apex; every page sets `alternates.canonical`).
- Badge copy: **"Built on AWS"** (NOT "AWS Partner" — not APN-enrolled).
- Contact reply promise copy: "We reply within 1 business day."
- Boot animation: plays ONCE (~4.5s), cursor blinks infinitely afterward; reduced-motion leaves the full lockup visible and static. Existing global `prefers-reduced-motion` block in `globals.css` must remain.
- satori/`ImageResponse` rules: every `<div>` with multiple children needs explicit `display: "flex"`; no CSS masks/`currentColor` — embed gold PNGs as base64 data URIs; text needs a loaded font (vendored TTFs).
- Analytics, case studies, full CSP: OUT of scope (deferred).
- After edits, full gate = `cd web && npm test && npm run lint && npx tsc --noEmit && npm run build`.
- Lockfile edits (if any dep changes — none expected) must stay npm-10 compatible.

## File Structure

```
web/
  app/
    icon.tsx                    # 32px favicon (ImageResponse)
    apple-icon.tsx              # 180px touch icon (ImageResponse)
    opengraph-image.tsx         # 1200×630 OG card (ImageResponse)
    sitemap.ts  robots.ts       # SEO plumbing
    not-found.tsx               # branded 404
    privacy/page.tsx            # privacy policy
    layout.tsx                  # +openGraph/twitter meta, +JSON-LD
    page.tsx                    # +sr-only H1, +canonical
    services|about|contact/page.tsx  # +canonicals, badge swap, contact copy
    globals.css                 # boot keyframes; tagline reduced-motion fix
  assets/fonts/                 # vendored OFL TTFs (SpaceGrotesk-Bold, IBMPlexMono-Medium)
  public/brand/                 # +trident-gold.png, +map-gold.png
  components/Logo.tsx           # animated prop, sr-only "b"
  components/BootAnimation.tsx  # animated Logo + tagline chain
  components/Footer.tsx         # +privacy link
  next.config.ts                # security headers
  (deleted: app/favicon.ico, public/{file,globe,next,vercel,window}.svg)
```

---

### Task 1: Brand icons + scaffold cleanup

**Files:**
- Create: `web/app/icon.tsx`, `web/app/apple-icon.tsx`, `web/public/brand/trident-gold.png` (copied)
- Delete: `web/app/favicon.ico`, `web/public/file.svg`, `web/public/globe.svg`, `web/public/next.svg`, `web/public/vercel.svg`, `web/public/window.svg`

**Interfaces:**
- Produces: `/icon` and `/apple-icon` routes (Next file convention auto-links them). Task 3's JSON-LD references `https://246labs.cloud/apple-icon` as the logo URL.

- [ ] **Step 1: Copy the gold trident + delete scaffold files**

```bash
cd /Users/christophercorbin/246labs
cp design_handoff_246labs_brand/assets/trident-gold.png web/public/brand/trident-gold.png
git rm web/app/favicon.ico web/public/file.svg web/public/globe.svg web/public/next.svg web/public/vercel.svg web/public/window.svg
```

- [ ] **Step 2: Create `web/app/icon.tsx`** (32px; dots omitted — ≤2px is unreadable, per handoff small-size guidance)

```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const trident = await readFile(
    path.join(process.cwd(), "public/brand/trident-gold.png"),
  );
  const src = `data:image/png;base64,${trident.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#001042",
          borderRadius: 7,
        }}
      >
        <div style={{ height: 8, background: "#0A2E7A" }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {/* trident PNG is 563×600 → width ≈ height × 0.94 */}
          <img src={src} width={12} height={13} />
          <div style={{ width: 2, height: 13, background: "#FFC726" }} />
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 3: Create `web/app/apple-icon.tsx`** (180px; full mark with dots; handoff ratios on 45px titlebar: trident 70, cursor 10×70, gap 11, radius 41)

```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const trident = await readFile(
    path.join(process.cwd(), "public/brand/trident-gold.png"),
  );
  const src = `data:image/png;base64,${trident.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#001042",
          borderRadius: 41,
        }}
      >
        <div
          style={{
            height: 45,
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 16,
            background: "#0A2E7A",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#FF5F56" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#FFBD2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#27C93F" }} />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 11,
          }}
        >
          <img src={src} width={66} height={70} />
          <div style={{ width: 10, height: 70, background: "#FFC726" }} />
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 4: Verify build renders the icon routes**

Run: `cd web && npm run build`
Expected: build succeeds; route list includes `/icon` and `/apple-icon`.

- [ ] **Step 5: Commit**

```bash
git add web/app/icon.tsx web/app/apple-icon.tsx web/public/brand/trident-gold.png
git commit -m "feat: brand favicon + apple touch icon via ImageResponse; drop scaffold assets"
```

---

### Task 2: OG social card + openGraph/twitter metadata + canonicals

**Files:**
- Create: `web/app/opengraph-image.tsx`, `web/public/brand/map-gold.png` (copied), `web/assets/fonts/SpaceGrotesk-Bold.ttf`, `web/assets/fonts/IBMPlexMono-Medium.ttf` (vendored, OFL)
- Modify: `web/app/layout.tsx` (metadata), `web/app/page.tsx`, `web/app/services/page.tsx`, `web/app/about/page.tsx`, `web/app/contact/page.tsx` (add `alternates.canonical`)
- Test: `web/tests/pages/metadata.test.ts`

**Interfaces:**
- Consumes: existing `metadata` exports (root has `metadataBase: new URL("https://246labs.cloud")`).
- Produces: `/opengraph-image` route; every page exports `metadata.alternates.canonical`.

- [ ] **Step 1: Copy the gold island map + vendor the fonts (both SIL OFL licensed)**

```bash
cd /Users/christophercorbin/246labs
cp design_handoff_246labs_brand/assets/map-gold.png web/public/brand/map-gold.png
mkdir -p web/assets/fonts
curl -fsSL -o web/assets/fonts/SpaceGrotesk-Bold.ttf \
  "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
curl -fsSL -o web/assets/fonts/IBMPlexMono-Medium.ttf \
  "https://github.com/google/fonts/raw/main/ofl/ibmplexmono/IBMPlexMono-Medium.ttf"
ls -la web/assets/fonts/
```
Expected: two TTFs present (Space Grotesk is a variable font — satori reads its bold axis when weight 700 is requested; if satori errors on the variable font at build, fall back to the static bold from `https://github.com/googlefonts/spacegrotesk/raw/main/fonts/ttf/SpaceGrotesk-Bold.ttf` and note it in the report).

- [ ] **Step 2: Write the failing metadata test** `web/tests/pages/metadata.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { metadata as home } from "@/app/page";
import { metadata as services } from "@/app/services/page";
import { metadata as about } from "@/app/about/page";
import { metadata as contact } from "@/app/contact/page";
import { metadata as root } from "@/app/layout";

describe("page metadata", () => {
  it("every page declares its canonical path", () => {
    expect(home.alternates?.canonical).toBe("/");
    expect(services.alternates?.canonical).toBe("/services");
    expect(about.alternates?.canonical).toBe("/about");
    expect(contact.alternates?.canonical).toBe("/contact");
  });

  it("root declares openGraph and twitter card", () => {
    expect(root.openGraph?.siteName).toBe("246Labs");
    expect(root.twitter?.card).toBe("summary_large_image");
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `cd web && npx vitest run tests/pages/metadata.test.ts`
Expected: FAIL — `app/page.tsx` has no `metadata` export (home currently exports none) and root lacks `openGraph`.

- [ ] **Step 4: Update `web/app/layout.tsx` metadata export** (replace the existing `export const metadata` object; keep title/description/metadataBase values identical)

```tsx
export const metadata: Metadata = {
  title: "246Labs — Cloud infrastructure, built in the Caribbean.",
  description:
    "246Labs is a Caribbean cloud-engineering studio: AI, web & app development, AWS, DevOps, hosting, and security audits.",
  metadataBase: new URL("https://246labs.cloud"),
  openGraph: {
    siteName: "246Labs",
    type: "website",
    locale: "en_US",
    url: "https://246labs.cloud",
  },
  twitter: {
    card: "summary_large_image",
  },
};
```

- [ ] **Step 5: Add canonicals to the four pages**

`web/app/page.tsx` — home currently has NO metadata export; add one (imports type from "next"):
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
```
In `web/app/services/page.tsx`, `web/app/about/page.tsx`: add `alternates: { canonical: "/services" }` / `"/about"` into the existing `metadata` object. `web/app/contact/page.tsx` gets its canonical in Task 5 (bundled with its copy change) — for THIS task add only `alternates: { canonical: "/contact" }` so the test passes:
```tsx
export const metadata = {
  title: "Contact — 246Labs",
  description: "Start a project with 246Labs.",
  alternates: { canonical: "/contact" },
};
```

- [ ] **Step 6: Create `web/app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "246Labs — Cloud infrastructure, built in the Caribbean.";

async function asset(rel: string) {
  return readFile(path.join(process.cwd(), rel));
}

export default async function OgImage() {
  const [trident, island, grotesk, mono] = await Promise.all([
    asset("public/brand/trident-gold.png"),
    asset("public/brand/map-gold.png"),
    asset("assets/fonts/SpaceGrotesk-Bold.ttf"),
    asset("assets/fonts/IBMPlexMono-Medium.ttf"),
  ]);
  const tridentSrc = `data:image/png;base64,${trident.toString("base64")}`;
  const islandSrc = `data:image/png;base64,${island.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          background: "#001042",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {/* terminal tile */}
          <div
            style={{
              width: 160,
              height: 160,
              display: "flex",
              flexDirection: "column",
              background: "#001042",
              border: "3px solid #0A2E7A",
              borderRadius: 37,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 40,
                display: "flex",
                alignItems: "center",
                gap: 7,
                paddingLeft: 14,
                background: "#0A2E7A",
              }}
            >
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#FF5F56" }} />
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#FFBD2E" }} />
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#27C93F" }} />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <img src={tridentSrc} width={58} height={62} />
              <div style={{ width: 9, height: 62, background: "#FFC726" }} />
            </div>
          </div>
          {/* wordmark: 246La [island] s */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: "Space Grotesk",
              fontSize: 120,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
          >
            <span>246La</span>
            <img
              src={islandSrc}
              width={84}
              height={90}
              style={{ marginLeft: 4, marginRight: 4, transform: "translateY(8px)" }}
            />
            <span style={{ color: "#FFC726" }}>s</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 30,
            letterSpacing: "0.18em",
            color: "#FFC726",
          }}
        >
          CLOUD INFRASTRUCTURE, BUILT IN THE CARIBBEAN.
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 24,
            letterSpacing: "0.1em",
            color: "#9199A8",
          }}
        >
          246labs.cloud
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: grotesk, weight: 700, style: "normal" },
        { name: "IBM Plex Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
```

- [ ] **Step 7: Run the test + full gate**

Run: `cd web && npx vitest run tests/pages/metadata.test.ts && npm run build`
Expected: test PASSES; build succeeds and the route list includes `/opengraph-image`.

- [ ] **Step 8: Commit**

```bash
git add web/app/opengraph-image.tsx web/public/brand/map-gold.png web/assets/fonts \
  web/app/layout.tsx web/app/page.tsx web/app/services/page.tsx web/app/about/page.tsx \
  web/app/contact/page.tsx web/tests/pages/metadata.test.ts
git commit -m "feat: OG social card, openGraph/twitter metadata, per-page canonicals"
```

---

### Task 3: sitemap, robots, JSON-LD

**Files:**
- Create: `web/app/sitemap.ts`, `web/app/robots.ts`
- Modify: `web/app/layout.tsx` (JSON-LD script in `<head>` via body-top placement)
- Test: `web/tests/seo/plumbing.test.ts`

**Interfaces:**
- Consumes: `/apple-icon` route (Task 1) as the JSON-LD logo URL.
- Produces: `/sitemap.xml`, `/robots.txt` routes.

- [ ] **Step 1: Write the failing test** `web/tests/seo/plumbing.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import RootLayout from "@/app/layout";

describe("sitemap", () => {
  it("lists the four routes on the canonical host", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toEqual([
      "https://246labs.cloud",
      "https://246labs.cloud/services",
      "https://246labs.cloud/about",
      "https://246labs.cloud/contact",
    ]);
  });
});

describe("robots", () => {
  it("allows all and points at the sitemap", () => {
    const r = robots();
    expect(r.sitemap).toBe("https://246labs.cloud/sitemap.xml");
    expect(r.rules).toEqual({ userAgent: "*", allow: "/" });
  });
});

describe("JSON-LD", () => {
  it("renders ProfessionalService structured data", () => {
    const { container } = render(
      <RootLayout>
        <div />
      </RootLayout>,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent || "{}");
    expect(data["@type"]).toBe("ProfessionalService");
    expect(data.name).toBe("246Labs");
    expect(data.email).toBe("hello@246labs.cloud");
  });
});
```
File must be `.tsx`: name it `web/tests/seo/plumbing.test.tsx` (JSX in the JSON-LD test). Note: rendering `RootLayout` in jsdom logs a "<html> cannot appear as child of <div>" warning — silence it by rendering with `container: document.documentElement` is NOT supported; instead assert via `document.querySelector` after `render` (RTL renders into document anyway) and accept the warning, OR restructure: extract the JSON-LD into a tiny component `components/JsonLd.tsx` and test THAT directly (preferred — no warning, no layout render):

```tsx
// The actual test file — test the extracted component:
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { JsonLd } from "@/components/JsonLd";

describe("JSON-LD", () => {
  it("renders ProfessionalService structured data", () => {
    const { container } = render(<JsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent || "{}");
    expect(data["@type"]).toBe("ProfessionalService");
    expect(data.name).toBe("246Labs");
    expect(data.email).toBe("hello@246labs.cloud");
    expect(data.sameAs).toContain("https://github.com/christophercorbin/246labs-site");
  });
});
```
Use the extracted-component version (plus the sitemap/robots describes above, which are plain TS — the file is still `.tsx`).

- [ ] **Step 2: Run to verify it fails**

Run: `cd web && npx vitest run tests/seo/plumbing.test.tsx`
Expected: FAIL — modules `@/app/sitemap`, `@/app/robots`, `@/components/JsonLd` not found.

- [ ] **Step 3: Create `web/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";

const BASE = "https://246labs.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/services", "/about", "/contact"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.8,
  }));
}
```

- [ ] **Step 4: Create `web/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://246labs.cloud/sitemap.xml",
  };
}
```

- [ ] **Step 5: Create `web/components/JsonLd.tsx` and render it in the layout**

```tsx
const schema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "246Labs",
  url: "https://246labs.cloud",
  logo: "https://246labs.cloud/apple-icon",
  description:
    "Caribbean cloud-engineering studio: AI, web & app development, AWS, DevOps, hosting, and security audits.",
  email: "hello@246labs.cloud",
  areaServed: ["Barbados", "Caribbean"],
  sameAs: ["https://github.com/christophercorbin/246labs-site"],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```
In `web/app/layout.tsx`: `import { JsonLd } from "@/components/JsonLd";` and render `<JsonLd />` as the first child inside `<body>` (Next hoists nothing here; body placement is valid for JSON-LD and Google reads it).

- [ ] **Step 6: Run the test suite**

Run: `cd web && npx vitest run tests/seo/plumbing.test.tsx && npm test`
Expected: new tests PASS; full suite passes.

- [ ] **Step 7: Commit**

```bash
git add web/app/sitemap.ts web/app/robots.ts web/components/JsonLd.tsx web/app/layout.tsx web/tests/seo/plumbing.test.tsx
git commit -m "feat: sitemap, robots, and ProfessionalService JSON-LD"
```

---

### Task 4: Hero boot animation

**Files:**
- Modify: `web/app/globals.css` (keyframes + classes; fix `.boot-tagline` reduced-motion bug), `web/components/Logo.tsx` (add `animated` prop), `web/components/BootAnimation.tsx` (pass `animated`)
- Test: `web/tests/components/BootAnimation.test.tsx` (extend), `web/tests/components/Logo.test.tsx` (extend)

**Interfaces:**
- Consumes: `Logo({ variant, showIcon, className })` (existing).
- Produces: `Logo` accepts `animated?: boolean` (default `false`); when true the trident wrapper has class `boot-trident`, cursor has `boot-cursor`, wordmark has `boot-wordmark`, tile has `boot-tile`.

- [ ] **Step 1: Extend the tests (failing first)**

Append to `web/tests/components/Logo.test.tsx`:
```tsx
  it("adds boot animation classes only when animated", () => {
    const { container, rerender } = render(<Logo animated />);
    expect(container.querySelector(".boot-trident")).not.toBeNull();
    expect(container.querySelector(".boot-cursor")).not.toBeNull();
    expect(container.querySelector(".boot-wordmark")).not.toBeNull();
    rerender(<Logo />);
    expect(container.querySelector(".boot-trident")).toBeNull();
  });
```
Append to `web/tests/components/BootAnimation.test.tsx`:
```tsx
  it("renders the animated logo variant", () => {
    const { container } = render(<BootAnimation />);
    expect(container.querySelector(".boot-wordmark")).not.toBeNull();
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `cd web && npx vitest run tests/components/Logo.test.tsx tests/components/BootAnimation.test.tsx`
Expected: FAIL — `animated` prop unknown / classes absent.

- [ ] **Step 3: Update `web/app/globals.css`** — replace the existing animation block (currently `@keyframes fade-up` + `.boot-tagline`) with:

```css
/* Boot reveal — plays once; cursor blinks forever after.
   Reduced-motion safety: base styles are the FINAL visible state; every
   keyframe animates FROM the hidden state with `backwards` fill for delayed
   starts, so `animation: none` (global reduced-motion rule) shows the
   finished lockup. Timeline: tile 0–.4s, trident .5–1.6s, blink 1.6s+,
   wordmark 1.8–3s, tagline 3–3.6s. */
@keyframes boot-tile-in {
  from {
    opacity: 0;
    transform: scale(0.86);
  }
}
@keyframes boot-type-out {
  from {
    width: 0;
  }
}
@keyframes boot-wordmark-in {
  from {
    clip-path: inset(0 100% 0 0);
  }
}
@keyframes boot-blink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
.boot-tile {
  animation: boot-tile-in 0.4s ease-in-out backwards;
}
.boot-trident {
  overflow: hidden;
  animation: boot-type-out 1.1s ease-in-out 0.5s backwards;
}
.boot-cursor {
  animation: boot-blink 1.05s step-end 1.6s infinite;
}
.boot-wordmark {
  animation: boot-wordmark-in 1.2s ease-in-out 1.8s backwards;
}
.boot-tagline {
  animation: fade-up 0.6s ease-in-out 3s backwards;
}
```
(Note: `.boot-tagline` loses its `opacity: 0` base — that base style made the tagline invisible for reduced-motion users; `backwards` fill now supplies the hidden start state instead.)

- [ ] **Step 4: Update `web/components/Logo.tsx`**

```tsx
type LogoProps = {
  variant?: "dark" | "light";
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
};

export function Logo({
  variant = "dark",
  showIcon = true,
  animated = false,
  className = "",
}: LogoProps) {
  const accent = variant === "dark" ? "text-gold" : "text-flag-blue";
  const wordColor = variant === "dark" ? "text-white" : "text-flag-blue";

  return (
    <span
      role="img"
      aria-label="246Labs"
      className={`inline-flex items-center gap-3 ${className}`}
    >
      {showIcon && (
        <span
          aria-hidden
          className={`relative inline-flex h-[52px] w-[52px] flex-col overflow-hidden rounded-tile-sm bg-navy ${animated ? "boot-tile" : ""}`}
        >
          <span className="flex h-[13px] items-center gap-[3px] bg-panel-blue px-[5px]">
            <span className="h-[4px] w-[4px] rounded-full bg-traffic-red" />
            <span className="h-[4px] w-[4px] rounded-full bg-traffic-amber" />
            <span className="h-[4px] w-[4px] rounded-full bg-traffic-green" />
          </span>
          <span className="flex flex-1 items-center justify-center gap-[3px]">
            <span className={`inline-flex w-[24px] ${animated ? "boot-trident" : ""}`}>
              <span
                className="mark-mask h-[26px] w-[24px] shrink-0 text-gold"
                style={{ WebkitMaskImage: "url(/brand/trident-white.png)", maskImage: "url(/brand/trident-white.png)" }}
              />
            </span>
            <span className={`h-[26px] w-[3px] bg-gold ${animated ? "boot-cursor" : ""}`} />
          </span>
        </span>
      )}
      <span
        className={`font-sans text-3xl font-bold leading-[0.82] tracking-wordmark ${wordColor} ${animated ? "boot-wordmark" : ""}`}
      >
        246La
        <span className="sr-only">b</span>
        <span
          className="mark-mask inline-block h-[0.8em] w-[0.7em] translate-y-[0.08em] text-current"
          aria-hidden
          style={{ WebkitMaskImage: "url(/brand/map-white.png)", maskImage: "url(/brand/map-white.png)" }}
        />
        <span className={accent}>s</span>
      </span>
    </span>
  );
}
```
(Two deliberate details: the trident gains an always-present fixed-width wrapper — identical layout when static, `overflow:hidden` width-reveal when animated, with `shrink-0` on the inner mask so it doesn't compress; and the `sr-only` "b" lands here — the audit's text-extraction fix, Task 5's spec item, implemented once in this file to avoid two tasks editing the same lines.)

- [ ] **Step 5: Update `web/components/BootAnimation.tsx`** — pass `animated`:

```tsx
import { Logo } from "@/components/Logo";

export function BootAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      <Logo variant="dark" animated className="text-4xl" />
      <p className="font-mono text-sm uppercase tracking-label text-gold boot-tagline">
        Cloud infrastructure, built in the Caribbean.
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Run tests + build**

Run: `cd web && npm test && npm run build`
Expected: all pass (including the extended Logo/BootAnimation tests and the wordmark text test — `getByText("246La")` still matches since the sr-only "b" is a separate span).

- [ ] **Step 7: Commit**

```bash
git add web/app/globals.css web/components/Logo.tsx web/components/BootAnimation.tsx \
  web/tests/components/Logo.test.tsx web/tests/components/BootAnimation.test.tsx
git commit -m "feat: signature boot animation (type-out trident, wordmark reveal, resting blink)"
```

---

### Task 5: Content & a11y fixes (H1, badge, 404, contact polish)

**Files:**
- Modify: `web/app/page.tsx` (sr-only H1), `web/app/about/page.tsx` (badge), `web/app/contact/page.tsx` (copy + meta)
- Create: `web/app/not-found.tsx`
- Test: `web/tests/pages/home.test.tsx` (extend), `web/tests/pages/about.test.tsx` (modify), `web/tests/pages/not-found.test.tsx` (new)

**Interfaces:** none new.

- [ ] **Step 1: Update tests first**

`web/tests/pages/about.test.tsx` — change the badge assertion:
```tsx
    expect(screen.getByText(/Built on AWS/i)).toBeInTheDocument();
```
(replacing `getByText(/AWS Partner/i)`).

Append to `web/tests/pages/home.test.tsx`:
```tsx
  it("has an h1 for the page", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /cloud infrastructure/i }),
    ).toBeInTheDocument();
  });
```

New `web/tests/pages/not-found.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotFound from "@/app/not-found";

describe("404 page", () => {
  it("shows a branded 404 with a link home", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });
});
```

- [ ] **Step 2: Run to verify failures**

Run: `cd web && npx vitest run tests/pages/`
Expected: about FAILS (badge text), home FAILS (no h1), not-found FAILS (module missing). metadata test still passes.

- [ ] **Step 3: Home sr-only H1** — in `web/app/page.tsx`, add as the first child inside the hero section's inner div (before `<BootAnimation />`):

```tsx
          <h1 className="sr-only">
            Cloud infrastructure, built in the Caribbean.
          </h1>
```

- [ ] **Step 4: About badge swap** — in `web/app/about/page.tsx` change the badge span text `AWS Partner` → `Built on AWS` (class names unchanged).

- [ ] **Step 5: Contact polish** — in `web/app/contact/page.tsx`:

Replace the `metadata` export:
```tsx
export const metadata = {
  title: "Contact — 246Labs",
  description:
    "Start a project with 246Labs — cloud, AI, and DevOps engineering from Barbados. We reply within 1 business day.",
  alternates: { canonical: "/contact" },
};
```
After the existing intro `<p>` (the one with the mailto link), add:
```tsx
      <p className="mt-2 font-mono text-xs uppercase tracking-label text-muted">
        Based in Barbados · Working across the Caribbean and beyond · We reply
        within 1 business day
      </p>
```

- [ ] **Step 6: Create `web/app/not-found.tsx`**

```tsx
import Link from "next/link";
import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <section className="bg-navy">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-28">
        <p className="font-mono text-6xl font-bold text-gold">404</p>
        <h1 className="font-sans text-3xl font-bold tracking-wordmark text-white">
          This page doesn&apos;t exist.
        </h1>
        <p className="max-w-xl text-white/80">
          The address may have changed, or the page was never here. Either way —
          nothing to debug on your end.
        </p>
        <Button href="/" variant="primary">
          Back to home
        </Button>
      </div>
    </section>
  );
}
```
(`Link` import is unnecessary — `Button` handles `href`; omit the `import Link` line.)

- [ ] **Step 7: Run all page tests + full gate**

Run: `cd web && npm test && npm run lint && npx tsc --noEmit`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add web/app/page.tsx web/app/about/page.tsx web/app/contact/page.tsx web/app/not-found.tsx web/tests/pages/
git commit -m "fix: sr-only H1, Built-on-AWS badge, branded 404, contact polish"
```

---

### Task 6: Privacy policy page + footer link

**Files:**
- Create: `web/app/privacy/page.tsx`
- Modify: `web/components/Footer.tsx`
- Test: `web/tests/pages/privacy.test.tsx`

**Interfaces:** route `/privacy`; footer link to it.

- [ ] **Step 1: Write the failing test** `web/tests/pages/privacy.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Privacy from "@/app/privacy/page";
import { Footer } from "@/components/Footer";

describe("privacy page", () => {
  it("names what the contact form collects and how to reach us", () => {
    render(<Privacy />);
    expect(screen.getByRole("heading", { level: 1, name: /privacy/i })).toBeInTheDocument();
    expect(screen.getByText(/name, email address, company/i)).toBeInTheDocument();
    expect(screen.getByText(/no analytics or advertising cookies/i)).toBeInTheDocument();
  });
});

describe("footer", () => {
  it("links to the privacy policy", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/privacy");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd web && npx vitest run tests/pages/privacy.test.tsx`
Expected: FAIL — `@/app/privacy/page` missing; footer has no privacy link.

- [ ] **Step 3: Create `web/app/privacy/page.tsx`**

```tsx
export const metadata = {
  title: "Privacy — 246Labs",
  description: "What 246Labs collects, why, and how to reach us about it.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-label text-muted">
        Legal
      </p>
      <h1 className="mt-2 font-sans text-4xl font-bold tracking-wordmark text-flag-blue">
        Privacy policy
      </h1>
      <div className="mt-8 space-y-6 text-ink/80">
        <p>
          246Labs collects only what you give us. If you use the contact form,
          that means your name, email address, company (optional), and your
          message. We use it for one thing: replying to you.
        </p>
        <p>
          Form submissions are delivered by Amazon SES (AWS, US East region) to
          our Google Workspace inbox. We don&apos;t sell, share, or enrich your
          data, and we don&apos;t add you to a mailing list.
        </p>
        <p>
          This site sets no analytics or advertising cookies. Our hosting
          provider (AWS Amplify/CloudFront) keeps standard server logs — IP
          address, user agent, request time — for security and operations.
        </p>
        <p>
          Want your messages deleted? Email{" "}
          <a className="text-flag-blue underline" href="mailto:hello@246labs.cloud">
            hello@246labs.cloud
          </a>{" "}
          and we&apos;ll remove them.
        </p>
        <p className="font-mono text-xs uppercase tracking-label text-muted">
          Last updated: July 2026 · 246Labs, Barbados
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add the footer link** — in `web/components/Footer.tsx`, change the contact line div to include the link (imports `Link` from `next/link`):

```tsx
        <div className="flex items-center gap-4 font-mono text-xs text-faint">
          <span>246labs.cloud · hello@246labs.cloud</span>
          <Link href="/privacy" className="underline hover:text-gold">
            Privacy
          </Link>
        </div>
```

- [ ] **Step 5: Add `/privacy` to the sitemap** — in `web/app/sitemap.ts` change the array to `["", "/services", "/about", "/contact", "/privacy"]` and update the sitemap test's expected list in `web/tests/seo/plumbing.test.tsx` to include `"https://246labs.cloud/privacy"`.

- [ ] **Step 6: Run tests**

Run: `cd web && npm test`
Expected: all pass (privacy, footer, updated sitemap).

- [ ] **Step 7: Commit**

```bash
git add web/app/privacy web/components/Footer.tsx web/app/sitemap.ts web/tests/pages/privacy.test.tsx web/tests/seo/plumbing.test.tsx
git commit -m "feat: privacy policy page, footer link, sitemap entry"
```

---

### Task 7: Security headers

**Files:**
- Modify: `web/next.config.ts`

**Interfaces:** none (HTTP response headers).

- [ ] **Step 1: Add `headers()` to `web/next.config.ts`** (merge into the existing config object — do not remove existing options):

```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify locally**

Run: `cd web && npm run build && (npm run start &) && sleep 3 && curl -sI http://localhost:3000 | grep -iE "strict-transport|x-content|x-frame|referrer|permissions" ; kill %1`
Expected: all five headers present in the response. (If `npm run start` port conflicts, use `PORT=3999`.)

- [ ] **Step 3: Commit**

```bash
git add web/next.config.ts
git commit -m "feat: security headers (HSTS, nosniff, frame-deny, referrer, permissions)"
```

---

### Task 8: PROVISIONING — ship via pipeline, www redirect, live verification

> **CONTROLLER. Ships the PR, mutates Amplify (custom rules), verifies live.**

- [ ] **Step 1: PR through the pipeline**

Branch name: `feat/launch-polish` (all Tasks 1–7 commit onto it).
```bash
cd /Users/christophercorbin/246labs
git push -u origin feat/launch-polish
gh pr create --fill
gh pr merge --squash --auto --delete-branch
gh pr checks --watch --interval 20   # verify green → auto-merge → Deploy workflow → Amplify SUCCEED
```

- [ ] **Step 2: www → apex 301 (Amplify custom rule)**

```bash
aws amplify update-app --app-id d6h6ewkweev1n \
  --custom-rules '[{"source":"https://www.246labs.cloud","target":"https://246labs.cloud","status":"301"}]' \
  --profile personal-246labs --region us-east-1 \
  --query 'app.customRules'
```
Expected: the rule echoed back. (Amplify prepends custom rules; WEB_COMPUTE SSR routing continues to handle everything else.)

- [ ] **Step 3: Live verification sweep**

```bash
B=https://246labs.cloud
curl -s -o /dev/null -w "icon %{http_code}\n"        $B/icon
curl -s -o /dev/null -w "apple-icon %{http_code}\n"  $B/apple-icon
curl -s -o /dev/null -w "og %{http_code}\n"          $B/opengraph-image
curl -s -o /dev/null -w "sitemap %{http_code}\n"     $B/sitemap.xml
curl -s -o /dev/null -w "robots %{http_code}\n"      $B/robots.txt
curl -s -o /dev/null -w "privacy %{http_code}\n"     $B/privacy
curl -s -o /dev/null -w "404 page %{http_code}\n"    $B/definitely-not-a-page
curl -sI $B | grep -icE "strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy"
curl -s -o /dev/null -w "www redirect %{http_code} -> %{redirect_url}\n" https://www.246labs.cloud
curl -s $B | grep -c 'og:image'
```
Expected: 200s for the routes (404 page returns 404 status with branded body), `5` security headers, `301 -> https://246labs.cloud/`, `og:image` present.
If the security headers are missing on the live site (Amplify hosting edge cases with `next.config` headers), fall back to an Amplify `customHttp.yml` at repo root declaring the same five headers and re-release — note it in the ledger.

- [ ] **Step 4: Human checks (user)**

- Hard-refresh the site: watch the boot animation (tile → trident types out → cursor blinks → wordmark → tagline).
- Check the favicon in the browser tab (may need a cache-bust/new tab).
- Paste `https://246labs.cloud` into a WhatsApp/Slack/LinkedIn draft — confirm the branded card renders.
- Submit the sitemap in Google Search Console (`https://246labs.cloud/sitemap.xml`).

---

## Notes on testing philosophy

- Metadata/sitemap/robots/JSON-LD are pure functions/data — unit-tested directly.
- `ImageResponse` routes have no meaningful unit test (satori rendering); the build gate compiles them and the live sweep confirms 200s. A broken asset path fails the build loudly.
- Animation is CSS; tests assert the class contract (`animated` prop wiring), and fidelity is a human visual check on the deployed site. The reduced-motion invariant is enforced by construction (base = final state), documented in the CSS comment.
- Task 4 deliberately owns the `sr-only` "b" (spec Task-5 item) because both edits touch the same `Logo.tsx` lines — noted in both tasks to avoid double-implementation.
