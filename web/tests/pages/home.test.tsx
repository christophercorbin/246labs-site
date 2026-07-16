import { render, screen, within } from "@testing-library/react";
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

  it("links selected work to their case-study pages", () => {
    const { container } = render(<Home />);
    const work = within(container.querySelector("#work") as HTMLElement);
    expect(
      work.getByRole("link", { name: /SumDeTing/i }),
    ).toHaveAttribute("href", "/work/sumdeting");
    expect(
      work.getByRole("link", { name: /Bim Weather/i }),
    ).toHaveAttribute("href", "/work/bimweather");
    expect(
      work.getByRole("link", { name: /CargoLink Barbados/i }),
    ).toHaveAttribute("href", "/work/cargolink");
  });

  it("shows an above-the-fold proof line linking to the case studies", () => {
    const { container } = render(<Home />);
    const proof = within(container.querySelector("[data-proof]") as HTMLElement);
    expect(
      proof.getByRole("link", { name: /SumDeTing/i }),
    ).toHaveAttribute("href", "/work/sumdeting");
    expect(
      proof.getByRole("link", { name: /Bim Weather/i }),
    ).toHaveAttribute("href", "/work/bimweather");
    expect(
      proof.getByRole("link", { name: /CargoLink/i }),
    ).toHaveAttribute("href", "/work/cargolink");
  });
});
