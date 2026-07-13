import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("shows the tagline and a contact CTA", () => {
    render(<Home />);
    expect(
      screen.getAllByText("Cloud infrastructure, built in the Caribbean.")[0],
    ).toBeInTheDocument();
    // Two "Start a project" links now (hero + closing band); take the first.
    const cta = screen.getAllByRole("link", { name: /start a project/i })[0];
    expect(cta).toHaveAttribute("href", "/contact");
  });

  it("has an h1 for the page", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /cloud infrastructure/i }),
    ).toBeInTheDocument();
  });

  it("states the two pillars", () => {
    render(<Home />);
    expect(screen.getByText(/the region competes/i)).toBeInTheDocument();
    expect(screen.getByText(/value stays home/i)).toBeInTheDocument();
  });

  it("shows the selected work with external links", () => {
    render(<Home />);
    expect(
      screen.getByRole("link", { name: /SumDeTing/i }),
    ).toHaveAttribute("href", "https://sumdeting.246labs.cloud");
    expect(
      screen.getByRole("link", { name: /Bim Weather/i }),
    ).toHaveAttribute("href", "https://bimweather.246labs.cloud");
    expect(
      screen.getByRole("link", { name: /CargoLink Barbados/i }),
    ).toHaveAttribute("href", "https://cargolinkbarbados.com");
  });
});
