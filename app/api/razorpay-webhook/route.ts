import { NextRequest } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";

// Razorpay signs the webhook body with the Webhook Secret (set in Razorpay dashboard).
// This is DIFFERENT from the API key secret.
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  // 1. Verify signature — reject anything that doesn't match
  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (
    !signature ||
    !crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(signature, "hex")
    )
  ) {
    console.warn("[webhook] Invalid signature — request rejected.");
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  // 2. Parse event
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventType = event.event as string;

  // 3. Handle payment.captured — mark order as success
  if (eventType === "payment.captured") {
    const payment = (
      event.payload as { payment: { entity: Record<string, string> } }
    ).payload.payment.entity;

    const razorpay_order_id = payment.order_id;
    const razorpay_payment_id = payment.id;

    try {
      const db = getAdminDb();
      const snap = await db
        .collection("orders")
        .where("payment.razorpay_order_id", "==", razorpay_order_id)
        .limit(1)
        .get();

      if (!snap.empty) {
        await snap.docs[0].ref.update({
          "payment.razorpay_payment_id": razorpay_payment_id,
          "payment.status": "success",
        });
        console.log(
          `[webhook] Order ${snap.docs[0].id} marked success — payment ${razorpay_payment_id}`
        );
      } else {
        console.warn(
          `[webhook] No Firestore order found for razorpay_order_id: ${razorpay_order_id}`
        );
      }
    } catch (err) {
      console.error("[webhook] Firestore update failed:", err);
      return Response.json({ error: "DB update failed." }, { status: 500 });
    }
  }

  // 4. Handle payment.failed — mark order as failed
  if (eventType === "payment.failed") {
    const payment = (
      event.payload as { payment: { entity: Record<string, string> } }
    ).payload.payment.entity;

    const razorpay_order_id = payment.order_id;

    try {
      const db = getAdminDb();
      const snap = await db
        .collection("orders")
        .where("payment.razorpay_order_id", "==", razorpay_order_id)
        .limit(1)
        .get();

      if (!snap.empty) {
        await snap.docs[0].ref.update({ "payment.status": "failed" });
        console.log(`[webhook] Order ${snap.docs[0].id} marked failed.`);
      }
    } catch (err) {
      console.error("[webhook] Firestore update failed:", err);
      return Response.json({ error: "DB update failed." }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
