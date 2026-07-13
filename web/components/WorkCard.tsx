import type { Work } from "@/lib/work";

export function WorkCard({ work }: { work: Work }) {
  return (
    <a
      href={work.href}
      target="_blank"
      rel="noopener noreferrer"
      className="card group flex flex-col overflow-hidden border border-hairline bg-white"
    >
      {/* Thumbnail zone — brand gradient placeholder; a real screenshot later
          drops into this same 16:9 box (add an <img> with object-cover). */}
      <div
        data-work-thumb
        className="flex aspect-video items-center justify-center bg-gradient-to-br from-navy to-flag-blue"
      >
        <span className="font-sans text-lg font-bold tracking-wordmark text-white/90">
          {work.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-sans text-xl font-bold text-flag-blue">
          {work.name}
        </h3>
        <p className="mt-2 flex-1 text-ink/80">{work.blurb}</p>
        <span className="mt-4 font-mono text-xs uppercase tracking-label text-muted group-hover:text-gold">
          Visit ↗
        </span>
      </div>
    </a>
  );
}
