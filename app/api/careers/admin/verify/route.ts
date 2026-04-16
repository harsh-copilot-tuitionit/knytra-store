import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/careers-auth";

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request.cookies);

  if (!session) {
    return Response.json(
      { error: "Not authenticated." },
      { status: 401 },
    );
  }

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("careers_admins")
      .doc(session.uid)
      .get();

    if (!snap.exists) {
      return Response.json(
        { error: "Admin not found." },
        { status: 401 },
      );
    }

    const data = snap.data()!;
    return Response.json({
      admin: { uid: data.uid, name: data.name, role: data.role },
    });
  } catch (error) {
    console.error("[careers/admin/verify]", error);
    return Response.json(
      { error: "Verification failed." },
      { status: 500 },
    );
  }
}
