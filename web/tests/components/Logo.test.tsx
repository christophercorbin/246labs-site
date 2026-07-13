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

  it("adds boot animation classes only when animated", () => {
    const { container, rerender } = render(<Logo animated />);
    expect(container.querySelector(".boot-trident")).not.toBeNull();
    expect(container.querySelector(".boot-cursor")).not.toBeNull();
    expect(container.querySelector(".boot-wordmark")).not.toBeNull();
    rerender(<Logo />);
    expect(container.querySelector(".boot-trident")).toBeNull();
    expect(container.querySelector(".boot-cursor")).toBeNull();
    expect(container.querySelector(".boot-wordmark")).toBeNull();
  });

  it("no longer renders traffic dots (moved to the favicon)", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector(".bg-traffic-red")).toBeNull();
    expect(container.querySelector(".bg-traffic-amber")).toBeNull();
    expect(container.querySelector(".bg-traffic-green")).toBeNull();
  });
});
