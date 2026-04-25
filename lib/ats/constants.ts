import type { ApplicationStage, ApplicationStatus, ApplicationStageHistoryEntry } from "@/lib/types/careers";

export const APPLICATION_PIPELINE_STAGES: ApplicationStage[] = [
  "received",
  "screening",
  "shortlisted",
  "assessment",
  "interview",
  "offer",
  "hired",
  "rejected",
];

export const DEFAULT_APPLICATION_STAGE: ApplicationStage = "received";
export const DEFAULT_APPLICATION_STATUS: ApplicationStatus = "new";

export function isStageInPipeline(
  stage: ApplicationStage,
  pipelineStages: ApplicationStage[] = APPLICATION_PIPELINE_STAGES,
) {
  return pipelineStages.includes(stage);
}

export function createStageHistoryEntry(
  fromStage: ApplicationStage | "none",
  toStage: ApplicationStage,
  changedBy: string,
  note?: string,
) {
  const trimmed = note?.trim();
  const entry: ApplicationStageHistoryEntry = {
    fromStage,
    toStage,
    changedAt: new Date().toISOString(),
    changedBy: changedBy || "System",
    ...(trimmed ? { note: trimmed } : {}),
  };
  return entry;
}

export function createTimelineEntry(
  status: ApplicationStatus,
  action: string,
  note: string,
  author: string,
) {
  return {
    status,
    action,
    note,
    author,
    createdAt: new Date().toISOString(),
  };
}
