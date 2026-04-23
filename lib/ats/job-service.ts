import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeApplicationConfig } from "@/lib/types/careers";
import type { CareerJob, JobInput, ApplicationStage } from "@/lib/types/careers";
import { APPLICATION_PIPELINE_STAGES } from "./constants";

function mapJobDoc(doc: FirebaseFirestore.DocumentSnapshot): CareerJob {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    title: d.title ?? "",
    slug: d.slug ?? "",
    department: d.department ?? "",
    location: d.location ?? "",
    type: d.type ?? "full-time",
    description: d.description ?? "",
    requirements: Array.isArray(d.requirements) ? d.requirements : [],
    responsibilities: Array.isArray(d.responsibilities)
      ? d.responsibilities
      : [],
    perks: Array.isArray(d.perks) ? d.perks : [],
    compensation: d.compensation ?? "",
    status: d.status ?? "draft",
    applicationConfig: normalizeApplicationConfig(d.applicationConfig),
    pipelineStages: Array.isArray(d.pipelineStages)
      ? d.pipelineStages
      : APPLICATION_PIPELINE_STAGES,
    assignedRecruiters: Array.isArray(d.assignedRecruiters)
      ? d.assignedRecruiters
      : [],
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

export async function getOpenJobs(): Promise<CareerJob[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("careers_jobs")
    .where("status", "==", "open")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map(mapJobDoc);
}

export async function getAllJobs(adminView = false): Promise<CareerJob[]> {
  const db = getAdminDb();
  let query: FirebaseFirestore.Query = db
    .collection("careers_jobs")
    .orderBy("createdAt", "desc");

  if (!adminView) query = query.where("status", "==", "open");
  const snap = await query.get();
  return snap.docs.map(mapJobDoc);
}

export async function getJobBySlug(
  slug: string | undefined,
  adminView = false,
): Promise<CareerJob | null> {
  if (!slug) {
    console.warn("[getJobBySlug] called without a slug");
    return null;
  }

  const db = getAdminDb();
  let query: FirebaseFirestore.Query = db
    .collection("careers_jobs")
    .where("slug", "==", slug)
    .limit(1);

  if (!adminView) query = query.where("status", "==", "open");
  const snap = await query.get();
  if (snap.empty) return null;
  return mapJobDoc(snap.docs[0]);
}

export async function getJobById(
  id: string,
  adminView = false,
): Promise<CareerJob | null> {
  const db = getAdminDb();
  const snap = await db.collection("careers_jobs").doc(id).get();
  if (!snap.exists) return null;
  const job = mapJobDoc(snap);
  if (!adminView && job.status !== "open") return null;
  return job;
}

export async function createJob(body: JobInput) {
  const db = getAdminDb();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const docRef = await db.collection("careers_jobs").add({
    title: body.title.trim(),
    slug,
    department: body.department?.trim() ?? "",
    location: body.location?.trim() ?? "",
    type: body.type ?? "full-time",
    description: body.description?.trim() ?? "",
    requirements: Array.isArray(body.requirements)
      ? body.requirements
      : [],
    responsibilities: Array.isArray(body.responsibilities)
      ? body.responsibilities
      : [],
    perks: Array.isArray(body.perks) ? body.perks : [],
    compensation: body.compensation?.trim() ?? "",
    status: body.status ?? "draft",
    applicationConfig: normalizeApplicationConfig(body.applicationConfig),
    pipelineStages: Array.isArray(body.pipelineStages)
      ? body.pipelineStages
      : APPLICATION_PIPELINE_STAGES,
    assignedRecruiters: Array.isArray(body.assignedRecruiters)
      ? body.assignedRecruiters
      : [],
    createdAt: now,
    updatedAt: now,
  });

  return { id: docRef.id, slug };
}

export async function updateJob(id: string, body: Partial<JobInput>) {
  const db = getAdminDb();
  const docRef = db.collection("careers_jobs").doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;

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
  if (body.department !== undefined) updates.department = body.department.trim();
  if (body.location !== undefined) updates.location = body.location.trim();
  if (body.type) updates.type = body.type;
  if (body.description !== undefined)
    updates.description = body.description.trim();
  if (Array.isArray(body.requirements)) updates.requirements = body.requirements;
  if (Array.isArray(body.responsibilities))
    updates.responsibilities = body.responsibilities;
  if (Array.isArray(body.perks)) updates.perks = body.perks;
  if (body.compensation !== undefined)
    updates.compensation = body.compensation.trim();
  if (body.status) updates.status = body.status;
  if (body.applicationConfig && typeof body.applicationConfig === "object")
    updates.applicationConfig = normalizeApplicationConfig(body.applicationConfig);
  if (Array.isArray(body.pipelineStages)) updates.pipelineStages = body.pipelineStages;
  if (Array.isArray(body.assignedRecruiters)) updates.assignedRecruiters = body.assignedRecruiters;

  await docRef.update(updates);
  return true;
}

export async function deleteJob(id: string) {
  const db = getAdminDb();
  await db.collection("careers_jobs").doc(id).delete();
}
