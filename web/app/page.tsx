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
