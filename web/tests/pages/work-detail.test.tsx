import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import WorkDetailPage, { generateStaticParams } from "@/app/work/[slug]/page";
import { SELECTED_WORK } from "@/lib/work";

describe("work detail page", () => {
  it("prerenders all work items", () => {
    const slugs = generateStaticParams().map((p) => p.slug).sort();
    expect(slugs).toEqual(SELECTED_WORK.map((w) => w.slug).sort());
  });

  it("renders SumDeTing: heading, problem, what-we-built, live link, related services", async () => {
    render(await WorkDetailPage({ params: Promise.resolve({ slug: "sumdeting" }) }));
    expect(
      screen.getByRole("heading", { level: 1, name: "SumDeTing" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/The problem/i)).toBeInTheDocument();
    expect(screen.getByText(/What we built/i)).toBeInTheDocument();
    // live product link (external)
    expect(screen.getByRole("link", { name: /Visit it live/i })).toHaveAttribute(
      "href",
      "https://sumdeting.246labs.cloud",
    );
    // related service cross-link
    expect(screen.getByRole("link", { name: /^AI$/ })).toHaveAttribute(
      "href",
      "/services/ai",
    );
    // outcome section
    expect(screen.getByText(/The result/i)).toBeInTheDocument();
    // back link
    expect(screen.getByRole("link", { name: /Work/i })).toHaveAttribute("href", "/#work");
  });

  it("shows the product itself: hero screenshot with a descriptive alt", async () => {
    const { container } = render(
      await WorkDetailPage({ params: Promise.resolve({ slug: "sumdeting" }) }),
    );
    const hero = container.querySelector("[data-work-hero-image] img");
    expect(hero).not.toBeNull();
    expect(hero).toHaveAttribute("alt", expect.stringMatching(/SumDeTing/));
  });

  it("offers a lower-friction call alongside the project CTA", async () => {
    render(await WorkDetailPage({ params: Promise.resolve({ slug: "sumdeting" }) }));
    const calls = screen.getAllByRole("link", { name: /Book a call/i });
    expect(calls.length).toBeGreaterThanOrEqual(1);
    for (const c of calls) expect(c).toHaveAttribute("href", expect.stringContaining("cal.com"));
    expect(screen.getByRole("link", { name: /Start a project/i })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("renders an at-a-glance facts band from work.metrics", async () => {
    const { container } = render(
      await WorkDetailPage({ params: Promise.resolve({ slug: "sumdeting" }) }),
    );
    const band = container.querySelector("[data-metrics]");
    expect(band).not.toBeNull();
    const sumdeting = SELECTED_WORK.find((w) => w.slug === "sumdeting")!;
    expect(band!.querySelectorAll("dt")).toHaveLength(sumdeting.metrics!.length);
    expect(within(band as HTMLElement).getByText("Socratic")).toBeInTheDocument();
  });

  it("404s on an unknown slug", async () => {
    await expect(
      WorkDetailPage({ params: Promise.resolve({ slug: "nope" }) }),
    ).rejects.toThrow();
  });
});
