import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  verifyPassword,
  createSessionToken,
  sessionCookieHeader,
} from "@/lib/careers-auth";
import * as admin from "firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, password } = body;

    if (!uid || !password) {
      return Response.json(
        { error: "UID and password are required." },
        { status: 400 },
      );
    }

    const cleanUid = uid.trim().toLowerCase();
    const db = getAdminDb();
    const docRef = db.collection("careers_admins").doc(cleanUid);
    const snap = await docRef.get();

    if (!snap.exists) {
      return Response.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const data = snap.data()!;
    if (!verifyPassword(password, data.salt, data.passwordHash)) {
      return Response.json(
        { error: "Invalid credentials." },
        { status: 401 },
      );
    }

    const token = createSessionToken(cleanUid);

    await docRef.update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });

    const response = Response.json({
      success: true,
      admin: { uid: data.uid, name: data.name, role: data.role },
    });

    response.headers.set("Set-Cookie", sessionCookieHeader(token));
    return response;
  } catch (error) {
    console.error("[careers/admin/login]", error);
    return Response.json({ error: "Login failed." }, { status: 500 });
  }
}
