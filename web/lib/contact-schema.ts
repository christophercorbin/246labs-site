export type ContactInput = {
  name: string;
  email: string;
  company?: string;
  message: string;
  website?: string; // honeypot
};

export type ContactResult =
  | { ok: true; data: { name: string; email: string; company: string; message: string } }
  | { ok: false; errors: Record<string, string> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asRecord(input: unknown): Record<string, unknown> | null {
  return typeof input === "object" && input !== null
    ? (input as Record<string, unknown>)
    : null;
}

export function isHoneypotTripped(input: unknown): boolean {
  const r = asRecord(input);
  return !!r && typeof r.website === "string" && r.website.trim().length > 0;
}

export function validateContact(input: unknown): ContactResult {
  const r = asRecord(input);
  if (!r) return { ok: false, errors: { form: "Invalid submission." } };

  const name = typeof r.name === "string" ? r.name.trim() : "";
  const email = typeof r.email === "string" ? r.email.trim() : "";
  const company = typeof r.company === "string" ? r.company.trim() : "";
  const message = typeof r.message === "string" ? r.message.trim() : "";

  const errors: Record<string, string> = {};
  if (name.length < 1) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (message.length < 10)
    errors.message = "Give us a little more detail (10+ characters).";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, email, company, message } };
}
