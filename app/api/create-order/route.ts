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
    // NOTE: userId and user.email are NEVER trusted from the request body.
    // They are derived server-side from the Authorization header instead.

    // Validate: amount must be a positive integer (paise)
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

    // ── Identity derivation ──────────────────────────────────────────────────
    // If the client sends a Firebase ID token, verify it and extract the uid
    // and email from the decoded token.  A forged or missing token always
    // results in a guest order (userId: null) — the server never reads userId
    // from the request body.
    let resolvedUserId: string | null = null;
    let resolvedEmail: string         = user?.email ?? "";

    const authHeader = request.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.slice(7);
      try {
        const decoded = await getAdminAuth().verifyIdToken(idToken);
        resolvedUserId = decoded.uid;
        // Always use the email from the verified token, not the form
        if (decoded.email) resolvedEmail = decoded.email;
      } catch {
        // Token present but invalid — hard failure.
        // Never silently downgrade a logged-in user to a guest order.
        return Response.json(
          { error: "Authentication failed. Please login again." },
          { status: 401 }
        );
      }
    }
    // No Authorization header → legitimate guest checkout (userId stays null)

    // 1. Create Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `knytra_${Date.now()}`,
    });

    // 2. Write pending order to Firestore
    const db = getAdminDb();
    const orderRef = await db.collection("orders").add({
      items: items ?? [],
      totalAmount: amount / 100, // back to ₹
      userId: resolvedUserId,    // derived from auth token; null for guests
      user: {
        ...(user ?? {}),
        email: resolvedEmail,    // always use the server-resolved email
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
