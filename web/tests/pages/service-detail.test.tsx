import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ServiceDetailPage, { generateStaticParams } from "@/app/services/[slug]/page";
import { SERVICE_GROUPS } from "@/lib/services";

describe("service detail page", () => {
  it("prerenders all six services", () => {
    const slugs = generateStaticParams().map((p) => p.slug).sort();
    expect(slugs).toEqual(SERVICE_GROUPS.map((g) => g.key).sort());
  });

  it("renders the AI page: heading, steps, deliverables, proof, prefilled CTA", async () => {
    render(await ServiceDetailPage({ params: Promise.resolve({ slug: "ai" }) }));
    expect(screen.getByRole("heading", { level: 1, name: "AI" })).toBeInTheDocument();
    expect(screen.getByText(/How we work/i)).toBeInTheDocument();
    expect(screen.getByText(/What you get/i)).toBeInTheDocument();
    // real-product proof
    expect(screen.getByRole("link", { name: /SumDeTing/i })).toHaveAttribute(
      "href",
      "/work/sumdeting",
    );
    // CTA carries the service into contact
    expect(screen.getByRole("link", { name: /Start an AI project/i })).toHaveAttribute(
      "href",
      "/contact?service=ai",
    );
    // back link
    expect(screen.getByRole("link", { name: /Services/i })).toHaveAttribute("href", "/services");
  });

  it("shows the proofNote for a service with no related product (cloud)", async () => {
    render(await ServiceDetailPage({ params: Promise.resolve({ slug: "cloud" }) }));
    expect(screen.getByText(/We run our own practice before we sell it/i)).toBeInTheDocument();
  });

  it("404s on an unknown slug", async () => {
    await expect(
      ServiceDetailPage({ params: Promise.resolve({ slug: "nope" }) }),
    ).rejects.toThrow();
  });
});
