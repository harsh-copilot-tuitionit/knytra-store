import { NextRequest } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSessionFromRequest } from "@/lib/careers-auth";
import { normalizeApplicationConfig } from "@/lib/types/careers";
import * as admin from "firebase-admin";

function isAdmin(request: NextRequest): boolean {
  return getSessionFromRequest(request.cookies) !== null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const db = getAdminDb();
    const snap = await db.collection("careers_jobs").doc(id).get();

    if (!snap.exists) {
      return Response.json({ error: "Job not found." }, { status: 404 });
    }

    const d = snap.data()!;

    if (d.status !== "open" && !isAdmin(request)) {
      return Response.json({ error: "Job not found." }, { status: 404 });
    }

    return Response.json({
      id: snap.id,
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
    });
  } catch (error) {
    console.error("[GET /api/careers/jobs/id]", error);
    return Response.json(
      { error: "Failed to fetch job." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const db = getAdminDb();
    const docRef = db.collection("careers_jobs").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return Response.json({ error: "Job not found." }, { status: 404 });
    }

    const updates: Record<string, unknown> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (body.title) {
      updates.title = body.title.trim();
      updates.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (body.department !== undefined)
      updates.department = body.department.trim();
    if (body.location !== undefined) updates.location = body.location.trim();
    if (body.type) updates.type = body.type;
    if (body.description !== undefined)
      updates.description = body.description.trim();
    if (Array.isArray(body.requirements))
      updates.requirements = body.requirements;
    if (Array.isArray(body.responsibilities))
      updates.responsibilities = body.responsibilities;
    if (Array.isArray(body.perks)) updates.perks = body.perks;
    if (body.compensation !== undefined)
      updates.compensation = body.compensation.trim();
    if (body.status) updates.status = body.status;
    if (body.applicationConfig && typeof body.applicationConfig === "object")
      updates.applicationConfig = normalizeApplicationConfig(body.applicationConfig);

    await docRef.update(updates);
    return Response.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/careers/jobs/id]", error);
    return Response.json(
      { error: "Failed to update job." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const db = getAdminDb();
    await db.collection("careers_jobs").doc(id).delete();
    return Response.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/careers/jobs/id]", error);
    return Response.json(
      { error: "Failed to delete job." },
      { status: 500 },
    );
  }
}
