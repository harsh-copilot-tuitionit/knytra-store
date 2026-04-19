import { getAdminDb } from "@/lib/firebase-admin";
import type { CareerJob } from "@/lib/types/careers";

export async function getJobBySlug(slug: string): Promise<CareerJob | null> {
  const db = getAdminDb();
  const snap = await db
    .collection("careers_jobs")
    .where("slug", "==", slug)
    .where("status", "==", "open")
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
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
    applicationConfig: d.applicationConfig ?? {
      showStudentSection: false,
      showExperienceSection: false,
      showMotivationSection: false,
      showAssessmentSection: false,
      customQuestions: [],
    },
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

export async function getAllOpenJobs(): Promise<CareerJob[]> {
  const db = getAdminDb();
  const snap = await db
    .collection("careers_jobs")
    .where("status", "==", "open")
    .orderBy("createdAt", "desc")
    .get();

  return snap.docs.map((doc) => {
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
      applicationConfig: d.applicationConfig ?? {
        showStudentSection: false,
        showExperienceSection: false,
        showMotivationSection: false,
        showAssessmentSection: false,
        customQuestions: [],
      },
      createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
    };
  });
}
