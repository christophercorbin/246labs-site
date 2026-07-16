import { render, screen } from "@testing-library/react";
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
    // back link
    expect(screen.getByRole("link", { name: /Work/i })).toHaveAttribute("href", "/#work");
  });

  it("omits the metrics band when no metrics are set", async () => {
    const { container } = render(
      await WorkDetailPage({ params: Promise.resolve({ slug: "sumdeting" }) }),
    );
    expect(container.querySelector("[data-metrics]")).toBeNull();
  });

  it("404s on an unknown slug", async () => {
    await expect(
      WorkDetailPage({ params: Promise.resolve({ slug: "nope" }) }),
    ).rejects.toThrow();
  });
});
