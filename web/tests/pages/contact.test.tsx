import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContactPage from "@/app/contact/page";

describe("contact page prefill", () => {
  it("prefills the message from a known ?service", async () => {
    render(await ContactPage({ searchParams: Promise.resolve({ service: "ai" }) }));
    expect(screen.getByLabelText(/message/i)).toHaveValue("I'm interested in: AI\n\n");
  });

  it("leaves the message empty for an unknown or absent service", async () => {
    render(await ContactPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByLabelText(/message/i)).toHaveValue("");
  });
});
