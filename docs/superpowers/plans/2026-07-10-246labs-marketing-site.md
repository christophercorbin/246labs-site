# 246Labs Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and prepare-for-deploy the 246Labs multi-page marketing site (Home, Services, About, Contact) implementing the delivered brand system, with an AWS SES contact form, hosted on AWS Amplify.

**Architecture:** Next.js (App Router, TypeScript) + Tailwind CSS at repo path `web/`. Pages are static; one server route (`/api/contact`) sends mail via Amazon SES and runs as Amplify-managed Lambda. Brand tokens live in `tailwind.config.ts`; the trident/island marks are recolored from single transparent PNGs via CSS masks (`currentColor`). Amplify builds the `web/` app on git push.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3.4, `next/font` (Space Grotesk + IBM Plex Mono), `@aws-sdk/client-ses`, Vitest + React Testing Library + jsdom, AWS Amplify Hosting.

## Global Constraints

- Node 22.x, npm 11.x. All app code lives under `web/`.
- Tailwind CSS pinned to `^3.4.0` (config-file token mapping, not v4 CSS-first).
- Brand color tokens (exact hex, mapped in `tailwind.config.ts`):
  `navy #001042`, `flag-blue #00267F`, `panel-blue #0A2E7A`, `gold #FFC726`,
  `ink #14161A`, `muted #5A6273`, `faint #9199A8`, `hairline #E3E5EA`,
  `paper #F6F7FB`, `page-bg #E7E8EC`, `traffic-red #FF5F56`,
  `traffic-amber #FFBD2E`, `traffic-green #27C93F`.
- Fonts: Space Grotesk (display/UI/wordmark, 400–700) and IBM Plex Mono
  (labels/metadata/taglines, 400–500), via `next/font/google` CSS variables
  `--font-space-grotesk` and `--font-plex-mono`.
- Domain: `246labs.cloud`. Contact placeholder inbox: `hello@246labs.cloud`.
- Tagline: `Cloud infrastructure, built in the Caribbean.`
  Descriptor: `CONSULTING · DEVOPS · WEB APPS · HOSTING`.
- Voice: confident and technical, never corporate. No fabricated client names.
- No secrets in the repo. SES region/sender/recipient come from env vars.
- Wordmark rule: `246La` + island glyph + `s`; final `s` uses accent (gold on
  dark, flag-blue on light). Space Grotesk 700, letter-spacing -0.03em.
- Honor `prefers-reduced-motion` on all animation.

---

### Task 1: Scaffold Next.js app with brand tokens and fonts

**Files:**
- Create: `web/` (via create-next-app), `web/tailwind.config.ts`,
  `web/postcss.config.js`, `web/app/globals.css`, `web/app/layout.tsx`
- Modify: repo `.gitignore` (already ignores `node_modules/`, `.next/`, `.env*`)

**Interfaces:**
- Produces: Tailwind color tokens (names above) and `font-sans`/`font-mono`
  utilities; `RootLayout` wrapping all pages with font variables on `<html>`.

- [ ] **Step 1: Scaffold the app (non-interactive, no Tailwind v4)**

Run from repo root (`/Users/christophercorbin/246labs`):
```bash
npx create-next-app@latest web \
  --typescript --app --no-src-dir --no-tailwind --eslint \
  --import-alias "@/*" --use-npm --no-turbopack
```
Expected: `web/` created with `package.json`, `app/`, `next.config.*`, `tsconfig.json`.

- [ ] **Step 2: Install Tailwind 3.4 + PostCSS**

```bash
cd web && npm install -D tailwindcss@^3.4.0 postcss autoprefixer && npx tailwindcss init -p
```
Expected: `tailwind.config.js` (or `.ts`) and `postcss.config.js` created.

- [ ] **Step 3: Replace `web/tailwind.config.ts` with brand tokens**

Delete any generated `tailwind.config.js` and create `web/tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#001042",
        "flag-blue": "#00267F",
        "panel-blue": "#0A2E7A",
        gold: "#FFC726",
        ink: "#14161A",
        muted: "#5A6273",
        faint: "#9199A8",
        hairline: "#E3E5EA",
        paper: "#F6F7FB",
        "page-bg": "#E7E8EC",
        "traffic-red": "#FF5F56",
        "traffic-amber": "#FFBD2E",
        "traffic-green": "#27C93F",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        tile: "24px",
        "tile-sm": "17px",
      },
      letterSpacing: {
        wordmark: "-0.03em",
        label: "0.18em",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Replace `web/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}
body {
  background: theme("colors.paper");
  color: theme("colors.ink");
}
/* Recolorable mark: single transparent PNG used as an alpha mask,
   filled with currentColor so gold/white/navy come from CSS. */
.mark-mask {
  background-color: currentColor;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 5: Replace `web/app/layout.tsx` with fonts + metadata**

```tsx
import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "246Labs — Cloud infrastructure, built in the Caribbean.",
  description:
    "246Labs is a Caribbean cloud-engineering studio: AI, web & app development, AWS, DevOps, hosting, and security audits.",
  metadataBase: new URL("https://246labs.cloud"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `cd web && npm run build`
Expected: build completes with no errors; routes compiled.

- [ ] **Step 7: Commit**

```bash
git add web .gitignore
git commit -m "feat: scaffold Next.js app with 246Labs brand tokens and fonts"
```

---

### Task 2: Test infrastructure (Vitest + RTL)

**Files:**
- Create: `web/vitest.config.ts`, `web/vitest.setup.ts`, `web/tests/smoke.test.tsx`
- Modify: `web/package.json` (add `test` script)

**Interfaces:**
- Produces: `npm test` runs Vitest with jsdom + `@/*` alias + jest-dom matchers.

- [ ] **Step 1: Install test deps**

```bash
cd web && npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/user-event @testing-library/jest-dom \
  vite-tsconfig-paths
```

- [ ] **Step 2: Create `web/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

- [ ] **Step 3: Create `web/vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add test script to `web/package.json`**

In `"scripts"`, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test `web/tests/smoke.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

function Hello() {
  return <h1>246Labs</h1>;
}

describe("test harness", () => {
  it("renders", () => {
    render(<Hello />);
    expect(screen.getByText("246Labs")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run tests**

Run: `cd web && npm test`
Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add web
git commit -m "test: add Vitest + React Testing Library harness"
```

---

### Task 3: Brand assets + Logo + Button components

**Files:**
- Create: `web/public/brand/trident-white.png`, `web/public/brand/map-white.png`
  (copied from handoff), `web/components/Logo.tsx`, `web/components/Button.tsx`,
  `web/tests/components/Logo.test.tsx`

**Interfaces:**
- Produces:
  - `Logo({ variant?: "dark" | "light"; showIcon?: boolean; className?: string })`
    — renders the terminal-tile icon (titlebar + 3 dots + gold trident + gold
    cursor) and the wordmark `246La`+island+`s`.
  - `Button({ href?: string; variant?: "primary" | "ghost"; children; className? })`.

- [ ] **Step 1: Copy the white (alpha) mark assets into public**

```bash
cd /Users/christophercorbin/246labs && mkdir -p web/public/brand && \
cp design_handoff_246labs_brand/assets/trident-white.png web/public/brand/trident-white.png && \
cp design_handoff_246labs_brand/assets/map-white.png web/public/brand/map-white.png
```
Expected: both files exist under `web/public/brand/`.

- [ ] **Step 2: Write failing test `web/tests/components/Logo.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("renders the wordmark text with the accent final s", () => {
    render(<Logo />);
    expect(screen.getByText("246La")).toBeInTheDocument();
    expect(screen.getByText("s")).toBeInTheDocument();
  });

  it("exposes an accessible brand name", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: /246labs/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd web && npx vitest run tests/components/Logo.test.tsx`
Expected: FAIL — cannot find module `@/components/Logo`.

- [ ] **Step 4: Implement `web/components/Logo.tsx`**

```tsx
type LogoProps = {
  variant?: "dark" | "light";
  showIcon?: boolean;
  className?: string;
};

export function Logo({
  variant = "dark",
  showIcon = true,
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
          className="relative inline-flex h-[52px] w-[52px] flex-col overflow-hidden rounded-tile-sm bg-navy"
        >
          <span className="flex h-[13px] items-center gap-[3px] bg-panel-blue px-[5px]">
            <span className="h-[4px] w-[4px] rounded-full bg-traffic-red" />
            <span className="h-[4px] w-[4px] rounded-full bg-traffic-amber" />
            <span className="h-[4px] w-[4px] rounded-full bg-traffic-green" />
          </span>
          <span className="flex flex-1 items-center justify-center gap-[3px]">
            <span
              className="mark-mask h-[26px] w-[24px] text-gold"
              style={{ WebkitMaskImage: "url(/brand/trident-white.png)", maskImage: "url(/brand/trident-white.png)" }}
            />
            <span className="h-[26px] w-[3px] bg-gold" />
          </span>
        </span>
      )}
      <span
        className={`font-sans text-3xl font-bold leading-[0.82] tracking-wordmark ${wordColor}`}
      >
        246La
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

Note: the accessible name comes from `aria-label` on the outer `role="img"`,
so the visible `246La`/`s` text spans remain queryable by tests.

- [ ] **Step 5: Run Logo test to verify it passes**

Run: `cd web && npx vitest run tests/components/Logo.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Implement `web/components/Button.tsx`**

```tsx
import Link from "next/link";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "ghost";
  className?: string;
  children: React.ReactNode;
};

const styles = {
  primary:
    "bg-gold text-navy hover:brightness-95 border border-transparent",
  ghost:
    "bg-transparent text-white hover:bg-white/10 border border-white/30",
};

export function Button({
  href,
  variant = "primary",
  className = "",
  children,
}: ButtonProps) {
  const cls = `inline-flex items-center justify-center rounded-tile-sm px-6 py-3 font-mono text-sm uppercase tracking-label transition ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return <button className={cls}>{children}</button>;
}
```

- [ ] **Step 7: Commit**

```bash
git add web
git commit -m "feat: add Logo and Button brand components"
```

---

### Task 4: BootAnimation component

**Files:**
- Create: `web/components/BootAnimation.tsx`, `web/tests/components/BootAnimation.test.tsx`
- Modify: `web/app/globals.css` (add keyframes)

**Interfaces:**
- Consumes: `Logo`.
- Produces: `BootAnimation({ className?: string })` — the hero boot reveal
  (trident types out, cursor blinks, wordmark reveals, tagline fades in).

- [ ] **Step 1: Add keyframes to `web/app/globals.css`** (append)

```css
@keyframes type-out {
  from { width: 0; }
  to { width: 100%; }
}
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.boot-tagline {
  opacity: 0;
  animation: fade-up 0.6s ease-in-out 1.2s forwards;
}
.boot-cursor {
  animation: blink 1.05s step-end 1s infinite;
}
```

- [ ] **Step 2: Write failing test `web/tests/components/BootAnimation.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BootAnimation } from "@/components/BootAnimation";

describe("BootAnimation", () => {
  it("renders the brand and the tagline", () => {
    render(<BootAnimation />);
    expect(screen.getByRole("img", { name: /246labs/i })).toBeInTheDocument();
    expect(
      screen.getByText(/built in the Caribbean/i),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd web && npx vitest run tests/components/BootAnimation.test.tsx`
Expected: FAIL — cannot find module `@/components/BootAnimation`.

- [ ] **Step 4: Implement `web/components/BootAnimation.tsx`**

```tsx
import { Logo } from "@/components/Logo";

export function BootAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      <Logo variant="dark" className="text-4xl" />
      <p className="font-mono text-sm uppercase tracking-label text-gold boot-tagline">
        Cloud infrastructure, built in the Caribbean.
      </p>
    </div>
  );
}
```

Note: full width-based type-out is layered via the `.boot-cursor`/`type-out`
CSS on the Logo's cursor in a later polish pass; this task establishes the
component, tagline reveal, and reduced-motion safety (handled globally in
`globals.css`).

- [ ] **Step 5: Run test to verify it passes**

Run: `cd web && npx vitest run tests/components/BootAnimation.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add web
git commit -m "feat: add hero BootAnimation component"
```

---

### Task 5: Nav, Footer, and layout integration

**Files:**
- Create: `web/components/Nav.tsx`, `web/components/Footer.tsx`
- Modify: `web/app/layout.tsx`
- Create: `web/tests/components/Nav.test.tsx`

**Interfaces:**
- Consumes: `Logo`.
- Produces: `Nav()`, `Footer()`; both rendered by `RootLayout` around `children`.

- [ ] **Step 1: Write failing test `web/tests/components/Nav.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Nav } from "@/components/Nav";

describe("Nav", () => {
  it("links to all top-level routes", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: /services/i })).toHaveAttribute("href", "/services");
    expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "/contact");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run tests/components/Nav.test.tsx`
Expected: FAIL — cannot find module `@/components/Nav`.

- [ ] **Step 3: Implement `web/components/Nav.tsx`**

```tsx
import Link from "next/link";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="246Labs home">
          <Logo variant="dark" showIcon className="text-xl" />
        </Link>
        <ul className="flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-mono text-xs uppercase tracking-label text-white/80 hover:text-gold"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Implement `web/components/Footer.tsx`**

```tsx
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <Logo variant="dark" className="text-lg" />
        <div className="font-mono text-xs uppercase tracking-label text-faint">
          CONSULTING · DEVOPS · WEB APPS · HOSTING
        </div>
        <div className="font-mono text-xs text-faint">
          246labs.cloud · hello@246labs.cloud
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Wire Nav/Footer into `web/app/layout.tsx`**

Change the `<body>` contents to:
```tsx
<body className="font-sans antialiased">
  <Nav />
  <main className="min-h-screen">{children}</main>
  <Footer />
</body>
```
And add imports at top:
```tsx
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
```

- [ ] **Step 6: Run Nav test to verify it passes**

Run: `cd web && npx vitest run tests/components/Nav.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add web
git commit -m "feat: add Nav and Footer, integrate into root layout"
```

---

### Task 6: Services data, ServiceCard, and /services page

**Files:**
- Create: `web/lib/services.ts`, `web/components/ServiceCard.tsx`,
  `web/app/services/page.tsx`, `web/tests/lib/services.test.ts`

**Interfaces:**
- Produces:
  - `type ServiceGroup = { key: string; title: string; blurb: string; items: string[] }`
  - `SERVICE_GROUPS: ServiceGroup[]` (6 groups).
  - `ServiceCard({ group }: { group: ServiceGroup })`.

- [ ] **Step 1: Write failing test `web/tests/lib/services.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { SERVICE_GROUPS } from "@/lib/services";

describe("SERVICE_GROUPS", () => {
  it("defines the six service areas with unique keys and non-empty items", () => {
    expect(SERVICE_GROUPS).toHaveLength(6);
    const keys = SERVICE_GROUPS.map((g) => g.key);
    expect(new Set(keys).size).toBe(6);
    for (const g of SERVICE_GROUPS) {
      expect(g.items.length).toBeGreaterThan(0);
    }
    expect(keys).toContain("ai");
    expect(keys).toContain("assurance");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run tests/lib/services.test.ts`
Expected: FAIL — cannot find module `@/lib/services`.

- [ ] **Step 3: Implement `web/lib/services.ts`**

```ts
export type ServiceGroup = {
  key: string;
  title: string;
  blurb: string;
  items: string[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    key: "ai",
    title: "AI",
    blurb:
      "Put AI to work where it actually moves the needle — no hype, no science projects.",
    items: ["AI adoption consulting", "AI engineering", "Workflow automation"],
  },
  {
    key: "build",
    title: "Build",
    blurb:
      "Ship the product. Web apps, mobile-ready apps, and reworks of sites that have outgrown themselves.",
    items: ["Web app development", "App building", "Website reworks"],
  },
  {
    key: "run",
    title: "Run",
    blurb:
      "Keep it live and fast. Hosting, pipelines, and the boring maintenance that keeps you out of the news.",
    items: ["Hosting", "CI/CD pipelines", "App maintenance"],
  },
  {
    key: "cloud",
    title: "Cloud & DevOps",
    blurb:
      "AWS done properly — infrastructure as code, sane environments, and automation you can trust.",
    items: ["AWS solutions", "DevOps engineering"],
  },
  {
    key: "assurance",
    title: "Assurance",
    blurb:
      "Know where you stand. Security and compliance audits with findings you can act on.",
    items: ["Security audits", "Compliance audits"],
  },
  {
    key: "hardware",
    title: "Hardware",
    blurb:
      "When the problem is physical, we fix that too — practical support for the machines you depend on.",
    items: ["Hardware fixes", "On-site support"],
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run tests/lib/services.test.ts`
Expected: PASS.

- [ ] **Step 5: Implement `web/components/ServiceCard.tsx`**

```tsx
import type { ServiceGroup } from "@/lib/services";

export function ServiceCard({ group }: { group: ServiceGroup }) {
  return (
    <div className="rounded-tile border border-hairline bg-white p-6">
      <h3 className="font-sans text-xl font-bold text-flag-blue">
        {group.title}
      </h3>
      <p className="mt-2 text-ink/80">{group.blurb}</p>
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
    </div>
  );
}
```

- [ ] **Step 6: Implement `web/app/services/page.tsx`**

```tsx
import { SERVICE_GROUPS } from "@/lib/services";
import { ServiceCard } from "@/components/ServiceCard";

export const metadata = {
  title: "Services — 246Labs",
  description:
    "AI, build, run, cloud & DevOps, assurance, and hardware — everything 246Labs offers.",
};

export default function ServicesPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-label text-muted">
        What we do
      </p>
      <h1 className="mt-2 font-sans text-4xl font-bold tracking-wordmark text-flag-blue">
        Services
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/80">
        We design, build, run, and secure cloud and AI systems. Pick a lane or
        hand us the whole thing.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICE_GROUPS.map((group) => (
          <ServiceCard key={group.key} group={group} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add web
git commit -m "feat: add services catalog, ServiceCard, and services page"
```

---

### Task 7: Home page

**Files:**
- Create/Modify: `web/app/page.tsx`
- Create: `web/tests/pages/home.test.tsx`

**Interfaces:**
- Consumes: `BootAnimation`, `Button`, `SERVICE_GROUPS`, `ServiceCard`.

- [ ] **Step 1: Write failing test `web/tests/pages/home.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("shows the tagline and a contact CTA", () => {
    render(<Home />);
    expect(screen.getByText(/built in the Caribbean/i)).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /start a project|get in touch|contact/i });
    expect(cta).toHaveAttribute("href", "/contact");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run tests/pages/home.test.tsx`
Expected: FAIL — `web/app/page.tsx` still holds the default scaffold content.

- [ ] **Step 3: Replace `web/app/page.tsx`**

```tsx
import { BootAnimation } from "@/components/BootAnimation";
import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { SERVICE_GROUPS } from "@/lib/services";

export default function Home() {
  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-28">
          <BootAnimation />
          <p className="max-w-2xl text-xl text-white/80">
            246Labs is a Caribbean cloud-engineering studio. We build the
            software, run the infrastructure, and keep it secure — so you can
            get on with the business.
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICE_GROUPS.map((group) => (
            <ServiceCard key={group.key} group={group} />
          ))}
        </div>
      </section>

      <section className="bg-flag-blue">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-20">
          <h2 className="font-sans text-3xl font-bold tracking-wordmark text-white">
            Built in the Caribbean, run everywhere.
          </h2>
          <Button href="/about" variant="ghost">
            Our story
          </Button>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run tests/pages/home.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web
git commit -m "feat: build home page with hero, service grid, and CTA"
```

---

### Task 8: About page

**Files:**
- Create: `web/app/about/page.tsx`, `web/tests/pages/about.test.tsx`

- [ ] **Step 1: Write failing test `web/tests/pages/about.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/about/page";

describe("About page", () => {
  it("renders the AWS Partner badge and descriptor line", () => {
    render(<About />);
    expect(screen.getByText(/AWS Partner/i)).toBeInTheDocument();
    expect(screen.getByText(/CONSULTING · DEVOPS · WEB APPS · HOSTING/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run tests/pages/about.test.tsx`
Expected: FAIL — cannot find module `@/app/about/page`.

- [ ] **Step 3: Implement `web/app/about/page.tsx`**

```tsx
export const metadata = {
  title: "About — 246Labs",
  description:
    "246Labs is a Caribbean cloud-engineering studio. Precise about the work, proud of the place.",
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
          246Labs builds and runs cloud and AI systems for teams that need the
          work done right the first time. We are engineers first — precise
          about the work, proud of the place.
        </p>
        <p>
          The broken trident in our mark is Barbados&apos; own. It stands for
          independence and for building things that last. That is the standard
          we hold our infrastructure to.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <span className="rounded-tile-sm border border-hairline px-4 py-2 font-mono text-xs uppercase tracking-label text-muted">
          AWS Partner
        </span>
        <span className="font-mono text-xs uppercase tracking-label text-muted">
          CONSULTING · DEVOPS · WEB APPS · HOSTING
        </span>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run tests/pages/about.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web
git commit -m "feat: add about page with brand story and AWS Partner badge"
```

---

### Task 9: Contact validation schema (shared)

**Files:**
- Create: `web/lib/contact-schema.ts`, `web/tests/lib/contact-schema.test.ts`

**Interfaces:**
- Produces:
  - `type ContactInput = { name: string; email: string; company?: string; message: string; website?: string }`
  - `type ContactResult = { ok: true; data: Required<Pick<ContactInput,"name"|"email"|"message">> & { company: string } } | { ok: false; errors: Record<string,string> }`
  - `validateContact(input: unknown): ContactResult`
  - `isHoneypotTripped(input: unknown): boolean`

- [ ] **Step 1: Write failing test `web/tests/lib/contact-schema.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { validateContact, isHoneypotTripped } from "@/lib/contact-schema";

describe("validateContact", () => {
  it("accepts a valid submission", () => {
    const r = validateContact({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello there, I need help.",
    });
    expect(r.ok).toBe(true);
  });

  it("rejects missing name, bad email, and short message", () => {
    const r = validateContact({ name: "", email: "nope", message: "hi" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.name).toBeTruthy();
      expect(r.errors.email).toBeTruthy();
      expect(r.errors.message).toBeTruthy();
    }
  });

  it("rejects non-object input", () => {
    expect(validateContact(null).ok).toBe(false);
  });
});

describe("isHoneypotTripped", () => {
  it("is true when the website field is filled", () => {
    expect(isHoneypotTripped({ website: "http://spam" })).toBe(true);
  });
  it("is false when empty/absent", () => {
    expect(isHoneypotTripped({})).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run tests/lib/contact-schema.test.ts`
Expected: FAIL — cannot find module `@/lib/contact-schema`.

- [ ] **Step 3: Implement `web/lib/contact-schema.ts`**

```ts
export type ContactInput = {
  name: string;
  email: string;
  company?: string;
  message: string;
  website?: string; // honeypot
};

export type ContactResult =
  | { ok: true; data: { name: string; email: string; company: string; message: string } }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asRecord(input: unknown): Record<string, unknown> | null {
  return typeof input === "object" && input !== null
    ? (input as Record<string, unknown>)
    : null;
}

export function isHoneypotTripped(input: unknown): boolean {
  const r = asRecord(input);
  return !!r && typeof r.website === "string" && r.website.trim().length > 0;
}

export function validateContact(input: unknown): ContactResult {
  const r = asRecord(input);
  if (!r) return { ok: false, errors: { form: "Invalid submission." } };

  const name = typeof r.name === "string" ? r.name.trim() : "";
  const email = typeof r.email === "string" ? r.email.trim() : "";
  const company = typeof r.company === "string" ? r.company.trim() : "";
  const message = typeof r.message === "string" ? r.message.trim() : "";

  const errors: Record<string, string> = {};
  if (name.length < 1) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (message.length < 10)
    errors.message = "Give us a little more detail (10+ characters).";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, email, company, message } };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run tests/lib/contact-schema.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add web
git commit -m "feat: add shared contact validation schema and honeypot check"
```

---

### Task 10: /api/contact route with SES

**Files:**
- Create: `web/app/api/contact/route.ts`, `web/tests/api/contact.test.ts`
- Modify: `web/package.json` (adds `@aws-sdk/client-ses`, dev `aws-sdk-client-mock`)

**Interfaces:**
- Consumes: `validateContact`, `isHoneypotTripped`.
- Produces: `POST(req: Request): Promise<Response>` at `/api/contact`.
  Env vars: `SES_REGION`, `SES_SENDER`, `SES_RECIPIENT`.

- [ ] **Step 1: Install SES SDK + mock**

```bash
cd web && npm install @aws-sdk/client-ses && npm install -D aws-sdk-client-mock
```

- [ ] **Step 2: Write failing test `web/tests/api/contact.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { POST } from "@/app/api/contact/route";

const sesMock = mockClient(SESClient);

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  sesMock.reset();
  process.env.SES_REGION = "us-east-1";
  process.env.SES_SENDER = "no-reply@246labs.cloud";
  process.env.SES_RECIPIENT = "hello@246labs.cloud";
});

describe("POST /api/contact", () => {
  it("sends email and returns 200 on valid input", async () => {
    sesMock.on(SendEmailCommand).resolves({ MessageId: "abc" });
    const res = await post({
      name: "Ada",
      email: "ada@example.com",
      message: "I would like to discuss a project.",
    });
    expect(res.status).toBe(200);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(1);
  });

  it("returns 400 with errors on invalid input and sends nothing", async () => {
    const res = await post({ name: "", email: "bad", message: "hi" });
    expect(res.status).toBe(400);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
  });

  it("silently accepts honeypot spam without sending", async () => {
    const res = await post({
      name: "Ada",
      email: "ada@example.com",
      message: "totally real message here",
      website: "http://spam.example",
    });
    expect(res.status).toBe(200);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
  });

  it("returns 502 when SES fails", async () => {
    sesMock.on(SendEmailCommand).rejects(new Error("SES down"));
    const res = await post({
      name: "Ada",
      email: "ada@example.com",
      message: "I would like to discuss a project.",
    });
    expect(res.status).toBe(502);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd web && npx vitest run tests/api/contact.test.ts`
Expected: FAIL — cannot find module `@/app/api/contact/route`.

- [ ] **Step 4: Implement `web/app/api/contact/route.ts`**

```ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { validateContact, isHoneypotTripped } from "@/lib/contact-schema";

export const runtime = "nodejs";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, errors: { form: "Invalid request." } }, 400);
  }

  // Honeypot: pretend success, send nothing.
  if (isHoneypotTripped(payload)) return json({ ok: true }, 200);

  const result = validateContact(payload);
  if (!result.ok) return json({ ok: false, errors: result.errors }, 400);

  const { name, email, company, message } = result.data;
  const region = process.env.SES_REGION;
  const sender = process.env.SES_SENDER;
  const recipient = process.env.SES_RECIPIENT;
  if (!region || !sender || !recipient) {
    console.error("Contact route missing SES_* env vars");
    return json({ ok: false, errors: { form: "Server not configured." } }, 500);
  }

  const client = new SESClient({ region });
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    "",
    message,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    await client.send(
      new SendEmailCommand({
        Source: sender,
        Destination: { ToAddresses: [recipient] },
        ReplyToAddresses: [email],
        Message: {
          Subject: { Data: `New 246Labs enquiry from ${name}` },
          Body: { Text: { Data: body } },
        },
      }),
    );
  } catch (err) {
    console.error("SES send failed", err);
    return json({ ok: false, errors: { form: "Could not send. Try again." } }, 502);
  }

  return json({ ok: true }, 200);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd web && npx vitest run tests/api/contact.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add web
git commit -m "feat: add /api/contact route sending via Amazon SES"
```

---

### Task 11: ContactForm component and /contact page

**Files:**
- Create: `web/components/ContactForm.tsx`, `web/app/contact/page.tsx`,
  `web/tests/components/ContactForm.test.tsx`

**Interfaces:**
- Consumes: `validateContact` (client-side pre-check), `POST /api/contact`.
- Produces: `ContactForm()` client component.

- [ ] **Step 1: Write failing test `web/tests/components/ContactForm.test.tsx`**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContactForm } from "@/components/ContactForm";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ContactForm", () => {
  it("shows validation errors and does not fetch when invalid", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    render(<ContactForm />);
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(await screen.findByText(/tell us your name/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("submits and shows success on valid input", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/name/i), "Ada");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(
      screen.getByLabelText(/message/i),
      "I would like to discuss a project.",
    );
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() =>
      expect(screen.getByText(/thanks|got it|we.ll be in touch/i)).toBeInTheDocument(),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run tests/components/ContactForm.test.tsx`
Expected: FAIL — cannot find module `@/components/ContactForm`.

- [ ] **Step 3: Implement `web/components/ContactForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { validateContact } from "@/lib/contact-schema";
import { Button } from "@/components/Button";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const result = validateContact(data);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-tile border border-hairline bg-white p-6 text-ink">
        Thanks — we&apos;ll be in touch shortly.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <Field label="Name" name="name" error={errors.name} />
      <Field label="Email" name="email" type="email" error={errors.email} />
      <Field label="Company" name="company" />
      <div>
        <label htmlFor="message" className="block font-mono text-xs uppercase tracking-label text-muted">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="mt-1 w-full rounded-tile-sm border border-hairline bg-white p-3 text-ink"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-traffic-red">{errors.message}</p>
        )}
      </div>
      {status === "error" && (
        <p className="text-sm text-traffic-red">
          Something went wrong sending your message. Please try again.
        </p>
      )}
      <Button variant="primary">
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-mono text-xs uppercase tracking-label text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="mt-1 w-full rounded-tile-sm border border-hairline bg-white p-3 text-ink"
      />
      {error && <p className="mt-1 text-sm text-traffic-red">{error}</p>}
    </div>
  );
}
```

Note: the `Button` inside a `<form>` renders a real `<button>` (no `href`),
which submits the form — matches Task 3's `Button` implementation.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run tests/components/ContactForm.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement `web/app/contact/page.tsx`**

```tsx
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact — 246Labs",
  description: "Start a project with 246Labs.",
};

export default function ContactPage() {
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
      <div className="mt-10">
        <ContactForm />
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run full suite + build**

Run: `cd web && npm test && npm run build`
Expected: all tests PASS; production build succeeds.

- [ ] **Step 7: Commit**

```bash
git add web
git commit -m "feat: add contact form and contact page"
```

---

### Task 12: Amplify deployment config + docs

**Files:**
- Create: `amplify.yml` (repo root), `web/.env.example`, `web/README.md`

**Interfaces:**
- Produces: Amplify monorepo build spec targeting `web/`; documented env vars
  and deploy steps. (Actual Amplify console connection + SES verification are
  manual, owner-performed steps documented here.)

- [ ] **Step 1: Create `amplify.yml` at repo root**

```yaml
version: 1
applications:
  - appRoot: web
    frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - "**/*"
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

- [ ] **Step 2: Create `web/.env.example`**

```bash
# Amazon SES config for the contact form (set these in Amplify env vars).
SES_REGION=us-east-1
SES_SENDER=no-reply@246labs.cloud
SES_RECIPIENT=hello@246labs.cloud
```

- [ ] **Step 3: Create `web/README.md`**

````markdown
# 246Labs Marketing Site

Next.js (App Router) + Tailwind. Deployed on AWS Amplify Hosting.

## Local dev
```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm test         # Vitest
npm run build    # production build
```

## Environment
Copy `.env.example` to `.env.local` and fill in for local contact testing.
In production, set these in the Amplify console (never commit secrets):
`SES_REGION`, `SES_SENDER`, `SES_RECIPIENT`.

## Deploy (AWS Amplify)
1. Push this repo to GitHub/CodeCommit.
2. Amplify Console → New app → Host web app → connect the repo/branch.
3. Amplify auto-detects `amplify.yml` (monorepo `appRoot: web`).
4. Add env vars `SES_REGION`, `SES_SENDER`, `SES_RECIPIENT`.
5. Add custom domain `246labs.cloud` in Amplify → Domain management.

## SES prerequisites (one-time, owner)
- Verify `SES_SENDER` (domain or address) in the target AWS account/region.
- If SES is in sandbox, verify `SES_RECIPIENT` too, or request production access.
- Grant the Amplify compute role `ses:SendEmail` permission.
````

- [ ] **Step 4: Verify the build spec references a real build**

Run: `cd web && npm ci && npm run build`
Expected: clean install + build succeed (mirrors what Amplify runs).

- [ ] **Step 5: Commit**

```bash
git add amplify.yml web/.env.example web/README.md
git commit -m "chore: add Amplify build spec, env example, and deploy docs"
```

---

## Notes on scope and testing philosophy

- **TDD is applied where it has real value:** validation logic, the SES API
  route, and interactive form behavior are test-driven. Presentational
  components and pages get render smoke tests plus the `npm run build` gate —
  contrived pixel assertions would add noise, not safety.
- **Rate limiting:** deferred. In Amplify-managed Lambda, in-memory counters are
  per-instance and unreliable; the honeypot covers the common spam case. If
  volume warrants, add WAF rate rules or a DynamoDB-backed limiter later.
- **Boot animation fidelity:** Task 4 establishes the component and reduced-motion
  safety; pixel-exact timeline tuning against the handoff reference is a visual
  polish pass best done live in the browser, not via unit tests.
