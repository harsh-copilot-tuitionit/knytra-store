import { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { isValidWishlistProductId } from "@/lib/wishlist";

interface WishlistItemDoc {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: Timestamp;
}

async function requireAuth(req: NextRequest): Promise<{ uid: string } | Response> {
  const h = req.headers.get("authorization") ?? "";
  if (!h.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(h.slice(7));
    return { uid: decoded.uid };
  } catch {
    return Response.json({ error: "Invalid or expired token." }, { status: 401 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { uid } = auth;
  const { productId } = await params;

  if (!isValidWishlistProductId(productId)) {
    return Response.json({ error: "Invalid productId." }, { status: 400 });
  }

  try {
    const docRef = getAdminDb().collection("wishlists").doc(uid);

    await getAdminDb().runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists) return;

      const current = (snap.data()?.items ?? []) as WishlistItemDoc[];
      const next = current.filter((item) => item.productId !== productId);

      // Idempotent remove: no-op if item is absent.
      if (next.length === current.length) return;

      tx.set(
        docRef,
        {
          userId: uid,
          items: next,
          updatedAt: Timestamp.now(),
        },
        { merge: true },
      );
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/wishlist/:productId]", err);
    return Response.json({ error: "Failed to remove wishlist item." }, { status: 500 });
  }
}
