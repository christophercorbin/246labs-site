import { Logo } from "@/components/Logo";

export function BootAnimation({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-start gap-4 ${className}`}>
      <Logo variant="dark" className="text-4xl" />
      <p className="font-mono text-sm uppercase tracking-label text-gold boot-tagline">
        Cloud infrastructure, built in the Caribbean.
      </p>
    </div>
  );
}
