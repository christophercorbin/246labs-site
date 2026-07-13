import type { ServiceGroup } from "@/lib/services";

export function ServiceCard({ group }: { group: ServiceGroup }) {
  return (
    <div className="card card-accent border border-hairline bg-white p-6">
      <h3 className="font-sans text-xl font-bold text-flag-blue">
        {group.title}
      </h3>
      <p className="mt-2 text-ink/80">{group.description}</p>
      <ul className="mt-4 space-y-1">
        {group.items.map((item) => (
          <li
            key={item}
            className="font-mono text-xs uppercase tracking-label text-muted"
          >
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-5 font-mono text-xs uppercase tracking-label text-muted">
        You get
      </p>
      <ul className="mt-2 space-y-1 text-sm text-ink/80">
        {group.deliverables.map((d) => (
          <li key={d} className="flex gap-2">
            <span aria-hidden className="text-gold">
              →
            </span>
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}
