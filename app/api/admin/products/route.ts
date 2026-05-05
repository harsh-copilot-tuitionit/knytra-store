import { NextRequest } from "next/server";
import * as admin from "firebase-admin";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { validateAndNormalizeProductPayload } from "@/lib/admin-product-payload";

async function isAdmin(request: NextRequest): Promise<boolean> {
  if (getSessionFromRequest(request.cookies) !== null) {
    return true;
  }

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

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateAndNormalizeProductPayload(body);
  if (!validated.success) {
    return Response.json({ error: validated.error }, { status: 400 });
  }

  const db = getAdminDb();
  const docRef = await db.collection("products").add({
    ...validated.data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return Response.json({ success: true, id: docRef.id });
}
