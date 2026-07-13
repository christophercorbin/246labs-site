export const metadata = {
  title: "Privacy — 246Labs",
  description: "What 246Labs collects, why, and how to reach us about it.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-label text-muted">
        Legal
      </p>
      <h1 className="mt-2 font-sans text-4xl font-bold tracking-wordmark text-flag-blue">
        Privacy policy
      </h1>
      <div className="mt-8 space-y-6 text-ink/80">
        <p>
          246Labs collects only what you give us. If you use the contact form,
          that means your name, email address, company (optional), and your
          message. We use it for one thing: replying to you.
        </p>
        <p>
          Form submissions are delivered by Amazon SES (AWS, US East region) to
          our Google Workspace inbox. We don&apos;t sell, share, or enrich your
          data, and we don&apos;t add you to a mailing list.
        </p>
        <p>
          This site sets no analytics or advertising cookies. Our hosting
          provider (AWS Amplify/CloudFront) keeps standard server logs — IP
          address, user agent, request time — for security and operations.
        </p>
        <p>
          Want your messages deleted? Email{" "}
          <a className="text-flag-blue underline" href="mailto:hello@246labs.cloud">
            hello@246labs.cloud
          </a>{" "}
          and we&apos;ll remove them.
        </p>
        <p className="font-mono text-xs uppercase tracking-label text-muted">
          Last updated: July 2026 · 246Labs, Barbados
        </p>
      </div>
    </section>
  );
}
