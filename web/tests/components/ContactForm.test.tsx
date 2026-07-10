import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContactForm } from "@/components/ContactForm";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("ContactForm", () => {
  it("shows validation errors and does not fetch when invalid", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    render(<ContactForm />);
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(await screen.findByText(/tell us your name/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("submits and shows success on valid input", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/name/i), "Ada");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(
      screen.getByLabelText(/message/i),
      "I would like to discuss a project.",
    );
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() =>
      expect(screen.getByText(/thanks|got it|we.ll be in touch/i)).toBeInTheDocument(),
    );
  });

  it("surfaces server-side field errors on a 400 response without showing success", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ ok: false, errors: { email: "Enter a valid email address." } }),
        { status: 400 },
      ),
    );
    render(<ContactForm />);
    await userEvent.type(screen.getByLabelText(/name/i), "Ada");
    await userEvent.type(screen.getByLabelText(/email/i), "ada@example.com");
    await userEvent.type(
      screen.getByLabelText(/message/i),
      "I would like to discuss a project.",
    );
    await userEvent.click(screen.getByRole("button", { name: /send/i }));
    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/thanks|got it|we.ll be in touch/i),
    ).not.toBeInTheDocument();
  });
});
