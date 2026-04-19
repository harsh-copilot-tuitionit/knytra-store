import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { normalizeApplicationConfig } from "@/lib/types/careers";
import * as admin from "firebase-admin";

function isAdmin(request: NextRequest): boolean {
  return getSessionFromRequest(request.cookies) !== null;
}

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const adminAuth = isAdmin(request);

    let query: FirebaseFirestore.Query = db
      .collection("careers_jobs")
      .orderBy("createdAt", "desc");

    if (!adminAuth) {
      query = query.where("status", "==", "open");
    }

    const snap = await query.get();
    const jobs = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title ?? "",
        slug: d.slug ?? "",
        department: d.department ?? "",
        location: d.location ?? "",
        type: d.type ?? "full-time",
        description: d.description ?? "",
        requirements: d.requirements ?? [],
        responsibilities: d.responsibilities ?? [],
        perks: d.perks ?? [],
        compensation: d.compensation ?? "",
        status: d.status ?? "draft",
        applicationConfig: normalizeApplicationConfig(d.applicationConfig),
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return Response.json({ jobs });
  } catch (error) {
    console.error("[GET /api/careers/jobs]", error);
    return Response.json(
      { error: "Failed to fetch jobs." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      department,
      location,
      type,
      description,
      requirements,
      responsibilities,
      compensation,
      status,
      applicationConfig,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length < 2) {
      return Response.json(
        { error: "Title is required." },
        { status: 400 },
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const now = admin.firestore.FieldValue.serverTimestamp();

    const db = getAdminDb();
    const docRef = await db.collection("careers_jobs").add({
      title: title.trim(),
      slug,
      department: department?.trim() ?? "",
      location: location?.trim() ?? "",
      type: type ?? "full-time",
      description: description?.trim() ?? "",
      requirements: Array.isArray(requirements) ? requirements : [],
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities
        : [],
      perks: Array.isArray(body.perks) ? body.perks : [],
      compensation: compensation?.trim() ?? "",
      status: status ?? "draft",
      applicationConfig: normalizeApplicationConfig(applicationConfig),
      createdAt: now,
      updatedAt: now,
    });

    return Response.json({ id: docRef.id, slug }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/careers/jobs]", error);
    return Response.json(
      { error: "Failed to create job." },
      { status: 500 },
    );
  }
}
