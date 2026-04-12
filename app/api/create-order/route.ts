import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import * as admin from "firebase-admin";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { createQikinkOrder, QikinkOrderItem } from "@/lib/qikink";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, items, user, address, paymentMethod } = body;

    if (
      typeof amount !== "number" ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      return Response.json(
        { error: "Invalid amount. Must be a positive integer in paise." },
        { status: 400 }
      );
    }

    // ── Identity derivation ──
    let resolvedUserId: string | null = null;
    let resolvedEmail: string         = user?.email ?? "";

    const authHeader = request.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.slice(7);
      try {
        const decoded = await getAdminAuth().verifyIdToken(idToken);
        resolvedUserId = decoded.uid;
        if (decoded.email) resolvedEmail = decoded.email;
      } catch {
        return Response.json(
          { error: "Authentication failed. Please login again." },
          { status: 401 }
        );
      }
    }

    const db = getAdminDb();
    const isCOD = paymentMethod === "cod";

    // ── COD flow: skip Razorpay entirely ──
    if (isCOD) {
      // Server-side guard: reject COD if disabled
      if (process.env.ENABLE_COD !== "true") {
        return Response.json(
          { error: "Cash on Delivery is not available." },
          { status: 400 },
        );
      }

      // COD max order limit
      const codMax = parseInt(process.env.ENABLE_COD_MAX_ORDER ?? "0", 10) || 0;
      if (codMax > 0 && amount / 100 > codMax) {
        return Response.json(
          { error: `COD is available only for orders up to ₹${codMax}.` },
          { status: 400 },
        );
      }
      const orderRef = await db.collection("orders").add({
        items: items ?? [],
        totalAmount: amount / 100,
        userId: resolvedUserId,
        user: {
          ...(user ?? {}),
          email: resolvedEmail,
        },
        address: address ?? {},
        payment: {
          method: "cod",
          status: "pending",
        },
        status: "placed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[create-order] COD order ${orderRef.id} created.`);

      // Trigger Qikink immediately for COD (fire-and-forget)
      sendCODToQikink(db, orderRef.id).catch((err) =>
        console.error("[create-order] Qikink COD error:", err),
      );

      return Response.json({
        firestore_order_id: orderRef.id,
        payment_method: "cod",
      });
    }

    // ── Razorpay flow (unchanged) ──
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `knytra_${Date.now()}`,
    });

    const orderRef = await db.collection("orders").add({
      items: items ?? [],
      totalAmount: amount / 100,
      userId: resolvedUserId,
      user: {
        ...(user ?? {}),
        email: resolvedEmail,
      },
      address: address ?? {},
      payment: {
        razorpay_order_id: order.id,
        razorpay_payment_id: "",
        status: "pending",
      },
      status: "placed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return Response.json({
      razorpay_order_id: order.id,
      firestore_order_id: orderRef.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    console.error("[create-order] error:", error);
    return Response.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
}

// ── Qikink push for COD orders ──

async function sendCODToQikink(
  db: FirebaseFirestore.Firestore,
  orderId: string,
) {
  const orderSnap = await db.collection("orders").doc(orderId).get();
  if (!orderSnap.exists) return;

  const order = orderSnap.data()!;
  if (order.qikinkOrderId) return; // already pushed

  // Guard: skip if no items or no shipping address
  const orderItems = order.items ?? [];
  const addr = order.address ?? {};
  if (orderItems.length === 0 || !addr.fullAddress) {
    console.warn(`[qikink-cod] Skipping ${orderId}: empty items or missing address`);
    return;
  }

  const user = order.user ?? {};
  const qikinkItems: QikinkOrderItem[] = orderItems.map(
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
    items: qikinkItems,
  });

  await db.collection("orders").doc(orderId).update({
    qikinkOrderId: result.qikinkOrderId ?? null,
    qikinkStatus: result.qikinkStatus,
    qikinkResponse: result.qikinkResponse ?? null,
    ...(result.qikinkError ? { qikinkError: result.qikinkError } : {}),
  });

  console.log(`[qikink-cod] ${orderId}: ${result.qikinkStatus}`);
}
