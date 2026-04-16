import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/careers-auth";
import * as admin from "firebase-admin";

// GET: Admin only — list all applications with optional filters
export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request.cookies);
  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const jobId = url.searchParams.get("jobId");

    let query: FirebaseFirestore.Query = db
      .collection("careers_applications")
      .orderBy("createdAt", "desc");

    if (status) query = query.where("status", "==", status);
    if (jobId) query = query.where("jobId", "==", jobId);

    const snap = await query.get();
    const applications = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        jobId: d.jobId ?? "",
        jobTitle: d.jobTitle ?? "",
        name: d.name ?? "",
        email: d.email ?? "",
        phone: d.phone ?? "",
        resumeUrl: d.resumeUrl ?? "",
        portfolioUrl: d.portfolioUrl ?? "",
        coverLetter: d.coverLetter ?? "",
        experience: d.experience ?? "",
        currentRole: d.currentRole ?? "",
        linkedIn: d.linkedIn ?? "",
        status: d.status ?? "received",
        notes: d.notes ?? [],
        timeline: d.timeline ?? [],
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return Response.json({ applications });
  } catch (error) {
    console.error("[GET /api/careers/applications]", error);
    return Response.json(
      { error: "Failed to fetch applications." },
      { status: 500 },
    );
  }
}

// POST: Public — submit a job application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobId,
      jobTitle,
      name,
      email,
      phone,
      resumeUrl,
      portfolioUrl,
      coverLetter,
      experience,
      currentRole,
      linkedIn,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return Response.json(
        { error: "Name is required (min 2 characters)." },
        { status: 400 },
      );
    }
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return Response.json(
        { error: "Valid email is required." },
        { status: 400 },
      );
    }
    if (
      !phone ||
      typeof phone !== "string" ||
      !/^\d{10}$/.test(phone.replace(/\D/g, "").slice(-10))
    ) {
      return Response.json(
        { error: "Valid 10-digit phone number is required." },
        { status: 400 },
      );
    }
    if (!jobId || typeof jobId !== "string") {
      return Response.json(
        { error: "Job selection is required." },
        { status: 400 },
      );
    }

    const db = getAdminDb();

    const jobSnap = await db.collection("careers_jobs").doc(jobId).get();
    if (!jobSnap.exists || jobSnap.data()?.status !== "open") {
      return Response.json(
        { error: "This position is no longer accepting applications." },
        { status: 400 },
      );
    }

    // Prevent duplicate applications (same email + same job)
    const dupeSnap = await db
      .collection("careers_applications")
      .where("email", "==", email.trim().toLowerCase())
      .where("jobId", "==", jobId)
      .limit(1)
      .get();

    if (!dupeSnap.empty) {
      return Response.json(
        { error: "You have already applied for this position." },
        { status: 409 },
      );
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const resolvedTitle =
      jobTitle?.trim() ?? jobSnap.data()?.title ?? "";

    const docRef = await db.collection("careers_applications").add({
      jobId,
      jobTitle: resolvedTitle,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\D/g, "").slice(-10),
      resumeUrl: resumeUrl?.trim() ?? "",
      portfolioUrl: portfolioUrl?.trim() ?? "",
      coverLetter: coverLetter?.trim() ?? "",
      experience: experience?.trim() ?? "",
      currentRole: currentRole?.trim() ?? "",
      linkedIn: linkedIn?.trim() ?? "",
      status: "received",
      notes: [],
      timeline: [
        {
          status: "received",
          note: "Application submitted",
          author: "System",
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    return Response.json(
      { success: true, id: docRef.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/careers/applications]", error);
    return Response.json(
      { error: "Failed to submit application." },
      { status: 500 },
    );
  }
}
