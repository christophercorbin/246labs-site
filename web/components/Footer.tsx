import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SERVICE_GROUPS } from "@/lib/services";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <Logo variant="dark" className="text-lg" />
        {/* Derived from the service catalogue so it can't drift out of sync. */}
        <nav aria-label="Services" className="flex flex-wrap gap-x-2 font-mono text-xs uppercase tracking-label text-faint">
          {SERVICE_GROUPS.map((g, i) => (
            <span key={g.key} className="flex gap-x-2">
              {i > 0 && <span aria-hidden>·</span>}
              <Link href={`/services/${g.key}`} className="hover:text-gold">
                {g.title}
              </Link>
            </span>
          ))}
        </nav>
        <div className="flex items-center gap-4 font-mono text-xs text-faint">
          <span>246labs.cloud · hello@246labs.cloud</span>
          <Link href="/privacy" className="underline hover:text-gold">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
