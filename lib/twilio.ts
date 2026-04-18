import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

function getTwilioClient() {
  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials are not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.");
  }
  return twilio(accountSid, authToken);
}

export function getWhatsAppFromNumber() {
  if (!whatsappFrom) {
    throw new Error("WhatsApp sender number is not configured. Set TWILIO_WHATSAPP_FROM to your approved Twilio WhatsApp phone number.");
  }
  return whatsappFrom;
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
  console.log("STEP 5: WhatsApp function START");
  console.log("STEP 6: Raw phone:", to);
  const formattedPhone = formatPhone(to);
  console.log("STEP 7: Formatted phone:", formattedPhone);
  console.log("STEP 8: Sending request to Twilio...");
  console.log("STEP 10: ENV CHECK", {
    sid: process.env.TWILIO_ACCOUNT_SID ? "OK" : "MISSING",
    token: process.env.TWILIO_AUTH_TOKEN ? "OK" : "MISSING",
    from: whatsappFrom ? "OK" : "MISSING",
  });

  const client = getTwilioClient();

  try {
    const message = await client.messages.create({
      body,
      from: getWhatsAppFromNumber(),
      to: formattedPhone,
      statusCallback,
    });

    console.log("STEP 9: Twilio SUCCESS:", message.sid);

    return {
      sid: message.sid,
      status: message.status ?? null,
    };
  } catch (err: unknown) {
    console.error("STEP 9: Twilio ERROR:", err);
    throw err;
  }
}
