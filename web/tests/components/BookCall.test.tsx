import { render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { BookCall } from "@/components/BookCall";

const OLD = { ...process.env };
afterEach(() => {
  process.env = { ...OLD };
});

describe("BookCall", () => {
  it("renders nothing when no booking URL is set", () => {
    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    const { container } = render(<BookCall />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a new-tab booking link when configured", () => {
    process.env.NEXT_PUBLIC_BOOKING_URL = "https://cal.com/246labs/intro";
    render(<BookCall />);
    const link = screen.getByRole("link", { name: /book a call/i });
    expect(link).toHaveAttribute("href", "https://cal.com/246labs/intro");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("honors a custom label", () => {
    process.env.NEXT_PUBLIC_BOOKING_URL = "https://cal.com/246labs/intro";
    render(<BookCall label="Book a 30-min call" />);
    expect(
      screen.getByRole("link", { name: /book a 30-min call/i }),
    ).toBeInTheDocument();
  });
});
