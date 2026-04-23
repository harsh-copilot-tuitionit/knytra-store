import type {
  CareerApplication,
  ApplicationStage,
  ApplicationStatus,
} from "@/lib/types/careers";
import {
  APPLICATION_PIPELINE_STAGES,
  DEFAULT_APPLICATION_STAGE,
  DEFAULT_APPLICATION_STATUS,
} from "./constants";

export function mapApplicationDoc(
  doc: FirebaseFirestore.DocumentSnapshot,
): CareerApplication {
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
      jobSlug: d.role?.jobSlug ?? d.jobSlug ?? "",
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
    status:
      typeof d.status === "string"
        ? (d.status as ApplicationStatus)
        : DEFAULT_APPLICATION_STATUS,
    currentStage:
      (d.currentStage as ApplicationStage) ??
      (d.stage as ApplicationStage) ??
      (typeof d.status === "string" &&
      APPLICATION_PIPELINE_STAGES.includes(d.status as ApplicationStage)
        ? (d.status as ApplicationStage)
        : undefined) ??
      DEFAULT_APPLICATION_STAGE,
    stage:
      (d.stage as ApplicationStage) ??
      (d.currentStage as ApplicationStage) ??
      (typeof d.status === "string" &&
      APPLICATION_PIPELINE_STAGES.includes(d.status as ApplicationStage)
        ? (d.status as ApplicationStage)
        : undefined) ??
      DEFAULT_APPLICATION_STAGE,
    stageHistory: Array.isArray(d.stageHistory) ? d.stageHistory : [],
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
