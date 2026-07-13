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
