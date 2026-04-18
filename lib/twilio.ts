import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export async function sendWhatsAppMessage({
  to,
  body,
  statusCallback,
}: {
  to: string;
  body: string;
  statusCallback?: string;
}) {
  const msg = await client.messages.create({
    body,
    from: "whatsapp:+14155238886",
    to: `whatsapp:${to}`,
    statusCallback,
  });

  return {
    sid: msg.sid,
    status: msg.status ?? null,
  };
}
