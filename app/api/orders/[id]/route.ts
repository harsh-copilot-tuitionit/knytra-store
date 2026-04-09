import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "Order ID is required." }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const snap = await db.collection("orders").doc(id).get();

    if (!snap.exists) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    const data = snap.data()!;

    // Convert Firestore Timestamp to ISO string for JSON serialisation
    return Response.json({
      id: snap.id,
      items: data.items ?? [],
      totalAmount: data.totalAmount ?? 0,
      user: data.user ?? {},
      address: data.address ?? {},
      payment: data.payment ?? {},
      status: data.status ?? "placed",
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    });
  } catch (error: unknown) {
    console.error("[api/orders] Fetch error:", error);
    return Response.json({ error: "Failed to fetch order." }, { status: 500 });
  }
}
