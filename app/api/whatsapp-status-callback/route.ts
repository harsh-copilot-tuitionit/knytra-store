import { NextRequest, NextResponse } from "next/server";
import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const messageSid = formData.get("MessageSid")?.toString() ?? "";
    const messageStatus = formData.get("MessageStatus")?.toString() ?? formData.get("SmsStatus")?.toString() ?? "";
    const errorCode = formData.get("ErrorCode")?.toString() ?? null;
    const errorMessage = formData.get("ErrorMessage")?.toString() ?? null;

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await orderRef.update({
      whatsappNotification: {
        sid: messageSid,
        status: messageStatus,
        deliveryUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        errorCode,
        errorMessage,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[whatsapp-status-callback] Error:", error);
    return NextResponse.json({ error: "Failed to record WhatsApp callback." }, { status: 500 });
  }
}
