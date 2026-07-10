import { describe, it, expect } from "vitest";
import { SERVICE_GROUPS } from "@/lib/services";

describe("SERVICE_GROUPS", () => {
  it("defines the six service areas with unique keys and non-empty items", () => {
    expect(SERVICE_GROUPS).toHaveLength(6);
    const keys = SERVICE_GROUPS.map((g) => g.key);
    expect(new Set(keys).size).toBe(6);
    for (const g of SERVICE_GROUPS) {
      expect(g.items.length).toBeGreaterThan(0);
    }
    expect(keys).toContain("ai");
    expect(keys).toContain("assurance");
  });
});
