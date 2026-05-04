import { NextRequest } from "next/server";
import * as admin from "firebase-admin";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { sendToQikink } from "@/lib/qikink-fulfillment";

async function isAdmin(request: NextRequest): Promise<boolean> {
  // Existing careers-admin session auth path
  if (getSessionFromRequest(request.cookies) !== null) {
    return true;
  }

  // Admin panel Firebase auth path
  const authHeader = request.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return false;
  }

  const idToken = authHeader.slice(7);
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return decoded.uid === process.env.NEXT_PUBLIC_ADMIN_UID;
  } catch {
    return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  if (!(await isAdmin(request))) {
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
