import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import About from "@/app/about/page";

describe("About page", () => {
  it("renders the AWS Partner badge and descriptor line", () => {
    render(<About />);
    expect(screen.getByText(/AWS Partner/i)).toBeInTheDocument();
    expect(screen.getByText(/CONSULTING · DEVOPS · WEB APPS · HOSTING/i)).toBeInTheDocument();
  });
});
