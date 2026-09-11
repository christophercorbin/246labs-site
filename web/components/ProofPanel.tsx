import { BootAnimation } from "@/components/BootAnimation";
import { SELECTED_WORK } from "@/lib/work";

// Hero visual: the brand's terminal-window motif, scaled up, with the boot
// animation inside and a strip of defensible facts beneath. Every number here
// must be true from the codebase or the site copy — no marketing rounding.
const FACTS: { value: string; label: string }[] = [
  { value: String(SELECTED_WORK.length), label: "products in production" },
  { value: "AWS", label: "infra as code, least privilege" },
  { value: "1 day", label: "reply on every enquiry" },
];

export function ProofPanel({ className = "" }: { className?: string }) {
  return (
    <div
      data-proof-panel
      className={`overflow-hidden rounded-tile border border-white/10 bg-panel-blue/40 shadow-2xl shadow-black/30 ${className}`}
    >
      {/* Titlebar */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-panel-blue px-4 py-3">
        <span aria-hidden className="h-3 w-3 rounded-full bg-traffic-red" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-traffic-amber" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-traffic-green" />
        <span className="ml-3 font-mono text-[11px] uppercase tracking-label text-white/50">
          246labs — production
        </span>
      </div>

      {/* Body */}
      <div className="px-6 py-10 sm:px-10">
        <BootAnimation />
        <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {FACTS.map((f) => (
            <div key={f.label}>
              <dt className="font-sans text-2xl font-bold tracking-wordmark text-white sm:text-3xl">
                {f.value}
              </dt>
              <dd className="mt-1 font-mono text-[10px] uppercase leading-snug tracking-label text-white/60 sm:text-[11px]">
                {f.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
