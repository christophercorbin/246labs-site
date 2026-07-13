import { render } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import { Analytics } from "@/components/Analytics";

const OLD = { ...process.env };
afterEach(() => { process.env = { ...OLD }; });

describe("Analytics", () => {
  it("renders nothing when env is not configured", () => {
    delete process.env.NEXT_PUBLIC_MATOMO_URL;
    delete process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
    const { container } = render(<Analytics />);
    expect(container.querySelector("script")).toBeNull();
  });

  it("renders a cookieless Matomo snippet when configured", () => {
    process.env.NEXT_PUBLIC_MATOMO_URL = "https://analytics.246labs.cloud";
    process.env.NEXT_PUBLIC_MATOMO_SITE_ID = "1";
    const { container } = render(<Analytics />);
    const script = container.querySelector("script");
    expect(script).not.toBeNull();
    const js = script?.innerHTML ?? "";
    expect(js).toContain("disableCookies");
    expect(js).toContain("analytics.246labs.cloud");
    expect(js).toContain("matomo.php");
  });
});
