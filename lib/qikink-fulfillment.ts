import * as admin from "firebase-admin";
import { createQikinkOrder, QikinkResult } from "@/lib/qikink";
import { buildQikinkOrderPayload } from "@/lib/qikink-order-builder";

export async function sendToQikink(
  db: FirebaseFirestore.Firestore,
  orderId: string,
): Promise<QikinkResult | void> {
  const orderSnap = await db.collection("orders").doc(orderId).get();
  if (!orderSnap.exists) {
    console.warn("[qikink] Order not found:", orderId);
    return;
  }

  const order = orderSnap.data()!;

  // Retry safety — skip if already pushed
  if (order.qikinkOrderId) {
    console.log("[qikink] Already pushed, skipping:", orderId);
    return;
  }

  await db.collection("orders").doc(orderId).update({
    qikinkStatus: "pending",
    qikinkAttemptCount: admin.firestore.FieldValue.increment(1),
    qikinkLastAttemptAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Build Qikink payload using helper
  let payload;
  try {
    payload = buildQikinkOrderPayload(orderId, order);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to build Qikink payload";
    console.error("[qikink]", errorMessage);
    await db.collection("orders").doc(orderId).update({
      qikinkStatus: "failed",
      qikinkError: errorMessage,
      qikinkFailedAt: admin.firestore.FieldValue.serverTimestamp(),
      qikinkLastFailedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: false, qikinkStatus: "failed", qikinkError: errorMessage };
  }

  // Persist merchant-facing order number used in Qikink payload for webhook matching.
  await db.collection("orders").doc(orderId).update({
    qikinkOrderNumber: payload.order_number,
  });

  const result = await createQikinkOrder(payload);

  // Persist Qikink result to Firestore
  if (result.qikinkStatus === "created") {
    await db
      .collection("orders")
      .doc(orderId)
      .update({
        qikinkOrderId: result.qikinkOrderId ?? null,
        qikinkOrderNumber: payload.order_number,
        qikinkStatus: result.qikinkStatus,
        qikinkResponse: result.qikinkResponse ?? null,
        qikinkError: null,
        qikinkCreatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  } else {
    await db
      .collection("orders")
      .doc(orderId)
      .update({
        qikinkOrderId: result.qikinkOrderId ?? null,
        qikinkOrderNumber: payload.order_number,
        qikinkStatus: result.qikinkStatus,
        qikinkResponse: result.qikinkResponse ?? null,
        qikinkError: result.qikinkError,
        qikinkLastFailedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  console.log(
    `[qikink] Order ${orderId}: ${result.qikinkStatus}`,
    result.qikinkOrderId ?? result.qikinkError ?? "",
  );

  return result;
}
