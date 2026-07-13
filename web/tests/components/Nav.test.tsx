import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Nav } from "@/components/Nav";

describe("Nav", () => {
  it("links to all top-level routes", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: /services/i })).toHaveAttribute("href", "/services");
    expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: /contact/i })).toHaveAttribute("href", "/contact");
  });

  it("collapses the links behind a closed menu button by default", () => {
    render(<Nav />);
    const btn = screen.getByRole("button", { name: /open menu/i });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(btn).toHaveAttribute("aria-controls", "mobile-menu");
    // The dropdown is not in the DOM until opened.
    expect(document.getElementById("mobile-menu")).toBeNull();
  });

  it("opens the mobile menu, exposing the routes, then closes on selection", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

    const toggle = screen.getByRole("button", { name: /close menu/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const menu = document.getElementById("mobile-menu");
    expect(menu).not.toBeNull();
    const hrefs = within(menu!)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/services", "/about", "/contact"]);

    // Selecting a link closes the menu. Prevent the anchor's default so jsdom
    // doesn't emit a "navigation not implemented" warning — the React onClick
    // (which closes the menu) still fires.
    const servicesLink = within(menu!).getByRole("link", { name: /services/i });
    servicesLink.addEventListener("click", (e) => e.preventDefault());
    fireEvent.click(servicesLink);
    expect(document.getElementById("mobile-menu")).toBeNull();
  });
});
