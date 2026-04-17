import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import * as admin from "firebase-admin";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, items, user, address } = body;

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

    // ── Razorpay flow ──
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

    // ── WhatsApp Notification ──
    try {
      const phone = user?.phone || address?.phone;
      if (phone) {
        const whatsappRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/send-whatsapp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: phone.startsWith("+") ? phone : `+91${phone}`,
            message: `Hi ${user?.name || "there"}, your order has been placed! Order ID: ${orderRef.id}. Thank you for shopping with Knytra.`
          })
        });
        // Optionally log or handle whatsappRes
      }
    } catch (err) {
      console.error("[create-order] WhatsApp notification error:", err);
    }

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
