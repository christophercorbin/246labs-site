import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ServicesPage from "@/app/services/page";
import { CORE_SERVICES, SERVICE_GROUPS } from "@/lib/services";

describe("Services page", () => {
  it("renders each group's deliverables under a 'You get' label", () => {
    render(<ServicesPage />);
    // One "You get" label per core service card; Hardware is a footnote.
    expect(screen.getAllByText("You get")).toHaveLength(CORE_SERVICES.length);
    expect(screen.getAllByText("You get").length).toBeLessThan(SERVICE_GROUPS.length);
    // A specific deliverable renders (guards ServiceCard.deliverables output).
    expect(screen.getByText("AI adoption roadmap")).toBeInTheDocument();
    expect(screen.getByText("Security audit & report")).toBeInTheDocument();
  });

  it("keeps Hardware reachable as a footnote under the grid", () => {
    const { container } = render(<ServicesPage />);
    const note = container.querySelector("[data-local-services]");
    expect(note).not.toBeNull();
    expect(within(note as HTMLElement).getByRole("link", { name: /Hardware/i })).toHaveAttribute(
      "href",
      "/services/hardware",
    );
  });

  it("shows an entry price on every core service card", () => {
    const { container } = render(<ServicesPage />);
    expect(container.querySelectorAll("[data-pricing]")).toHaveLength(CORE_SERVICES.length);
    expect(screen.getAllByText(/From US\$4,000/).length).toBeGreaterThan(0);
  });
});
