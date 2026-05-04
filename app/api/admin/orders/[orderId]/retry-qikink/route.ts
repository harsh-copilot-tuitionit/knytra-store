import { NextRequest } from "next/server";
import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { sendToQikink } from "@/lib/qikink-fulfillment";

function isAdmin(request: NextRequest): boolean {
  return getSessionFromRequest(request.cookies) !== null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { orderId } = await params;
  if (!orderId) {
    return Response.json({ error: "Missing orderId." }, { status: 400 });
  }

  const db = getAdminDb();
  const orderRef = db.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    return Response.json({ error: "Order not found." }, { status: 404 });
  }

  const order = orderSnap.data()!;
  if (order.qikinkOrderId) {
    return Response.json({ error: "Qikink order already exists" }, { status: 409 });
  }

  try {
    const result = await sendToQikink(db, orderId);
    return Response.json({
      success: result?.success ?? false,
      qikinkStatus: result?.qikinkStatus ?? null,
      qikinkOrderId: result?.qikinkOrderId ?? null,
      qikinkError: result?.qikinkError ?? null,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await orderRef.update({
      qikinkStatus: "failed",
      qikinkError: errorMessage,
      qikinkFailedAt: admin.firestore.FieldValue.serverTimestamp(),
      qikinkLastFailedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return Response.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
