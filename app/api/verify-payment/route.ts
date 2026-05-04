import { NextRequest } from "next/server";
import crypto from "crypto";
import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendOrderConfirmationWhatsApp } from "@/lib/twilio";
import { sendToQikink } from "@/lib/qikink-fulfillment";

export async function POST(request: NextRequest) {
  try {
    console.log("STEP 1: verify-payment HIT");

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

    console.log("STEP 2: Payment verified successfully");

    // 2. Update Firestore order immediately (webhook is fallback)
    const db = getAdminDb();
    await db.collection("orders").doc(firestore_order_id).update({
      "payment.razorpay_payment_id": razorpay_payment_id,
      "payment.status": "success",
    });

    console.log(`[verify-payment] Order ${firestore_order_id} marked success.`);

    // 2a. Send WhatsApp order confirmation after successful payment
    try {
      const orderSnap = await db.collection("orders").doc(firestore_order_id).get();
      if (orderSnap.exists) {
        const order = orderSnap.data()!;
        const phone = order.user?.phone || order.address?.phone;
        const customerName = order.user?.name || order.address?.name || "there";
        const total = order.total ?? order.amount ?? null;

        console.log("STEP 3: Order data:", {
          id: orderSnap.id,
          phone,
          name: customerName,
          total,
        });

        if (order.whatsappNotification?.sent) {
          console.log("STEP X: WhatsApp already sent, skipping");
        } else if (phone) {
          console.log("STEP 4: Calling sendOrderConfirmationWhatsApp...");

          const origin = new URL(request.url).origin;
          const callbackUrl = new URL(
            `/api/whatsapp-status-callback?orderId=${firestore_order_id}`,
            origin,
          ).toString();

          const amountValue = order.totalAmount ?? (typeof order.amount === "number" ? order.amount / 100 : null) ?? 0;

          const result = await sendOrderConfirmationWhatsApp({
            phone,
            name: customerName,
            orderId: orderSnap.id,
            amount: amountValue,
            statusCallback: callbackUrl,
          });

          await db.collection("orders").doc(firestore_order_id).update({
            whatsappNotification: {
              sent: true,
              sid: result.sid,
              status: result.status,
              error: null,
              attemptedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          });
        } else {
          console.log("STEP 4: No phone available, skipping WhatsApp send");
          await db.collection("orders").doc(firestore_order_id).update({
            whatsappNotification: {
              sent: false,
              sid: null,
              status: null,
              error: "No phone number available for WhatsApp.",
              attemptedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          });
        }
      }
    } catch (err: unknown) {
      console.error("[verify-payment] WhatsApp notification error:", err);
      await db.collection("orders").doc(firestore_order_id).update({
        whatsappNotification: {
          sent: false,
          sid: null,
          status: null,
          error: err instanceof Error ? err.message : String(err),
          attemptedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      });
    }

    // 3. Send order to Qikink and wait for completion.
    // Payment remains successful even if Qikink fails.
    try {
      await sendToQikink(db, firestore_order_id);
    } catch (err) {
      console.error("[verify-payment] Qikink fulfillment error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      await db.collection("orders").doc(firestore_order_id).update({
        qikinkStatus: "failed",
        qikinkError: errorMessage,
        qikinkFailedAt: admin.firestore.FieldValue.serverTimestamp(),
        qikinkLastFailedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return Response.json({ success: true });
  } catch (error: unknown) {
    console.error("[verify-payment] Error:", error);
    return Response.json({ error: "Verification failed." }, { status: 500 });
  }
}

