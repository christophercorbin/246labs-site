import type { Work } from "@/lib/work";

export function WorkCard({ work }: { work: Work }) {
  return (
    <a
      href={work.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-tile border border-hairline bg-white p-6 transition hover:border-flag-blue"
    >
      <h3 className="font-sans text-xl font-bold text-flag-blue">
        {work.name}
      </h3>
      <p className="mt-2 flex-1 text-ink/80">{work.blurb}</p>
      <span className="mt-4 font-mono text-xs uppercase tracking-label text-muted group-hover:text-flag-blue">
        Visit ↗
      </span>
    </a>
  );
}
