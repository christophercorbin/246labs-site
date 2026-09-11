import Link from "next/link";
import { LOCAL_SERVICES } from "@/lib/services";

// Footnote under the service grid for Barbados-only, on-site work. Kept out
// of the main grid so it doesn't anchor the premium offer down, but still one
// click away for the local buyer who needs it.
export function LocalServicesNote({ className = "" }: { className?: string }) {
  if (LOCAL_SERVICES.length === 0) return null;
  return (
    <p
      data-local-services
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-hairline pt-6 text-sm text-muted ${className}`}
    >
      <span className="font-mono text-xs uppercase tracking-label">
        Also, in Barbados
      </span>
      {LOCAL_SERVICES.map((g) => (
        <span key={g.key}>
          {g.blurb}{" "}
          <Link
            href={`/services/${g.key}`}
            className="font-mono text-xs uppercase tracking-label text-flag-blue underline hover:text-gold"
          >
            {g.title} →
          </Link>
        </span>
      ))}
    </p>
  );
}
