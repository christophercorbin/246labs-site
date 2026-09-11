import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProofPanel } from "@/components/ProofPanel";
import { SELECTED_WORK } from "@/lib/work";

describe("ProofPanel", () => {
  it("counts products from the work catalogue rather than a hard-coded number", () => {
    render(<ProofPanel />);
    expect(screen.getByText(String(SELECTED_WORK.length))).toBeInTheDocument();
    expect(screen.getByText(/products in production/i)).toBeInTheDocument();
  });

  it("carries the boot animation and brand tagline", () => {
    const { container } = render(<ProofPanel />);
    expect(container.querySelector(".boot-tile")).not.toBeNull();
    expect(
      screen.getByText("Cloud infrastructure, built in the Caribbean."),
    ).toBeInTheDocument();
  });

  it("only makes claims the site can back up", () => {
    render(<ProofPanel />);
    // Reply-time claim must match the contact page's promise.
    expect(screen.getByText(/reply on every enquiry/i)).toBeInTheDocument();
    expect(screen.getByText("1 day")).toBeInTheDocument();
  });
});
