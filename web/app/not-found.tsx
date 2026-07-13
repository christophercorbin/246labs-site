import { Button } from "@/components/Button";

export default function NotFound() {
  return (
    <section className="bg-navy">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-28">
        <p className="font-mono text-6xl font-bold text-gold">404</p>
        <h1 className="font-sans text-3xl font-bold tracking-wordmark text-white">
          This page doesn&apos;t exist.
        </h1>
        <p className="max-w-xl text-white/80">
          The address may have changed, or the page was never here. Either way —
          nothing to debug on your end.
        </p>
        <Button href="/" variant="primary">
          Back to home
        </Button>
      </div>
    </section>
  );
}
