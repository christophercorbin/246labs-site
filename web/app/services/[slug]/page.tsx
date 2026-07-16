import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICE_GROUPS } from "@/lib/services";
import { SELECTED_WORK } from "@/lib/work";
import { Button } from "@/components/Button";

export function generateStaticParams() {
  return SERVICE_GROUPS.map((g) => ({ slug: g.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const group = SERVICE_GROUPS.find((g) => g.key === slug);
  if (!group) return {};
  return {
    title: `${group.title} — 246Labs`,
    description: group.blurb,
    alternates: { canonical: `/services/${group.key}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = SERVICE_GROUPS.find((g) => g.key === slug);
  if (!group) notFound();

  const proof = (group.relatedWork ?? [])
    .map((s) => SELECTED_WORK.find((w) => w.slug === s))
    .filter((w): w is (typeof SELECTED_WORK)[number] => Boolean(w));

  return (
    <>
      <section className="bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/services"
            className="font-mono text-xs uppercase tracking-label text-muted hover:text-gold"
          >
            ← Services
          </Link>
          <h1 className="mt-4 font-sans text-4xl font-bold tracking-wordmark text-flag-blue sm:text-5xl">
            {group.title}
          </h1>
          <p className="mt-4 text-lg text-ink/80">{group.longIntro}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-mono text-xs uppercase tracking-label text-muted">
            How we work
          </h2>
          <ol className="mt-4 space-y-4">
            {group.howWeWork.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="font-mono text-sm font-bold text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-ink/80">{step}</span>
              </li>
            ))}
          </ol>

          <h2 className="mt-12 font-mono text-xs uppercase tracking-label text-muted">
            What you get
          </h2>
          <ul className="mt-4 space-y-2">
            {group.deliverables.map((d) => (
              <li key={d} className="flex gap-2 text-ink/80">
                <span aria-hidden className="text-gold">
                  →
                </span>
                {d}
              </li>
            ))}
          </ul>

          {(proof.length > 0 || group.proofNote) && (
            <div className="mt-12">
              <h2 className="font-mono text-xs uppercase tracking-label text-muted">
                {proof.length > 0 ? "Case studies" : "We practice what we preach"}
              </h2>
              {proof.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {proof.map((w) => (
                    <li key={w.slug} className="text-ink/80">
                      <Link
                        href={`/work/${w.slug}`}
                        className="font-bold text-flag-blue underline hover:text-gold"
                      >
                        {w.name}
                      </Link>
                      <span> — {w.blurb}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-ink/80">{group.proofNote}</p>
              )}
            </div>
          )}

          <div className="mt-12">
            <Button href={`/contact?service=${group.key}`} variant="primary">
              {group.ctaLabel}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
