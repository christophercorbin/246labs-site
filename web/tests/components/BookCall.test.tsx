import { render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { BookCall } from "@/components/BookCall";

const OLD = { ...process.env };
afterEach(() => {
  process.env = { ...OLD };
});

describe("BookCall", () => {
  it("renders the default booking link in a new tab with no env override", () => {
    delete process.env.NEXT_PUBLIC_BOOKING_URL;
    render(<BookCall />);
    const link = screen.getByRole("link", { name: /book a call/i });
    expect(link).toHaveAttribute(
      "href",
      "https://cal.com/christopher-corbin-yeeruz/30-min-intro-call",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("lets NEXT_PUBLIC_BOOKING_URL override the default", () => {
    process.env.NEXT_PUBLIC_BOOKING_URL = "https://book.246labs.cloud/intro";
    render(<BookCall />);
    expect(
      screen.getByRole("link", { name: /book a call/i }),
    ).toHaveAttribute("href", "https://book.246labs.cloud/intro");
  });

  it("honors a custom label", () => {
    render(<BookCall label="Book a 30-min call" />);
    expect(
      screen.getByRole("link", { name: /book a 30-min call/i }),
    ).toBeInTheDocument();
  });
});
