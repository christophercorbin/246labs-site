import { describe, it, expect, beforeEach } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { POST } from "@/app/api/contact/route";

const sesMock = mockClient(SESClient);

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  sesMock.reset();
  process.env.SES_REGION = "us-east-1";
  process.env.SES_SENDER = "no-reply@246labs.cloud";
  process.env.SES_RECIPIENT = "hello@246labs.cloud";
});

describe("POST /api/contact", () => {
  it("sends email and returns 200 on valid input", async () => {
    sesMock.on(SendEmailCommand).resolves({ MessageId: "abc" });
    const res = await post({
      name: "Ada",
      email: "ada@example.com",
      message: "I would like to discuss a project.",
    });
    expect(res.status).toBe(200);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(1);
  });

  it("returns 400 with errors on invalid input and sends nothing", async () => {
    const res = await post({ name: "", email: "bad", message: "hi" });
    expect(res.status).toBe(400);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
  });

  it("silently accepts honeypot spam without sending", async () => {
    const res = await post({
      name: "Ada",
      email: "ada@example.com",
      message: "totally real message here",
      website: "http://spam.example",
    });
    expect(res.status).toBe(200);
    expect(sesMock.commandCalls(SendEmailCommand)).toHaveLength(0);
  });

  it("returns 502 when SES fails", async () => {
    sesMock.on(SendEmailCommand).rejects(new Error("SES down"));
    const res = await post({
      name: "Ada",
      email: "ada@example.com",
      message: "I would like to discuss a project.",
    });
    expect(res.status).toBe(502);
  });
});
