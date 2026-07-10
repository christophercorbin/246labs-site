import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <Logo variant="dark" className="text-lg" />
        <div className="font-mono text-xs uppercase tracking-label text-faint">
          CONSULTING · DEVOPS · WEB APPS · HOSTING
        </div>
        <div className="font-mono text-xs text-faint">
          246labs.cloud · hello@246labs.cloud
        </div>
      </div>
    </footer>
  );
}
