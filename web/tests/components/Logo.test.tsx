import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("renders the wordmark text with a white final s", () => {
    render(<Logo />);
    expect(screen.getByText("246La")).toBeInTheDocument();
    const s = screen.getByText("s");
    expect(s).toBeInTheDocument();
    // The final s is no longer the gold accent — it inherits the white wordmark.
    expect(s.className).not.toContain("text-gold");
  });

  it("renders the Barbados island glyph in gold", () => {
    // showIcon=false removes the trident tile so the island is the only mark-mask.
    const { container } = render(<Logo showIcon={false} />);
    const marks = container.querySelectorAll(".mark-mask");
    expect(marks).toHaveLength(1);
    expect(marks[0].className).toContain("text-gold");
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
