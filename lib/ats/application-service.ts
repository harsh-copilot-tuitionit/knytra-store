/**
 * Returns true if the given email type has already been sent for this application.
 */
type ApplicationEmailLog = {
  type: string;
  to: string;
  subject: string;
  sentAt: string;
  sentBy: string;
  provider: string;
  success: boolean;
};
export async function hasApplicationEmailBeenSent(id: string, type: string): Promise<boolean> {
  const db = getAdminDb();
  const snap = await db.collection("careers_applications").doc(id).get();
  if (!snap.exists) return false;
  const current = snap.data() || {};
  const emailLogs = Array.isArray(current.emailLogs) ? current.emailLogs as ApplicationEmailLog[] : [];
  return emailLogs.some((log) => log && log.type === type && log.success);
}
import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import type {
  CareerApplication,
  ApplicationFilters,
  ApplicationRole,
  ApplicationEvaluation,
  ApplicationStage,
} from "@/lib/types/careers";
import { getJobById } from "./job-service";
import { createOrUpdateCandidate } from "./candidate-service";
import { mapApplicationDoc } from "./application-mapper";
import { moveApplicationStage } from "./stage-service";
import {
  APPLICATION_PIPELINE_STAGES,
  DEFAULT_APPLICATION_STATUS,
  isStageInPipeline,
} from "./constants";

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
  const firstStage = job.pipelineStages?.[0] ?? APPLICATION_PIPELINE_STAGES[0];
  const initialStage = isStageInPipeline(firstStage, job.pipelineStages)
    ? firstStage
    : APPLICATION_PIPELINE_STAGES[0];

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
    status: DEFAULT_APPLICATION_STATUS,
    currentStage: initialStage,
    stage: initialStage,
    stageHistory: [
      {
        fromStage: "none",
        toStage: initialStage,
        changedAt: new Date().toISOString(),
        changedBy: "System",
        note: "Application entered pipeline",
      },
    ],
    evaluation: {
      rating: 0,
      strengths: "",
      weaknesses: "",
      notes: "",
    },
    notes: [],
    timeline: [
      {
        status: initialStage,
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

function applyDateFilters(
  query: FirebaseFirestore.Query,
  filters: ApplicationFilters,
): FirebaseFirestore.Query {
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom);
    if (!Number.isNaN(from.getTime())) {
      query = query.where("createdAt", ">=", from);
    }
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo);
    if (!Number.isNaN(to.getTime())) {
      query = query.where("createdAt", "<=", to);
    }
  }
  return query;
}

function matchesSearch(app: CareerApplication, search?: string): boolean {
  if (!search?.trim()) return true;

  const normalized = search.trim().toLowerCase();

  return [
    app.fullName,
    app.email,
    app.phone,
    app.city,
    app.jobTitle,
    app.role?.jobTitle,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(normalized);
}

function applyPagination(
  applications: CareerApplication[],
  filters: ApplicationFilters,
): CareerApplication[] {
  const offset = typeof filters.offset === "number" ? filters.offset : 0;
  const limit =
    typeof filters.limit === "number" ? filters.limit : applications.length;

  return applications.slice(offset, offset + limit);
}

export async function getApplications(
  filters: ApplicationFilters = {},
): Promise<CareerApplication[]> {
  const result = await getApplicationsPage(filters);
  return result.applications;
}

export async function getApplicationsPage(
  filters: ApplicationFilters = {},
): Promise<{ applications: CareerApplication[]; total: number }> {
  const db = getAdminDb();
  let query: FirebaseFirestore.Query = db
    .collection("careers_applications")
    .orderBy("createdAt", "desc");

  query = applyDateFilters(query, filters);

  const snap = await query.get();
  let applications = snap.docs.map(mapApplicationDoc);

  if (filters.stage) {
    applications = applications.filter(
      (app) =>
        app.currentStage === filters.stage || app.stage === filters.stage,
    );
  }

  if (filters.jobId) {
    applications = applications.filter(
      (app) => app.jobId === filters.jobId || app.role?.jobId === filters.jobId,
    );
  }

  applications = applications.filter((app) => matchesSearch(app, filters.search));

  const total = applications.length;
  return { applications: applyPagination(applications, filters), total };
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
    stage?: ApplicationStage;
    note?: string;
    evaluation?: ApplicationEvaluation;
    candidate?: {
      fullName?: string;
      phone?: string;
      city?: string;
    };
    author: string;
  },
): Promise<CareerApplication | null> {
  const currentApp = await getApplicationById(id);
  if (!currentApp) return null;

  if (payload.stage && payload.stage !== currentApp.stage) {
    return moveApplicationStage(id, payload.stage, {
      author: payload.author,
      note: payload.note,
    });
  }

  const db = getAdminDb();
  const docRef = db.collection("careers_applications").doc(id);
  const current = currentApp;
  const updates: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const timeline = Array.isArray(current.timeline) ? [...current.timeline] : [];

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
      status: current.currentStage ?? current.stage ?? "received",
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

export async function logApplicationEmail(id: string, log: {
  type: string;
  to: string;
  subject: string;
  sentAt: string;
  sentBy: string;
  provider: string;
  success: boolean;
}) {
  const db = getAdminDb();
  const docRef = db.collection("careers_applications").doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return;
  const current = snap.data() || {};
  const emailLogs = Array.isArray(current.emailLogs) ? [...current.emailLogs] : [];
  emailLogs.push(log);
  await docRef.update({ emailLogs });
}
