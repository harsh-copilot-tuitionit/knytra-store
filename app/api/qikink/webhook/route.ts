import { NextRequest } from "next/server";
import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";

function getStringField(
  payload: Record<string, unknown> | null,
  keys: string[],
): string | undefined {
  if (!payload) return undefined;

  for (const key of keys) {
    const value = payload[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
  }

  return undefined;
}

async function findOrderByField(
  db: FirebaseFirestore.Firestore,
  field: string,
  value: string,
): Promise<FirebaseFirestore.QueryDocumentSnapshot | null> {
  const snap = await db
    .collection("orders")
    .where(field, "==", value)
    .limit(1)
    .get();

  return snap.empty ? null : snap.docs[0];
}

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.QIKINK_WEBHOOK_SECRET;
  const providedSecret = request.headers.get("x-qikink-webhook-secret");

  if (configuredSecret) {
    if (providedSecret !== configuredSecret) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }
  } else {
    console.warn("[qikink-webhook] QIKINK_WEBHOOK_SECRET not configured");
  }

  const rawText = await request.text();
  let payload: unknown = rawText;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = rawText;
  }

  const payloadObj =
    payload !== null && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;

  const qikinkOrderId = getStringField(payloadObj, [
    "qikink_order_id",
    "order_id",
    "id",
  ]);

  const merchantOrderNumber = getStringField(payloadObj, [
    "merchant_order_id",
    "order_number",
    "orderNumber",
  ]);

  const db = getAdminDb();
  let orderDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;

  if (qikinkOrderId) {
    orderDoc = await findOrderByField(db, "qikinkOrderId", qikinkOrderId);
  }

  if (!orderDoc && merchantOrderNumber) {
    orderDoc = await findOrderByField(
      db,
      "qikinkMerchantOrderNumber",
      merchantOrderNumber,
    );
  }

  if (!orderDoc && merchantOrderNumber) {
    orderDoc = await findOrderByField(db, "qikinkOrderNumber", merchantOrderNumber);
  }

  if (!orderDoc) {
    console.warn("[qikink-webhook] No matching order found", {
      qikinkOrderId,
      merchantOrderNumber,
    });

    return Response.json({ received: true, matched: false }, { status: 202 });
  }

  const status = getStringField(payloadObj, [
    "status",
    "order_status",
    "fulfillment_status",
    "shipment_status",
  ]);

  const trackingNumber = getStringField(payloadObj, [
    "tracking_number",
    "trackingNumber",
    "awb",
    "awb_number",
  ]);

  const courier = getStringField(payloadObj, [
    "courier",
    "courier_name",
    "courierName",
    "logistics_partner",
  ]);

  const updates: Record<string, unknown> = {
    qikinkWebhookLastReceivedAt: admin.firestore.FieldValue.serverTimestamp(),
    qikinkLastWebhookPayload: payload,
    qikinkShipmentUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (status) {
    updates.qikinkFulfillmentStatus = status;
  }
  if (trackingNumber) {
    updates.qikinkTrackingNumber = trackingNumber;
  }
  if (courier) {
    updates.qikinkCourier = courier;
  }

  await orderDoc.ref.update(updates);

  return Response.json({
    received: true,
    matched: true,
    orderId: orderDoc.id,
  });
}
