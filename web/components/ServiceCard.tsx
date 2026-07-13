import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import {
  Sparkles,
  Code,
  Server,
  Cloud,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import type { ServiceGroup } from "@/lib/services";

// key -> icon. Falls back to Sparkles if a new group key is ever added
// without a mapping (keeps the grid rendering rather than crashing).
const ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  ai: Sparkles,
  build: Code,
  run: Server,
  cloud: Cloud,
  assurance: ShieldCheck,
  hardware: Cpu,
};

export function ServiceCard({ group }: { group: ServiceGroup }) {
  const Icon = ICONS[group.key] ?? Sparkles;
  return (
    <Link
      href={`/services/${group.key}`}
      className="card card-accent group block border border-hairline bg-white p-6"
    >
      <Icon aria-hidden className="h-7 w-7 text-gold" strokeWidth={1.75} />
      <h3 className="mt-3 font-sans text-xl font-bold text-flag-blue">
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
      <span className="mt-5 block font-mono text-xs uppercase tracking-label text-muted group-hover:text-gold">
        Explore {group.title} →
      </span>
    </Link>
  );
}
