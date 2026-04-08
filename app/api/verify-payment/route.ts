import { NextRequest } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, firestore_order_id } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !firestore_order_id) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Verify signature: HMAC(order_id + "|" + payment_id, key_secret)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(razorpay_signature, "hex")
    );

    if (!isValid) {
      console.warn("[verify-payment] Invalid signature — possible tampered request.");
      return Response.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    // 2. Update Firestore order immediately (webhook is fallback)
    const db = getAdminDb();
    await db.collection("orders").doc(firestore_order_id).update({
      "payment.razorpay_payment_id": razorpay_payment_id,
      "payment.status": "success",
    });

    console.log(`[verify-payment] Order ${firestore_order_id} marked success.`);
    return Response.json({ success: true });
  } catch (error: unknown) {
    console.error("[verify-payment] Error:", error);
    return Response.json({ error: "Verification failed." }, { status: 500 });
  }
}
