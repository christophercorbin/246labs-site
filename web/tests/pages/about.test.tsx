import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/about/page";

describe("About page", () => {
  it("keeps the Built on AWS badge and descriptor line", () => {
    render(<About />);
    expect(screen.getByText(/Built on AWS/i)).toBeInTheDocument();
    expect(
      screen.getByText(/CONSULTING · DEVOPS · WEB APPS · HOSTING/i),
    ).toBeInTheDocument();
  });

  it("names the founder and points to real work as proof", () => {
    render(<About />);
    expect(screen.getByText(/Christopher Corbin/)).toBeInTheDocument();
    expect(screen.getByText(/Founder & Principal Engineer/i)).toBeInTheDocument();
    const sumdeting = screen.getByRole("link", { name: /SumDeTing/i });
    expect(sumdeting).toHaveAttribute("href", "https://sumdeting.246labs.cloud");
  });

  it("closes with a call to action into contact and work", () => {
    render(<About />);
    expect(
      screen.getByRole("link", { name: /start a project/i }),
    ).toHaveAttribute("href", "/contact");
    expect(
      screen.getByRole("link", { name: /see our work/i }),
    ).toHaveAttribute("href", "/#work");
  });
});
