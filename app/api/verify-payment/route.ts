import { NextRequest } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { createQikinkOrder, QikinkOrderItem } from "@/lib/qikink";

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

  const user = order.user ?? {};
  const items: QikinkOrderItem[] = orderItems.map(
    (item: { name?: string; size?: string; quantity?: number }) => ({
      product_name: item.name ?? "",
      variant: item.size ?? "",
      quantity: item.quantity ?? 1,
    }),
  );

  const result = await createQikinkOrder({
    order_id: orderId,
    customer_name: user.name ?? addr.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? addr.phone ?? "",
    shipping_address: {
      address_line1: addr.fullAddress ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      pincode: addr.pincode ?? "",
      country: "India",
    },
    items,
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
