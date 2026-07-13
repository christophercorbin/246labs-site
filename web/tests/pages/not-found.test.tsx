import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotFound from "@/app/not-found";

describe("404 page", () => {
  it("shows a branded 404 with a link home", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toHaveAttribute("href", "/");
  });
});
