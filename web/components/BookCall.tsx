import { Button } from "@/components/Button";

// 246Labs Cal.com booking page. Override per-environment with
// NEXT_PUBLIC_BOOKING_URL (e.g. a self-hosted Cal.com instance later).
const DEFAULT_BOOKING_URL =
  "https://cal.com/christopher-corbin-yeeruz/30-min-intro-call";

// A "Book a call" button that opens the Cal.com booking page in a new tab.
// Link-out only — no third-party script or iframe loads on our domain.
export function BookCall({
  variant = "primary",
  className = "",
  label = "Book a call",
}: {
  variant?: "primary" | "ghost";
  className?: string;
  label?: string;
}) {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL || DEFAULT_BOOKING_URL;
  return (
    <Button href={url} external variant={variant} className={className}>
      {label}
    </Button>
  );
}
