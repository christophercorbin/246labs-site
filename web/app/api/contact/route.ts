import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { validateContact, isHoneypotTripped } from "@/lib/contact-schema";

export const runtime = "nodejs";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, errors: { form: "Invalid request." } }, 400);
  }

  // Honeypot: pretend success, send nothing.
  if (isHoneypotTripped(payload)) return json({ ok: true }, 200);

  const result = validateContact(payload);
  if (!result.ok) return json({ ok: false, errors: result.errors }, 400);

  const { name, email, company, message } = result.data;
  const region = process.env.SES_REGION;
  const sender = process.env.SES_SENDER;
  const recipient = process.env.SES_RECIPIENT;
  if (!region || !sender || !recipient) {
    console.error("Contact route missing SES_* env vars");
    return json({ ok: false, errors: { form: "Server not configured." } }, 500);
  }

  const client = new SESClient({ region });
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    "",
    message,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    await client.send(
      new SendEmailCommand({
        Source: sender,
        Destination: { ToAddresses: [recipient] },
        ReplyToAddresses: [email],
        Message: {
          Subject: { Data: `New 246Labs enquiry from ${name}` },
          Body: { Text: { Data: body } },
        },
      }),
    );
  } catch (err) {
    console.error("SES send failed", err);
    return json({ ok: false, errors: { form: "Could not send. Try again." } }, 502);
  }

  return json({ ok: true }, 200);
}
