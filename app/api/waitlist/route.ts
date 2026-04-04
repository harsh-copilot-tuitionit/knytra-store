import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: unknown = body?.email;

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalized)) {
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    }

    const { getAdminDb } = await import("@/lib/firebase-admin");
    const adminDb = getAdminDb();
    const waitlistRef = adminDb.collection("waitlist");

    const snapshot = await waitlistRef.where("email", "==", normalized).get();
    if (!snapshot.empty) {
      return Response.json(
        { error: "You're already on the list! We'll see you on drop day." },
        { status: 409 }
      );
    }

    await waitlistRef.add({
      email: normalized,
      joinedAt: new Date().toISOString(),
      source: "coming-soon",
      status: "active",
    });

    return Response.json(
      { success: true, message: "You're on the list. We'll hit you up on launch day." },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Knytra Waitlist] Error:", err);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}
