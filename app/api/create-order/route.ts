import { NextRequest } from "next/server";
import Razorpay from "razorpay";
import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, items, user, address } = body;

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
      user: user ?? {},
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
