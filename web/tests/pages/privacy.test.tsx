import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Privacy from "@/app/privacy/page";
import { Footer } from "@/components/Footer";

describe("privacy page", () => {
  it("names what the contact form collects and how to reach us", () => {
    render(<Privacy />);
    expect(screen.getByRole("heading", { level: 1, name: /privacy/i })).toBeInTheDocument();
    expect(screen.getByText(/name, email address, company/i)).toBeInTheDocument();
    expect(screen.getByText(/self-hosted on our own AWS, cookieless/i)).toBeInTheDocument();
  });
});

describe("footer", () => {
  it("links to the privacy policy", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/privacy");
  });
});
