import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { WorkCard } from "@/components/WorkCard";

const work = {
  name: "SumDeTing",
  blurb: "An AI math tutor.",
  href: "https://sumdeting.246labs.cloud",
};

describe("WorkCard", () => {
  it("links out with the name, blurb, and a thumbnail zone", () => {
    const { container } = render(<WorkCard work={work} />);
    const link = screen.getByRole("link", { name: /SumDeTing/i });
    expect(link).toHaveAttribute("href", "https://sumdeting.246labs.cloud");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("An AI math tutor.")).toBeInTheDocument();
    // Thumbnail zone present (data-attr marks the image-ready block).
    expect(container.querySelector('[data-work-thumb]')).not.toBeNull();
  });
});
