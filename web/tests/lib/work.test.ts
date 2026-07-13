import { describe, it, expect } from "vitest";
import { SELECTED_WORK } from "@/lib/work";

describe("SELECTED_WORK", () => {
  it("lists the three real products with https links and no stale domain", () => {
    expect(SELECTED_WORK).toHaveLength(3);
    const names = SELECTED_WORK.map((w) => w.name);
    expect(names).toEqual(["SumDeTing", "Bim Weather", "CargoLink Barbados"]);
    for (const w of SELECTED_WORK) {
      expect(w.href.startsWith("https://")).toBe(true);
      expect(w.blurb.length).toBeGreaterThan(0);
      expect(w.href).not.toContain("cargolink.com");
    }
    const sumdeting = SELECTED_WORK[0];
    expect(sumdeting.href).toBe("https://sumdeting.246labs.cloud");
    expect(sumdeting.blurb).toMatch(/Bedrock|Claude/);
  });
});
