import { NextRequest } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const amount: unknown = body?.amount;

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

    const order = await razorpay.orders.create({
      amount,                 // in paise, e.g. ₹249.90 → 24990
      currency: "INR",
      receipt: `knytra_${Date.now()}`,
    });

    return Response.json({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    console.error("[create-order] Razorpay error:", error);
    return Response.json(
      { error: "Failed to create Razorpay order." },
      { status: 500 }
    );
  }
}
