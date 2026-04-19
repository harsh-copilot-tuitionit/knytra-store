import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/careers-auth";
import * as admin from "firebase-admin";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      role,
      fullName,
      email,
      phone,
      city,
      linkedIn,
      additionalLink,
      resumeLink,
      isStudent,
      studentDetails,
      experienceDetails,
      motivationAnswers,
      availability,
      confirmation,
    } = body;

    if (!role || typeof role !== "object") {
      return Response.json(
        { error: "Role metadata is required." },
        { status: 400 },
      );
    }

    const { jobId, jobSlug, jobTitle } = role;
    if (!jobId || typeof jobId !== "string") {
      return Response.json(
        { error: "Role jobId is required." },
        { status: 400 },
      );
    }
    if (!jobSlug || typeof jobSlug !== "string") {
      return Response.json(
        { error: "Role jobSlug is required." },
        { status: 400 },
      );
    }
    if (!jobTitle || typeof jobTitle !== "string") {
      return Response.json(
        { error: "Role jobTitle is required." },
        { status: 400 },
      );
    }

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return Response.json(
        { error: "Full name is required (min 2 characters)." },
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
      !/^\d{10}$/.test(phone.replace(/\D/g, ""))
    ) {
      return Response.json(
        { error: "Valid 10-digit phone number is required." },
        { status: 400 },
      );
    }

    if (!city || typeof city !== "string" || !city.trim()) {
      return Response.json(
        { error: "City is required." },
        { status: 400 },
      );
    }

    if (!linkedIn || typeof linkedIn !== "string" || !linkedIn.trim()) {
      return Response.json(
        { error: "LinkedIn profile is required." },
        { status: 400 },
      );
    }

    if (!resumeLink || typeof resumeLink !== "string" || !resumeLink.trim()) {
      return Response.json(
        { error: "Resume link is required." },
        { status: 400 },
      );
    }

    if (typeof isStudent !== "boolean") {
      return Response.json(
        { error: "Student status is required." },
        { status: 400 },
      );
    }

    if (isStudent) {
      if (
        !studentDetails ||
        typeof studentDetails !== "object" ||
        !studentDetails.institute?.trim() ||
        !studentDetails.university?.trim() ||
        !studentDetails.course?.trim() ||
        !studentDetails.specialization?.trim() ||
        !studentDetails.currentYear?.trim() ||
        !studentDetails.completionYear?.trim()
      ) {
        return Response.json(
          { error: "All student details are required." },
          { status: 400 },
        );
      }
    } else {
      if (
        !experienceDetails ||
        typeof experienceDetails !== "object" ||
        !experienceDetails.highestQualification?.trim() ||
        !experienceDetails.currentStatus?.trim() ||
        !experienceDetails.company?.trim() ||
        !experienceDetails.role?.trim() ||
        !experienceDetails.experience?.trim()
      ) {
        return Response.json(
          { error: "All experience details are required." },
          { status: 400 },
        );
      }
    }

    if (
      !motivationAnswers ||
      typeof motivationAnswers !== "object" ||
      !motivationAnswers.whyHRGrowth?.trim()
    ) {
      return Response.json(
        { error: "Motivation answer is required." },
        { status: 400 },
      );
    }

    if (
      !availability ||
      typeof availability !== "object" ||
      typeof availability.availableMayJune !== "boolean" ||
      typeof availability.performanceBased !== "boolean" ||
      typeof availability.hybridComfortable !== "boolean"
    ) {
      return Response.json(
        { error: "Availability answers are required." },
        { status: 400 },
      );
    }

    if (
      !confirmation ||
      typeof confirmation !== "object" ||
      confirmation.infoCorrect !== true ||
      confirmation.understandsPerformanceBased !== true
    ) {
      return Response.json(
        { error: "Please confirm the application declarations." },
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

    if (jobSnap.data()?.slug !== jobSlug) {
      return Response.json(
        { error: "Role slug mismatch." },
        { status: 400 },
      );
    }

    const dupeSnap = await db
      .collection("careers_applications")
      .where("email", "==", email.trim().toLowerCase())
      .where("role.jobId", "==", jobId)
      .limit(1)
      .get();

    if (!dupeSnap.empty) {
      return Response.json(
        { error: "You have already applied for this position." },
        { status: 409 },
      );
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    const docRef = await db.collection("careers_applications").add({
      jobId,
      jobTitle,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.replace(/\D/g, "").slice(-10),
      city: city.trim(),
      linkedIn: linkedIn.trim(),
      additionalLink: additionalLink?.trim() ?? "",
      resumeLink: resumeLink.trim(),
      role: {
        jobId,
        jobSlug,
        jobTitle,
      },
      isStudent,
      studentDetails: isStudent ? studentDetails : null,
      experienceDetails: isStudent ? null : experienceDetails,
      motivationAnswers: {
        whyHRGrowth: motivationAnswers.whyHRGrowth.trim(),
      },
      availability,
      confirmation,
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
