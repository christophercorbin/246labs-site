import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { JsonLd } from "@/components/JsonLd";

describe("sitemap", () => {
  it("lists the static routes and every service detail page on the canonical host", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toEqual([
      "https://246labs.cloud",
      "https://246labs.cloud/services",
      "https://246labs.cloud/about",
      "https://246labs.cloud/contact",
      "https://246labs.cloud/privacy",
      "https://246labs.cloud/services/ai",
      "https://246labs.cloud/services/build",
      "https://246labs.cloud/services/run",
      "https://246labs.cloud/services/cloud",
      "https://246labs.cloud/services/assurance",
      "https://246labs.cloud/services/hardware",
    ]);
  });
});

describe("robots", () => {
  it("allows all and points at the sitemap", () => {
    const r = robots();
    expect(r.sitemap).toBe("https://246labs.cloud/sitemap.xml");
    expect(r.rules).toEqual({ userAgent: "*", allow: "/" });
  });
});

describe("JSON-LD", () => {
  it("renders ProfessionalService structured data", () => {
    const { container } = render(<JsonLd />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent || "{}");
    expect(data["@type"]).toBe("ProfessionalService");
    expect(data.name).toBe("246Labs");
    expect(data.email).toBe("hello@246labs.cloud");
    expect(data.sameAs).toContain("https://github.com/christophercorbin/246labs-site");
  });
});
