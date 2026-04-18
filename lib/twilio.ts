import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.");
  }
  return twilio(accountSid, authToken);
}

export function formatPhone(phone: string) {
  let p = phone.replace(/\D/g, "");

  if (p.length === 10) {
    p = "91" + p;
  }

  if (!p.startsWith("91")) {
    p = "91" + p;
  }

  return `whatsapp:+${p}`;
}

export async function sendWhatsAppMessage({
  to,
  body,
  statusCallback,
}: {
  to: string;
  body: string;
  statusCallback?: string;
}) {
  const client = getTwilioClient();
  const msg = await client.messages.create({
    body,
    from: "whatsapp:+14155238886",
    to: formatPhone(to),
    statusCallback,
  });

  return {
    sid: msg.sid,
    status: msg.status ?? null,
  };
}
