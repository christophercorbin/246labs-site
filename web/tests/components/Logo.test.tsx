import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("renders the wordmark text with the accent final s", () => {
    render(<Logo />);
    expect(screen.getByText("246La")).toBeInTheDocument();
    expect(screen.getByText("s")).toBeInTheDocument();
  });

  it("exposes an accessible brand name", () => {
    render(<Logo />);
    expect(screen.getByRole("img", { name: /246labs/i })).toBeInTheDocument();
  });
});
