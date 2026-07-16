import { ContactForm } from "@/components/ContactForm";
import { SERVICE_GROUPS } from "@/lib/services";

export const metadata = {
  title: "Contact — 246Labs",
  description:
    "Start a project with 246Labs — cloud, AI, and DevOps engineering from Barbados. We reply within 1 business day.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const group = service
    ? SERVICE_GROUPS.find((g) => g.key === service)
    : undefined;
  const defaultMessage = group
    ? `I'm interested in: ${group.title}\n\n`
    : undefined;

  return (
    <section className="mx-auto max-w-2xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-label text-muted">
        Contact
      </p>
      <h1 className="mt-2 font-sans text-4xl font-bold tracking-wordmark text-flag-blue">
        Start a project.
      </h1>
      <p className="mt-4 text-lg text-ink/80">
        Tell us what you&apos;re building — or just what you&apos;re stuck on. No
        pitch, no obligation. Prefer email?{" "}
        <a className="text-flag-blue underline" href="mailto:hello@246labs.cloud">
          hello@246labs.cloud
        </a>
      </p>
      <p className="mt-2 font-mono text-xs uppercase tracking-label text-muted">
        Based in Barbados · Working across the Caribbean and beyond · We reply
        within 1 business day
      </p>
      <div className="mt-10">
        <ContactForm defaultMessage={defaultMessage} />
      </div>
    </section>
  );
}
