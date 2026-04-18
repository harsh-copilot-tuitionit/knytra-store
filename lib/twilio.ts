import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
const orderConfirmationContentSid =
  process.env.TWILIO_ORDER_CONFIRMATION_CONTENT_SID ??
  "HX5b6ffc9e91fb3883fc1ce250f376e7f6";

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

export function getOrderConfirmationContentSid() {
  if (!orderConfirmationContentSid) {
    throw new Error("Twilio WhatsApp order confirmation template SID is not configured. Set TWILIO_ORDER_CONFIRMATION_CONTENT_SID.");
  }
  return orderConfirmationContentSid;
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

function formatAmount(amount: number | string | null | undefined) {
  if (amount == null || amount === "") {
    return "₹0.00";
  }

  const numericAmount = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(numericAmount)) {
    return "₹0.00";
  }

  return `₹${numericAmount.toFixed(2)}`;
}

export async function sendOrderConfirmationWhatsApp({
  phone,
  name,
  orderId,
  amount,
  statusCallback,
}: {
  phone: string;
  name: string;
  orderId: string;
  amount: number | string;
  statusCallback?: string;
}) {
  console.log("STEP 5: WhatsApp function START");
  console.log("STEP 6: Raw phone:", phone);
  const formattedPhone = formatPhone(phone);
  const templateSid = getOrderConfirmationContentSid();
  const templateVariables = {
    "1": name,
    "2": orderId,
    "3": String(amount),
  };

  console.log("STEP 7: Formatted phone:", formattedPhone);
  console.log("STEP 8: Sending request to Twilio...");
  console.log("STEP 10: ENV CHECK", {
    sid: accountSid ? "OK" : "MISSING",
    token: authToken ? "OK" : "MISSING",
    from: whatsappFrom ? "OK" : "MISSING",
    contentSid: templateSid ? "OK" : "MISSING",
  });
  console.log("STEP 11: Template SID:", templateSid);
  console.log("STEP 12: Template variables:", templateVariables);

  const client = getTwilioClient();

  try {
    const message = await client.messages.create({
      from: getWhatsAppFromNumber(),
      to: formattedPhone,
      contentSid: templateSid,
      contentVariables: JSON.stringify(templateVariables),
      statusCallback,
    } as any);

    console.log("STEP 9: Twilio SUCCESS:", message.sid);

    return {
      sid: message.sid,
      status: message.status ?? null,
    };
  } catch (err: unknown) {
    const errorData = {
      message: err instanceof Error ? err.message : String(err),
      code: (err as any)?.code ?? null,
    };
    console.error("STEP 9: Twilio ERROR:", errorData);
    throw err;
  }
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
    sid: accountSid ? "OK" : "MISSING",
    token: authToken ? "OK" : "MISSING",
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
