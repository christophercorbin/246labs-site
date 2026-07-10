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
