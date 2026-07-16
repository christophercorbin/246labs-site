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
            We design, build, run, and secure cloud and AI systems — San
            Francisco rigor, engineered from Barbados. Take one lane or hand us
            the whole thing: a scoped project or an ongoing retainer.
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
