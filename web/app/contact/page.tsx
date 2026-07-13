import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact — 246Labs",
  description:
    "Start a project with 246Labs — cloud, AI, and DevOps engineering from Barbados. We reply within 1 business day.",
  alternates: { canonical: "/contact" },
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
      <p className="mt-2 font-mono text-xs uppercase tracking-label text-muted">
        Based in Barbados · Working across the Caribbean and beyond · We reply
        within 1 business day
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </section>
  );
}
