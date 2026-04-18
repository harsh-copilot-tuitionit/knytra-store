import { NextRequest } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";
import { verifyGuestToken } from "@/lib/guestToken";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Firestore auto-IDs are alphanumeric only — reject anything else
  if (!id || !/^[a-zA-Z0-9]+$/.test(id)) {
    return Response.json({ error: "Invalid order ID." }, { status: 400 });
  }

  try {
    const db   = getAdminDb();
    const snap = await db.collection("orders").doc(id).get();

    if (!snap.exists) {
      return Response.json({ error: "Order not found." }, { status: 404 });
    }

    const d = snap.data()!;

    // ── Authorization ──────────────────────────────────────────────────────
    //
    // Three valid paths:
    //   1. Logged-in user — Firebase ID token in Authorization: Bearer header.
    //      Token is verified server-side; order.userId must equal decoded uid.
    //
    //   2. Payment-ID proof — caller passes ?payment_id= matching the
    //      order's razorpay_payment_id. Used by /order-success for guests.
    //
    //   3. Guest cookie — valid gto_<id> HttpOnly cookie issued by
    //      /api/track-order after phone/email verification.
    //
    // Any other combination is rejected with 401 / 403.

    const authHeader = request.headers.get("authorization") ?? "";
    const paymentIdFromQuery = new URL(request.url).searchParams.get("payment_id");

    if (authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.slice(7);
      let uid: string;
      try {
        const decoded = await getAdminAuth().verifyIdToken(idToken);
        uid = decoded.uid;
      } catch {
        return Response.json({ error: "Invalid or expired token." }, { status: 401 });
      }
      if (d.userId !== uid) {
        return Response.json({ error: "Forbidden." }, { status: 403 });
      }
    } else if (
      paymentIdFromQuery &&
      d.payment?.razorpay_payment_id &&
      d.payment.razorpay_payment_id === paymentIdFromQuery
    ) {
      // Guest fallback — allow access only when the caller proves they
      // possess the Razorpay payment ID that belongs to this order.
    } else {
      // No Bearer header and no valid payment_id — try guest token cookie
      const cookie = request.cookies.get(`gto_${id}`)?.value ?? "";
      if (!verifyGuestToken(id, cookie)) {
        return Response.json({ error: "Unauthorized." }, { status: 401 });
      }
    }

    // ── Return restricted fields only (no raw user PII beyond address) ─────
    return Response.json({
      id:          snap.id,
      userId:      d.userId      ?? null,
      status:      d.status      ?? "placed",
      totalAmount: d.totalAmount ?? 0,
      createdAt:   d.createdAt?.toDate?.()?.toISOString() ?? null,
      items: (d.items ?? []).map((item: Record<string, unknown>) => ({
        name:     item.name     ?? "",
        size:     item.size     ?? "",
        quantity: item.quantity ?? 1,
        price:    item.price    ?? 0,
        image:    item.image    ?? "",
      })),
      address: {
        name:        d.address?.name        ?? "",
        phone:       d.address?.phone       ?? "",
        fullAddress: d.address?.fullAddress ?? "",
        city:        d.address?.city        ?? "",
        pincode:     d.address?.pincode     ?? "",
      },
      payment: {
        status:              d.payment?.status              ?? "pending",
        razorpay_order_id:   d.payment?.razorpay_order_id   ?? "",
        razorpay_payment_id: d.payment?.razorpay_payment_id ?? "",
      },
      whatsapp: {
        sent:  d.whatsappNotification?.sent  ?? false,
        error: d.whatsappNotification?.error ?? null,
      },
    });
  } catch (error: unknown) {
    console.error("[api/orders] Fetch error:", error);
    return Response.json({ error: "Failed to fetch order." }, { status: 500 });
  }
}

