import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ServicesPage from "@/app/services/page";

describe("Services page", () => {
  it("renders each group's deliverables under a 'You get' label", () => {
    render(<ServicesPage />);
    // One "You get" label per service card (six groups).
    expect(screen.getAllByText("You get")).toHaveLength(6);
    // A specific deliverable renders (guards ServiceCard.deliverables output).
    expect(screen.getByText("AI adoption roadmap")).toBeInTheDocument();
    expect(screen.getByText("Security audit & report")).toBeInTheDocument();
  });
});
