import { NextRequest } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { createQikinkOrder, QikinkLineItem, QikinkShippingAddress } from "@/lib/qikink";

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

    // 2a. Send WhatsApp order confirmation after successful payment
    try {
      const orderSnap = await db.collection("orders").doc(firestore_order_id).get();
      if (orderSnap.exists) {
        const order = orderSnap.data()!;
        const phone = order.user?.phone || order.address?.phone;
        const customerName = order.user?.name || order.address?.name || "there";

        if (phone) {
          const origin = new URL(request.url).origin;
          const callbackUrl = new URL(
            `/api/whatsapp-status-callback?orderId=${firestore_order_id}`,
            origin,
          ).toString();

          const result = await sendWhatsAppMessage({
            to: phone.startsWith("+") ? phone : `+91${phone}`,
            body: `Hi ${customerName}, your payment is confirmed and your KNYTRA order is now placed. Order ID: ${firestore_order_id}.`,
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

    // 3. Send order to Qikink (non-blocking — failures don't break payment flow)
    sendToQikink(db, firestore_order_id).catch((err) =>
      console.error("[verify-payment] Qikink background error:", err),
    );

    return Response.json({ success: true });
  } catch (error: unknown) {
    console.error("[verify-payment] Error:", error);
    return Response.json({ error: "Verification failed." }, { status: 500 });
  }
}

// ── Qikink fulfilment helper (fire-and-forget) ──────────

async function sendToQikink(
  db: FirebaseFirestore.Firestore,
  orderId: string,
) {
  const orderSnap = await db.collection("orders").doc(orderId).get();
  if (!orderSnap.exists) {
    console.warn("[qikink] Order not found:", orderId);
    return;
  }

  const order = orderSnap.data()!;

  // Retry safety — skip if already pushed
  if (order.qikinkOrderId) {
    console.log("[qikink] Already pushed, skipping:", orderId);
    return;
  }

  // Guard: skip if no items or no shipping address
  const orderItems = order.items ?? [];
  const addr = order.address ?? {};
  if (orderItems.length === 0 || !addr.fullAddress) {
    console.warn(`[qikink] Skipping ${orderId}: empty items or missing address`);
    return;
  }

  // Map order items → Qikink line_items
  // Products created on Qikink dashboard use search_from_my_products=1 + SKU
  const line_items: QikinkLineItem[] = orderItems.map(
    (item: { qikinkSku?: string; sku?: string; name?: string; size?: string; price?: number; quantity?: number }) => ({
      search_from_my_products: 1 as const,
      quantity: String(item.quantity ?? 1),
      price: String(item.price ?? 0),
      sku: item.qikinkSku ?? item.sku ?? "",
    }),
  );

  // Parse name into first/last
  const fullName = order.user?.name ?? addr.name ?? "";
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || undefined;

  const shipping_address: QikinkShippingAddress = {
    first_name: firstName,
    last_name: lastName,
    address1: addr.fullAddress ?? "",
    phone: order.user?.phone ?? addr.phone ?? "",
    email: order.user?.email ?? "",
    city: addr.city ?? "",
    zip: addr.pincode ?? "",
    province: addr.state ?? "",
    country_code: "IN",
  };

  const result = await createQikinkOrder({
    order_number: orderId.slice(0, 15),
    qikink_shipping: "1",
    gateway: "Prepaid",
    total_order_value: String(order.total ?? 0),
    line_items,
    shipping_address,
  });

  // Persist Qikink result to Firestore
  await db
    .collection("orders")
    .doc(orderId)
    .update({
      qikinkOrderId: result.qikinkOrderId ?? null,
      qikinkStatus: result.qikinkStatus,
      qikinkResponse: result.qikinkResponse ?? null,
      ...(result.qikinkError ? { qikinkError: result.qikinkError } : {}),
    });

  console.log(
    `[qikink] Order ${orderId}: ${result.qikinkStatus}`,
    result.qikinkOrderId ?? result.qikinkError ?? "",
  );
}
