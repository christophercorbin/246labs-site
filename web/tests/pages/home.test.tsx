import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("shows the tagline and a contact CTA", () => {
    render(<Home />);
    expect(
      screen.getByText("Cloud infrastructure, built in the Caribbean."),
    ).toBeInTheDocument();
    const cta = screen.getByRole("link", {
      name: /start a project|get in touch|contact/i,
    });
    expect(cta).toHaveAttribute("href", "/contact");
  });
});
