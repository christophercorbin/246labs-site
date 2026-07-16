import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/lib/work";

export function WorkCard({ work }: { work: Work }) {
  return (
    <Link
      href={`/work/${work.slug}`}
      className="card group flex flex-col overflow-hidden border border-hairline bg-white"
    >
      {/* Thumbnail zone — a real screenshot (16:9) when `image` is set,
          otherwise the brand-gradient placeholder with the product name. */}
      <div
        data-work-thumb
        className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-navy to-flag-blue"
      >
        {work.image ? (
          <Image
            src={work.image}
            alt={`${work.name} screenshot`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <span className="font-sans text-lg font-bold tracking-wordmark text-white/90">
            {work.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-sans text-xl font-bold text-flag-blue">
          {work.name}
        </h3>
        <p className="mt-2 flex-1 text-ink/80">{work.blurb}</p>
        <span className="mt-4 font-mono text-xs uppercase tracking-label text-muted group-hover:text-gold">
          View case study →
        </span>
      </div>
    </Link>
  );
}
