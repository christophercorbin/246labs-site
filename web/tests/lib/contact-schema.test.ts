import { describe, it, expect } from "vitest";
import { validateContact, isHoneypotTripped } from "@/lib/contact-schema";

describe("validateContact", () => {
  it("accepts a valid submission", () => {
    const r = validateContact({
      name: "Ada",
      email: "ada@example.com",
      message: "Hello there, I need help.",
    });
    expect(r.ok).toBe(true);
  });

  it("rejects missing name, bad email, and short message", () => {
    const r = validateContact({ name: "", email: "nope", message: "hi" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.name).toBeTruthy();
      expect(r.errors.email).toBeTruthy();
      expect(r.errors.message).toBeTruthy();
    }
  });

  it("rejects non-object input", () => {
    expect(validateContact(null).ok).toBe(false);
  });
});

describe("isHoneypotTripped", () => {
  it("is true when the website field is filled", () => {
    expect(isHoneypotTripped({ website: "http://spam" })).toBe(true);
  });
  it("is false when empty/absent", () => {
    expect(isHoneypotTripped({})).toBe(false);
  });
});
