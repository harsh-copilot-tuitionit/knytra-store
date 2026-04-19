import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/careers-auth";
import * as admin from "firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request.cookies);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("careers_applications")
      .doc(id)
      .get();

    if (!snap.exists) {
      return Response.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    const d = snap.data()!;
    return Response.json({
      id: snap.id,
      jobId: d.jobId ?? d.role?.jobId ?? "",
      jobTitle: d.jobTitle ?? d.role?.jobTitle ?? "",
      jobSlug: d.role?.jobSlug ?? "",
      fullName: d.fullName ?? "",
      email: d.email ?? "",
      phone: d.phone ?? "",
      city: d.city ?? "",
      linkedIn: d.linkedIn ?? "",
      additionalLink: d.additionalLink ?? "",
      resumeLink: d.resumeLink ?? "",
      role: {
        jobId: d.role?.jobId ?? d.jobId ?? "",
        jobSlug: d.role?.jobSlug ?? "",
        jobTitle: d.role?.jobTitle ?? d.jobTitle ?? "",
      },
      isStudent: d.isStudent ?? false,
      studentDetails: d.studentDetails ?? null,
      experienceDetails: d.experienceDetails ?? null,
      motivationAnswers: d.motivationAnswers ?? { whyHRGrowth: "" },
      availability: d.availability ?? {
        availableMayJune: false,
        performanceBased: false,
        hybridComfortable: false,
      },
      confirmation: d.confirmation ?? {
        infoCorrect: false,
        understandsPerformanceBased: false,
      },
      status: d.status ?? "received",
      notes: d.notes ?? [],
      timeline: d.timeline ?? [],
      createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("[GET /api/careers/applications/id]", error);
    return Response.json(
      { error: "Failed to fetch application." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = getSessionFromRequest(request.cookies);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const db = getAdminDb();
    const docRef = db.collection("careers_applications").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return Response.json(
        { error: "Application not found." },
        { status: 404 },
      );
    }

    const current = snap.data()!;
    const updates: Record<string, unknown> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (body.status && body.status !== current.status) {
      updates.status = body.status;
      updates.timeline = [
        ...(current.timeline ?? []),
        {
          status: body.status,
          note:
            body.statusNote?.trim() ||
            `Status changed to ${body.status}`,
          author: session.uid,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    if (body.note && typeof body.note === "string" && body.note.trim()) {
      updates.notes = [
        ...(current.notes ?? []),
        {
          text: body.note.trim(),
          author: session.uid,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    await docRef.update(updates);
    return Response.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/careers/applications/id]", error);
    return Response.json(
      { error: "Failed to update application." },
      { status: 500 },
    );
  }
}
