import { describe, it, expect } from "vitest";
import { SERVICE_GROUPS } from "@/lib/services";
import { SELECTED_WORK } from "@/lib/work";

describe("SERVICE_GROUPS", () => {
  it("defines six areas with unique keys, items, description, and deliverables", () => {
    expect(SERVICE_GROUPS).toHaveLength(6);
    const keys = SERVICE_GROUPS.map((g) => g.key);
    expect(new Set(keys).size).toBe(6);
    for (const g of SERVICE_GROUPS) {
      expect(g.items.length).toBeGreaterThan(0);
      expect(g.description.length).toBeGreaterThan(0);
      expect(g.deliverables.length).toBeGreaterThan(0);
    }
    expect(keys).toContain("ai");
    expect(keys).toContain("assurance");
  });
});

describe("SERVICE_GROUPS detail content", () => {
  it("gives every group intro, steps, and a CTA label", () => {
    for (const g of SERVICE_GROUPS) {
      expect(g.longIntro.length).toBeGreaterThan(0);
      expect(g.howWeWork.length).toBeGreaterThanOrEqual(3);
      expect(g.ctaLabel.length).toBeGreaterThan(0);
    }
  });

  it("resolves every relatedWork slug to a real product", () => {
    const slugs = new Set(SELECTED_WORK.map((w) => w.slug));
    for (const g of SERVICE_GROUPS) {
      for (const s of g.relatedWork ?? []) {
        expect(slugs.has(s)).toBe(true);
      }
    }
  });
});
