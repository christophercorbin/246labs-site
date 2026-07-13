export const metadata = {
  title: "About — 246Labs",
  description:
    "Why 246Labs exists: world-class cloud and AI engineering, built in the Caribbean and delivered anywhere.",
  alternates: { canonical: "/about" },
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
          246Labs is a Caribbean cloud and AI studio. We build the software, run
          the infrastructure, and keep it secure — to the same standard as a firm
          in San Francisco or London, engineered from Barbados.
        </p>
        <p>
          It exists for a simple reason: serious engineering shouldn&apos;t have
          to leave the region to be world-class. Too much Caribbean talent gets
          exported — the work, and the people who do it. 246Labs is the bet that
          it can be built here instead, and stand up to anyone, anywhere.
        </p>
        <p>
          It&apos;s led by{" "}
          <strong className="text-ink">Christopher Corbin</strong>, Founder &amp;
          Principal Engineer — the person doing the work, not just running the
          business. New company, high standard, no shortcuts.
        </p>
        <p>
          The standard isn&apos;t a promise; it&apos;s already running.{" "}
          <a
            className="text-flag-blue underline"
            href="https://sumdeting.246labs.cloud"
            target="_blank"
            rel="noopener noreferrer"
          >
            SumDeTing
          </a>{" "}
          is an AI math tutor for Caribbean students built on Claude and Amazon
          Bedrock;{" "}
          <a
            className="text-flag-blue underline"
            href="https://bimweather.246labs.cloud"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bim Weather
          </a>{" "}
          tracks storms across Barbados in real time; and{" "}
          <a
            className="text-flag-blue underline"
            href="https://cargolinkbarbados.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            CargoLink Barbados
          </a>{" "}
          moves cargo smarter. Same stack we&apos;d build yours on.
        </p>
        <p>
          The broken trident in our mark is Barbados&apos; own. It stands for
          independence and for building things that last. That is the standard we
          hold our infrastructure to.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <span className="rounded-tile-sm border border-hairline px-4 py-2 font-mono text-xs uppercase tracking-label text-muted">
          Built on AWS
        </span>
        <span className="font-mono text-xs uppercase tracking-label text-muted">
          CONSULTING · DEVOPS · WEB APPS · HOSTING
        </span>
      </div>
    </section>
  );
}
