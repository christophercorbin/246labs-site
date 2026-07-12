import { describe, it, expect } from "vitest";
import { metadata as home } from "@/app/page";
import { metadata as services } from "@/app/services/page";
import { metadata as about } from "@/app/about/page";
import { metadata as contact } from "@/app/contact/page";
import { metadata as root } from "@/app/layout";

describe("page metadata", () => {
  it("every page declares its canonical path", () => {
    expect(home.alternates?.canonical).toBe("/");
    expect(services.alternates?.canonical).toBe("/services");
    expect(about.alternates?.canonical).toBe("/about");
    expect(contact.alternates?.canonical).toBe("/contact");
  });

  it("root declares openGraph and twitter card", () => {
    expect(root.openGraph?.siteName).toBe("246Labs");
    expect(root.twitter?.card).toBe("summary_large_image");
  });
});
