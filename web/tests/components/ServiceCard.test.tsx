import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ServiceCard } from "@/components/ServiceCard";
import { SERVICE_GROUPS } from "@/lib/services";

const ai = SERVICE_GROUPS.find((g) => g.key === "ai")!;

describe("ServiceCard", () => {
  it("renders an icon plus the title, items, and deliverables", () => {
    const { container } = render(<ServiceCard group={ai} />);
    // Icon present (lucide renders an <svg>), and hidden from a11y tree.
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    // Existing content still renders.
    expect(screen.getByRole("heading", { name: ai.title })).toBeInTheDocument();
    expect(screen.getByText(ai.items[0])).toBeInTheDocument();
    expect(screen.getByText(ai.deliverables[0])).toBeInTheDocument();
  });

  it("maps every service group key to an icon", () => {
    for (const g of SERVICE_GROUPS) {
      const { container } = render(<ServiceCard group={g} />);
      expect(container.querySelector("svg")).not.toBeNull();
    }
  });
});
