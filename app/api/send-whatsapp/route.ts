import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();
    const msg = await client.messages.create({
      body: message,
      from: 'whatsapp:+14155238886', // Twilio Sandbox WhatsApp number
      to: `whatsapp:${to}`,
    });
    return NextResponse.json({ success: true, sid: msg.sid });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
