import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SELECTED_WORK } from "@/lib/work";
import { SERVICE_GROUPS } from "@/lib/services";
import { Button } from "@/components/Button";

export function generateStaticParams() {
  return SELECTED_WORK.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = SELECTED_WORK.find((w) => w.slug === slug);
  if (!work) return {};
  return {
    title: `${work.name} — 246Labs`,
    description: work.blurb,
    alternates: { canonical: `/work/${work.slug}` },
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = SELECTED_WORK.find((w) => w.slug === slug);
  if (!work) notFound();

  const services = (work.relatedServices ?? [])
    .map((k) => SERVICE_GROUPS.find((g) => g.key === k))
    .filter((g): g is (typeof SERVICE_GROUPS)[number] => Boolean(g));

  return (
    <>
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/#work"
            className="font-mono text-xs uppercase tracking-label text-muted hover:text-gold"
          >
            ← Work
          </Link>
          <h1 className="mt-4 font-sans text-4xl font-bold tracking-wordmark text-flag-blue sm:text-5xl">
            {work.name}
          </h1>
          <p className="mt-4 text-lg text-ink/80">{work.blurb}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          {work.metrics && work.metrics.length > 0 && (
            <dl data-metrics className="mb-12 grid gap-6 sm:grid-cols-3">
              {work.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="font-sans text-3xl font-bold text-flag-blue">
                    {m.value}
                  </dt>
                  <dd className="mt-1 font-mono text-xs uppercase tracking-label text-muted">
                    {m.label}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {work.problem && (
            <>
              <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                The problem
              </h2>
              <p className="mt-4 text-ink/80">{work.problem}</p>
            </>
          )}

          {work.approach && work.approach.length > 0 && (
            <>
              <h2 className="mt-12 font-mono text-xs uppercase tracking-label text-muted">
                What we built
              </h2>
              <ol className="mt-4 space-y-4">
                {work.approach.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="font-mono text-sm font-bold text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-ink/80">{step}</span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {work.outcome && (
            <>
              <h2 className="mt-12 font-mono text-xs uppercase tracking-label text-muted">
                The result
              </h2>
              <p className="mt-4 text-ink/80">{work.outcome}</p>
            </>
          )}

          {work.stack && work.stack.length > 0 && (
            <>
              <h2 className="mt-12 font-mono text-xs uppercase tracking-label text-muted">
                The stack
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {work.stack.map((s) => (
                  <li
                    key={s}
                    className="rounded-tile-sm border border-hairline px-4 py-2 font-mono text-xs uppercase tracking-label text-muted"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-12">
            <a
              href={work.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-label text-flag-blue underline hover:text-gold"
            >
              Visit it live ↗
            </a>
          </div>

          <div className="mt-8">
            <Button href="/contact" variant="primary">
              Start a project
            </Button>
          </div>

          {services.length > 0 && (
            <div className="mt-12">
              <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                Related services
              </h2>
              <ul className="mt-4 space-y-2">
                {services.map((g) => (
                  <li key={g.key}>
                    <Link
                      href={`/services/${g.key}`}
                      className="font-bold text-flag-blue underline hover:text-gold"
                    >
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
