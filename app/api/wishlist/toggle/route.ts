import { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { isValidWishlistProductId } from "@/lib/wishlist";

const MAX_WISHLIST_ITEMS = 100;

interface WishlistItemDoc {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: Timestamp;
}

interface ToggleBody {
  productId: string;
  name: string;
  price: number;
  image: string;
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

function validateToggleBody(body: unknown): { data: ToggleBody } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const b = body as Record<string, unknown>;

  const productId = typeof b.productId === "string" ? b.productId.trim() : "";
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const price = typeof b.price === "number" ? b.price : Number(b.price);
  const image = typeof b.image === "string" ? b.image.trim() : "";

  if (!isValidWishlistProductId(productId)) {
    return { error: "Invalid productId." };
  }
  if (!name || name.length > 200) {
    return { error: "Valid product name is required (max 200 chars)." };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Valid price is required." };
  }
  if (!image || image.length > 1200) {
    return { error: "Valid product image is required." };
  }

  return { data: { productId, name, price, image } };
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { uid } = auth;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validated = validateToggleBody(raw);
  if ("error" in validated) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const { productId, name, price, image } = validated.data;

  try {
    const docRef = getAdminDb().collection("wishlists").doc(uid);
    let inWishlist = false;

    try {
      await getAdminDb().runTransaction(async (tx) => {
        const snap = await tx.get(docRef);
        const now = Timestamp.now();
        const current = (snap.data()?.items ?? []) as WishlistItemDoc[];

        const existing = current.find((item) => item.productId === productId);
        if (existing) {
          inWishlist = false;
          const next = current.filter((item) => item.productId !== productId);
          tx.set(
            docRef,
            {
              userId: uid,
              items: next,
              updatedAt: now,
            },
            { merge: true },
          );
          return;
        }

        if (current.length >= MAX_WISHLIST_ITEMS) {
          throw Object.assign(new Error("Wishlist limit reached (max 100 items)."), {
            code: "MAX_LIMIT",
          });
        }

        inWishlist = true;
        tx.set(
          docRef,
          {
            userId: uid,
            items: [
              ...current,
              {
                productId,
                name,
                price,
                image,
                addedAt: now,
              },
            ],
            updatedAt: now,
          },
          { merge: true },
        );
      });
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e?.code === "MAX_LIMIT") {
        return Response.json({ error: e.message }, { status: 400 });
      }
      throw err;
    }

    return Response.json({ inWishlist });
  } catch (err) {
    console.error("[POST /api/wishlist/toggle]", err);
    return Response.json({ error: "Failed to toggle wishlist item." }, { status: 500 });
  }
}
