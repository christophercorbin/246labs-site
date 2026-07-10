import type { ServiceGroup } from "@/lib/services";

export function ServiceCard({ group }: { group: ServiceGroup }) {
  return (
    <div className="rounded-tile border border-hairline bg-white p-6">
      <h3 className="font-sans text-xl font-bold text-flag-blue">
        {group.title}
      </h3>
      <p className="mt-2 text-ink/80">{group.blurb}</p>
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
    </div>
  );
}
