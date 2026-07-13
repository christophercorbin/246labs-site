import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("shows a visible display h1 and a contact CTA", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { level: 1, name: /build, run, and secure/i }),
    ).toBeInTheDocument();
    const cta = screen.getAllByRole("link", { name: /start a project/i })[0];
    expect(cta).toHaveAttribute("href", "/contact");
  });

  it("keeps the brand tagline and the two pillars", () => {
    render(<Home />);
    expect(
      screen.getAllByText("Cloud infrastructure, built in the Caribbean.")[0],
    ).toBeInTheDocument();
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
