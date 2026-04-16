import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { generateSalt, hashPassword } from "@/lib/careers-auth";
import * as admin from "firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, password, name, role } = body;

    if (!uid || typeof uid !== "string" || uid.trim().length < 3) {
      return Response.json(
        { error: "UID must be at least 3 characters." },
        { status: 400 },
      );
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return Response.json(
        { error: "Name is required (min 2 characters)." },
        { status: 400 },
      );
    }

    const validRoles = ["recruiter", "hiring_manager", "admin"];
    const adminRole = validRoles.includes(role) ? role : "recruiter";
    const cleanUid = uid.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

    const db = getAdminDb();
    const docRef = db.collection("careers_admins").doc(cleanUid);
    const existing = await docRef.get();

    if (existing.exists) {
      return Response.json(
        {
          error:
            "This UID is already registered. Credentials can only be created once.",
        },
        { status: 409 },
      );
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    await docRef.set({
      uid: cleanUid,
      name: name.trim(),
      role: adminRole,
      passwordHash,
      salt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
    });

    return Response.json(
      { success: true, uid: cleanUid },
      { status: 201 },
    );
  } catch (error) {
    console.error("[careers/admin/setup]", error);
    return Response.json({ error: "Setup failed." }, { status: 500 });
  }
}
