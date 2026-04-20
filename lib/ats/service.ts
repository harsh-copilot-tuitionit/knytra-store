import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import {
  CareerApplication,
  CareerCandidate,
  CareerJob,
  ApplicationFilters,
  ApplicationStage,
  ApplicationStatus,
  ApplicationEvaluation,
  ApplicationNote,
  ApplicationTimelineEntry,
  ApplicationRole,
  JobInput,
} from "@/lib/types/careers";
import { normalizeApplicationConfig } from "@/lib/types/careers";

export const APPLICATION_PIPELINE_STAGES: ApplicationStage[] = [
  "received",
  "screening",
  "shortlisted",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
];

export const DEFAULT_APPLICATION_STAGE: ApplicationStage = "received";

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
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

function mapApplicationDoc(doc: FirebaseFirestore.DocumentSnapshot): CareerApplication {
  const d = doc.data() ?? {};
  const candidate = {
    id: d.candidateId ?? "",
    fullName: d.fullName ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    city: d.city ?? "",
    applicationsCount: d.candidateApplicationsCount ?? 0,
    lastApplicationAt:
      d.candidateLastApplicationAt?.toDate?.()?.toISOString() ?? null,
    createdAt: d.candidateCreatedAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.candidateUpdatedAt?.toDate?.()?.toISOString() ?? null,
  };

  return {
    id: doc.id,
    jobId: d.jobId ?? d.role?.jobId ?? "",
    jobTitle: d.jobTitle ?? d.role?.jobTitle ?? "",
    jobSlug: d.role?.jobSlug ?? "",
    role: {
      jobId: d.role?.jobId ?? d.jobId ?? "",
      jobSlug: d.role?.jobSlug ?? "",
      jobTitle: d.role?.jobTitle ?? d.jobTitle ?? "",
    },
    candidateId: d.candidateId ?? "",
    candidate,
    fullName: d.fullName ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    city: d.city ?? "",
    studentStatus:
      typeof d.studentStatus === "boolean" ? d.studentStatus : false,
    isStudent:
      typeof d.studentStatus === "boolean"
        ? d.studentStatus
        : Boolean(d.isStudent),
    studentDetails: d.studentDetails ?? null,
    experienceDetails: d.experienceDetails ?? null,
    motivationAnswers: d.motivationAnswers ?? {
      whyJoinKnytra: d.motivationAnswers?.whyJoinKnytra ?? "",
      whyThisRole: d.motivationAnswers?.whyThisRole ?? "",
      relevantExperience: d.motivationAnswers?.relevantExperience ?? "",
    },
    assessmentAnswers: d.assessmentAnswers ?? { messageToCandidate: "" },
    customAnswers: d.customAnswers ?? {},
    availability: d.availability ?? {
      availableDuration: false,
      performanceBased: false,
      hybridModel: false,
      hoursPerDay: "",
    },
    declaration: d.declaration ?? {
      infoCorrect: false,
      understandsPerformanceBased: false,
    },
    status: d.status ?? "received",
    stage: d.stage ?? (d.status as ApplicationStage) ?? "received",
    evaluation: d.evaluation ?? {
      rating: 0,
      strengths: "",
      weaknesses: "",
      notes: "",
    },
    notes: Array.isArray(d.notes) ? d.notes : [],
    timeline: Array.isArray(d.timeline) ? d.timeline : [],
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
  slug: string,
  adminView = false,
): Promise<CareerJob | null> {
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

  await docRef.update(updates);
  return true;
}

export async function deleteJob(id: string) {
  const db = getAdminDb();
  await db.collection("careers_jobs").doc(id).delete();
}

export async function getCandidateByEmail(
  email: string,
): Promise<CareerCandidate | null> {
  const db = getAdminDb();
  const lower = email.trim().toLowerCase();
  const snap = await db
    .collection("careers_candidates")
    .where("email", "==", lower)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  const d = doc.data();
  return {
    id: doc.id,
    fullName: d.fullName ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    city: d.city ?? "",
    applicationsCount: d.applicationsCount ?? 0,
    lastApplicationAt: d.lastApplicationAt?.toDate?.()?.toISOString() ?? null,
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

export async function getCandidateById(
  id: string,
): Promise<CareerCandidate | null> {
  const db = getAdminDb();
  const snap = await db.collection("careers_candidates").doc(id).get();
  if (!snap.exists) return null;
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    fullName: d.fullName ?? "",
    email: d.email ?? "",
    phone: d.phone ?? "",
    city: d.city ?? "",
    applicationsCount: d.applicationsCount ?? 0,
    lastApplicationAt: d.lastApplicationAt?.toDate?.()?.toISOString() ?? null,
    createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
}

export async function createOrUpdateCandidate(
  partial: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
  },
): Promise<CareerCandidate> {
  const db = getAdminDb();
  const lower = partial.email.trim().toLowerCase();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const snap = await db
    .collection("careers_candidates")
    .where("email", "==", lower)
    .limit(1)
    .get();

  if (!snap.empty) {
    const doc = snap.docs[0];
    const values = {
      fullName: partial.fullName.trim(),
      phone: partial.phone.replace(/\D/g, "").slice(-10),
      city: partial.city.trim(),
      updatedAt: now,
    };
    await db.collection("careers_candidates").doc(doc.id).update(values);
    return {
      id: doc.id,
      fullName: values.fullName,
      email: lower,
      phone: values.phone,
      city: values.city,
      applicationsCount: doc.data().applicationsCount ?? 0,
      lastApplicationAt:
        doc.data().lastApplicationAt?.toDate?.()?.toISOString() ?? null,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: new Date().toISOString(),
    };
  }

  const docRef = await db.collection("careers_candidates").add({
    fullName: partial.fullName.trim(),
    email: lower,
    phone: partial.phone.replace(/\D/g, "").slice(-10),
    city: partial.city.trim(),
    applicationsCount: 0,
    lastApplicationAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: docRef.id,
    fullName: partial.fullName.trim(),
    email: lower,
    phone: partial.phone.replace(/\D/g, "").slice(-10),
    city: partial.city.trim(),
    applicationsCount: 0,
    lastApplicationAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function createApplication(
  body: {
    role: ApplicationRole;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    studentStatus: boolean;
    studentDetails: Record<string, unknown> | null;
    experienceDetails: Record<string, unknown> | null;
    motivationAnswers: Record<string, string> | null;
    assessmentAnswers: Record<string, string> | null;
    customAnswers: Record<string, string>;
    availability: {
      availableDuration: boolean;
      performanceBased: boolean;
      hybridModel: boolean;
      hoursPerDay: string;
    };
    declaration: {
      infoCorrect: boolean;
      understandsPerformanceBased: boolean;
    };
  },
) {
  const db = getAdminDb();
  const job = await getJobById(body.role.jobId, false);
  if (!job) {
    throw new Error("This position is no longer accepting applications.");
  }
  if (body.role.jobSlug !== job.slug) {
    throw new Error("Role slug mismatch.");
  }

  const candidate = await createOrUpdateCandidate({
    fullName: body.fullName,
    email: body.email,
    phone: body.phone,
    city: body.city,
  });

  const dupeSnap = await db
    .collection("careers_applications")
    .where("candidateId", "==", candidate.id)
    .where("jobId", "==", job.id)
    .limit(1)
    .get();

  if (!dupeSnap.empty) {
    throw new Error("You have already applied for this position.");
  }

  const now = admin.firestore.FieldValue.serverTimestamp();
  const docRef = await db.collection("careers_applications").add({
    jobId: job.id,
    jobTitle: job.title,
    role: {
      jobId: job.id,
      jobSlug: job.slug,
      jobTitle: job.title,
    },
    candidateId: candidate.id,
    fullName: body.fullName.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone.replace(/\D/g, "").slice(-10),
    city: body.city.trim(),
    studentStatus: body.studentStatus,
    isStudent: body.studentStatus,
    studentDetails: body.studentStatus ? body.studentDetails : null,
    experienceDetails: body.studentStatus ? null : body.experienceDetails,
    motivationAnswers: body.motivationAnswers ?? null,
    assessmentAnswers: body.assessmentAnswers ?? null,
    customAnswers: body.customAnswers ?? {},
    availability: {
      availableDuration: body.availability.availableDuration,
      performanceBased: body.availability.performanceBased,
      hybridModel: body.availability.hybridModel,
      hoursPerDay: body.availability.hoursPerDay.trim(),
    },
    declaration: body.declaration,
    status: "received",
    stage: "received",
    evaluation: {
      rating: 0,
      strengths: "",
      weaknesses: "",
      notes: "",
    },
    notes: [],
    timeline: [
      {
        status: "received",
        action: "application_submitted",
        note: "Application submitted",
        author: "System",
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  await db.collection("careers_candidates").doc(candidate.id).update({
    applicationsCount: admin.firestore.FieldValue.increment(1),
    lastApplicationAt: now,
    lastApplicationId: docRef.id,
    updatedAt: now,
  });

  return { id: docRef.id };
}

export async function getApplications(
  filters: ApplicationFilters = {},
): Promise<CareerApplication[]> {
  const db = getAdminDb();
  let query: FirebaseFirestore.Query = db
    .collection("careers_applications")
    .orderBy("createdAt", "desc");

  if (filters.status) query = query.where("status", "==", filters.status);
  if (filters.jobId) query = query.where("jobId", "==", filters.jobId);
  if (filters.stage) query = query.where("stage", "==", filters.stage);

  const snap = await query.get();
  let applications = snap.docs.map(mapApplicationDoc);

  if (filters.search) {
    const normalized = filters.search.trim().toLowerCase();
    applications = applications.filter((app) =>
      [app.fullName, app.email, app.phone, app.city, app.jobTitle]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }

  return applications;
}

export async function getApplicationById(
  id: string,
): Promise<CareerApplication | null> {
  const db = getAdminDb();
  const snap = await db.collection("careers_applications").doc(id).get();
  if (!snap.exists) return null;
  return mapApplicationDoc(snap);
}

export async function updateApplication(
  id: string,
  payload: {
    status?: ApplicationStatus;
    stage?: ApplicationStage;
    note?: string;
    statusNote?: string;
    evaluation?: ApplicationEvaluation;
    candidate?: {
      fullName?: string;
      phone?: string;
      city?: string;
    };
    author: string;
  },
): Promise<CareerApplication | null> {
  const db = getAdminDb();
  const docRef = db.collection("careers_applications").doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;

  const current = snap.data() ?? {};
  const updates: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const timeline = Array.isArray(current.timeline) ? [...current.timeline] : [];

  if (payload.status && payload.status !== current.status) {
    updates.status = payload.status;
    timeline.push({
      status: payload.status,
      action: "status_change",
      note:
        payload.statusNote?.trim() ||
        `Status moved to ${payload.status}`,
      author: payload.author,
      createdAt: new Date().toISOString(),
    });
  }

  if (payload.stage && payload.stage !== current.stage) {
    updates.stage = payload.stage;
    timeline.push({
      status: payload.status ?? current.status ?? "received",
      action: "stage_change",
      note: `Moved to ${payload.stage}`,
      author: payload.author,
      createdAt: new Date().toISOString(),
    });
    if (!payload.status) updates.status = payload.stage;
  }

  if (payload.note && payload.note.trim()) {
    updates.notes = [
      ...(Array.isArray(current.notes) ? current.notes : []),
      {
        text: payload.note.trim(),
        author: payload.author,
        createdAt: new Date().toISOString(),
      },
    ];
    timeline.push({
      status: current.status ?? "received",
      action: "note_added",
      note: payload.note.trim(),
      author: payload.author,
      createdAt: new Date().toISOString(),
    });
  }

  if (payload.evaluation) {
    updates.evaluation = {
      rating: payload.evaluation.rating ?? 0,
      strengths: payload.evaluation.strengths ?? "",
      weaknesses: payload.evaluation.weaknesses ?? "",
      notes: payload.evaluation.notes ?? "",
    };
  }

  if (payload.candidate && current.candidateId) {
    await db.collection("careers_candidates").doc(current.candidateId).update({
      ...payload.candidate,
      city: payload.candidate.city?.trim() ?? current.city,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  if (timeline.length > 0) {
    updates.timeline = timeline;
  }

  await docRef.update(updates);
  const updated = await docRef.get();
  return mapApplicationDoc(updated);
}

export async function getAnalyticsOverview() {
  const apps = await getApplications();
  const jobs = await getAllJobs(true);
  const stageCounts = apps.reduce<Record<ApplicationStage, number>>(
    (acc, app) => {
      const stage = app.stage ?? "received";
      acc[stage] = (acc[stage] ?? 0) + 1;
      return acc;
    },
    APPLICATION_PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {} as Record<ApplicationStage, number>),
  );

  const statusCounts = apps.reduce<Record<ApplicationStatus, number>>(
    (acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    },
    APPLICATION_PIPELINE_STAGES.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<ApplicationStatus, number>),
  );

  return {
    totalApplications: apps.length,
    openJobs: jobs.filter((job) => job.status === "open").length,
    activeJobs: jobs.length,
    byStage: stageCounts,
    byStatus: statusCounts,
    recentApplications: apps.slice(0, 8),
  };
}

export async function getPipelineBoard(jobId?: string) {
  const apps = await getApplications({ jobId });
  return APPLICATION_PIPELINE_STAGES.map((stage) => ({
    stage,
    label: stage,
    applications: apps.filter((app) => app.stage === stage),
  }));
}
