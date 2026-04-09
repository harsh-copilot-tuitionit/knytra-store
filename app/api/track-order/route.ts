import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

// Normalise phone: strip spaces, dashes, parentheses, leading +91
function normalisePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "").replace(/^\+91/, "").replace(/^91(\d{10})$/, "$1");
}

export async function POST(request: NextRequest) {
  let body: { orderId?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { orderId, phone } = body;

  if (!orderId || !phone) {
    return Response.json({ error: "Order ID and phone are required." }, { status: 400 });
  }

  // Basic length guards — reject obviously invalid input early
  if (orderId.length > 64 || phone.length > 20) {
    return Response.json({ error: "Invalid input." }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("orders").doc(orderId.trim()).get();

    if (!snap.exists) {
      // Return same error as auth failure — don't reveal whether order exists
      return Response.json({ error: "Order not found or details do not match." }, { status: 404 });
    }

    const d = snap.data()!;
    const storedPhone: string = d.user?.phone ?? d.address?.phone ?? "";

    if (normalisePhone(storedPhone) !== normalisePhone(phone)) {
      return Response.json({ error: "Order not found or details do not match." }, { status: 404 });
    }

    // Return only the fields needed for tracking — no payment IDs, no full address details
    return Response.json({
      id: snap.id,
      status:      d.status      ?? "placed",
      totalAmount: d.totalAmount ?? 0,
      createdAt:   d.createdAt?.toDate?.()?.toISOString() ?? null,
      items: (d.items ?? []).map((item: Record<string, unknown>) => ({
        name:     item.name,
        size:     item.size,
        quantity: item.quantity,
        price:    item.price,
        image:    item.image,
      })),
      payment: {
        status: d.payment?.status ?? "pending",
      },
      address: {
        city:    d.address?.city    ?? "",
        pincode: d.address?.pincode ?? "",
      },
    });
  } catch (error: unknown) {
    console.error("[track-order] Error:", error);
    return Response.json({ error: "Failed to fetch order." }, { status: 500 });
  }
}
