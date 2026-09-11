import type { Metadata } from "next";
import Link from "next/link";
import { ProofPanel } from "@/components/ProofPanel";
import { Button } from "@/components/Button";
import { ServiceCard } from "@/components/ServiceCard";
import { WorkCard } from "@/components/WorkCard";
import { BookCall } from "@/components/BookCall";
import { LocalServicesNote } from "@/components/LocalServicesNote";
import { CORE_SERVICES } from "@/lib/services";
import { SELECTED_WORK } from "@/lib/work";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* Hero (navy) — copy left, terminal proof panel right on large screens */}
      <section className="bg-navy">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-28">
          <div className="flex flex-col gap-8">
            <h1 className="font-sans text-4xl font-bold leading-tight tracking-wordmark text-white sm:text-5xl">
              We build, run, and secure your cloud &amp; AI.
            </h1>
            <p className="max-w-2xl text-xl text-white/80">
              A Caribbean cloud and AI studio. We build the software, run the
              infrastructure, and keep it secure — San Francisco rigor,
              engineered from Barbados, delivered anywhere.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/contact" variant="primary">
                Start a project
              </Button>
              <BookCall variant="ghost" />
              <Button href="/services" variant="ghost">
                See services
              </Button>
            </div>
            <p data-proof className="max-w-2xl text-sm text-white/60">
              The same stack runs our own products —{" "}
              <Link
                href="/work/sumdeting"
                className="text-white/90 underline hover:text-gold"
              >
                SumDeTing
              </Link>
              ,{" "}
              <Link
                href="/work/bimweather"
                className="text-white/90 underline hover:text-gold"
              >
                Bim Weather
              </Link>
              , and{" "}
              <Link
                href="/work/cargolink"
                className="text-white/90 underline hover:text-gold"
              >
                CargoLink
              </Link>
              .
            </p>
          </div>
          <ProofPanel />
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
            {CORE_SERVICES.map((group) => (
              <ServiceCard key={group.key} group={group} />
            ))}
          </div>
          <LocalServicesNote className="mt-10" />
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
          <div className="flex flex-wrap gap-4">
            <Button href="/contact" variant="primary">
              Start a project
            </Button>
            <Button href="/about" variant="ghost">
              Our story
            </Button>
            <BookCall variant="ghost" />
          </div>
        </div>
      </section>
    </>
  );
}
