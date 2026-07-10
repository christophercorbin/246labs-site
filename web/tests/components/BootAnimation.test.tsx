import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BootAnimation } from "@/components/BootAnimation";

describe("BootAnimation", () => {
  it("renders the brand and the tagline", () => {
    render(<BootAnimation />);
    expect(screen.getByRole("img", { name: /246labs/i })).toBeInTheDocument();
    expect(
      screen.getByText(/built in the Caribbean/i),
    ).toBeInTheDocument();
  });
});
