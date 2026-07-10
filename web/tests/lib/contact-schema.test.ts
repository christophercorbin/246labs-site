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

  it("returns ok: false for undefined", () => {
    expect(validateContact(undefined).ok).toBe(false);
  });

  it("returns ok: false for array input", () => {
    expect(validateContact([]).ok).toBe(false);
  });

  it("returns ok: false for string input", () => {
    expect(validateContact("nope").ok).toBe(false);
  });

  it("returns ok: false for number input", () => {
    expect(validateContact(42).ok).toBe(false);
  });

  it("documents malformed-input error shape with form key", () => {
    const r = validateContact(null);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.form).toBeTruthy();
    }
  });
});

describe("isHoneypotTripped", () => {
  it("is true when the website field is filled", () => {
    expect(isHoneypotTripped({ website: "http://spam" })).toBe(true);
  });
  it("is false when empty/absent", () => {
    expect(isHoneypotTripped({})).toBe(false);
  });

  it("is false when website is an empty string", () => {
    expect(isHoneypotTripped({ website: "" })).toBe(false);
  });

  it("is false when website is whitespace-only (trimmed to empty)", () => {
    expect(isHoneypotTripped({ website: "   " })).toBe(false);
  });

  it("does not throw and returns false when input is null", () => {
    expect(isHoneypotTripped(null)).toBe(false);
  });

  it("does not throw and returns false when input is undefined", () => {
    expect(isHoneypotTripped(undefined)).toBe(false);
  });
});
