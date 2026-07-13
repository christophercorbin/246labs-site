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
    expect(container.querySelector("[data-work-thumb]")).not.toBeNull();
  });

  it("shows the gradient placeholder (no <img>) when no image is set", () => {
    const { container } = render(<WorkCard work={work} />);
    const thumb = container.querySelector("[data-work-thumb]")!;
    expect(thumb.querySelector("img")).toBeNull();
    // Product name shown as the placeholder label inside the thumb.
    expect(thumb.textContent).toContain("SumDeTing");
  });

  it("renders a screenshot image with alt text when image is set", () => {
    const { container } = render(
      <WorkCard work={{ ...work, image: "/work/sumdeting.webp" }} />,
    );
    const thumb = container.querySelector("[data-work-thumb]")!;
    const img = thumb.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "SumDeTing screenshot");
    // Fill layout requires a positioned container.
    expect(thumb.className).toContain("relative");
  });
});
