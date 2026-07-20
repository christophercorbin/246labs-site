import { Button } from "@/components/Button";

// A "Book a call" button that opens the Cal.com booking page in a new tab.
// Renders nothing until NEXT_PUBLIC_BOOKING_URL is set (same graceful pattern
// as Analytics) — no broken link, no third-party script on our domain.
export function BookCall({
  variant = "primary",
  className = "",
  label = "Book a call",
}: {
  variant?: "primary" | "ghost";
  className?: string;
  label?: string;
}) {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL;
  if (!url) return null;
  return (
    <Button href={url} external variant={variant} className={className}>
      {label}
    </Button>
  );
}
