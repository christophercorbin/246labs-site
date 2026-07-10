"use client";

import { useState } from "react";
import { validateContact } from "@/lib/contact-schema";
import { Button } from "@/components/Button";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const result = validateContact(data);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
        return;
      }
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = undefined;
      }
      if (
        res.status === 400 &&
        body &&
        typeof body === "object" &&
        "errors" in body &&
        typeof (body as { errors?: unknown }).errors === "object" &&
        (body as { errors?: unknown }).errors !== null
      ) {
        setErrors((body as { errors: Record<string, string> }).errors);
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="rounded-tile border border-hairline bg-white p-6 text-ink"
      >
        Thanks — we&apos;ll be in touch shortly.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <Field label="Name" name="name" error={errors.name} />
      <Field label="Email" name="email" type="email" error={errors.email} />
      <Field label="Company" name="company" />
      <div>
        <label htmlFor="message" className="block font-mono text-xs uppercase tracking-label text-muted">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="mt-1 w-full rounded-tile-sm border border-hairline bg-white p-3 text-ink"
        />
        {errors.message && (
          <p role="alert" className="mt-1 text-sm text-traffic-red">{errors.message}</p>
        )}
      </div>
      {status === "error" && (
        <p role="alert" className="text-sm text-traffic-red">
          Something went wrong sending your message. Please try again.
        </p>
      )}
      <Button variant="primary">
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-mono text-xs uppercase tracking-label text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="mt-1 w-full rounded-tile-sm border border-hairline bg-white p-3 text-ink"
      />
      {error && <p role="alert" className="mt-1 text-sm text-traffic-red">{error}</p>}
    </div>
  );
}
