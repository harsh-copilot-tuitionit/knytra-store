import * as admin from "firebase-admin";
import { getAdminDb } from "@/lib/firebase-admin";
import type {
  CareerApplication,
  ApplicationStage,
  ApplicationStatus,
} from "@/lib/types/careers";
import { APPLICATION_STATUS_LABELS } from "@/lib/types/careers";
import { getJobById } from "./job-service";
import { mapApplicationDoc } from "./application-mapper";
import {
  APPLICATION_PIPELINE_STAGES,
  DEFAULT_APPLICATION_STAGE,
  DEFAULT_APPLICATION_STATUS,
  createStageHistoryEntry,
  createTimelineEntry,
  isStageInPipeline,
} from "./constants";

export async function moveApplicationStage(
  applicationId: string,
  newStage: ApplicationStage,
  options: {
    author?: string;
    note?: string;
    status?: ApplicationStatus;
  } = {},
): Promise<CareerApplication | null> {
  const db = getAdminDb();
  const docRef = db.collection("careers_applications").doc(applicationId);
  const snap = await docRef.get();
  if (!snap.exists) return null;

  const application = mapApplicationDoc(snap);
  const job = await getJobById(application.jobId, true);
  const pipelineStages = job?.pipelineStages ?? APPLICATION_PIPELINE_STAGES;

  if (!isStageInPipeline(newStage, pipelineStages)) {
    throw new Error(`Stage '${newStage}' is not valid for this role pipeline.`);
  }

  const fromStage = application.stage ?? DEFAULT_APPLICATION_STAGE;
  if (fromStage === newStage) {
    return application;
  }

  let nextStatus: ApplicationStatus = application.status ?? DEFAULT_APPLICATION_STATUS;
  if (options.status) {
    nextStatus = options.status;
  } else if (newStage === "hired") {
    nextStatus = "hired";
  } else if (newStage === "rejected") {
    nextStatus = "rejected";
  } else if (nextStatus === "new") {
    nextStatus = "active";
  }

  const changeNote = options.note?.trim() ||
    `Moved from ${APPLICATION_STATUS_LABELS[fromStage] ?? fromStage} to ${APPLICATION_STATUS_LABELS[newStage] ?? newStage}`;

  const stageHistory = Array.isArray(application.stageHistory)
    ? [...application.stageHistory]
    : [];
  stageHistory.push(
    createStageHistoryEntry(fromStage, newStage, options.author ?? "System", options.note),
  );

  const timeline = Array.isArray(application.timeline)
    ? [...application.timeline]
    : [];
  timeline.push(
    createTimelineEntry(newStage, "stage_change", changeNote, options.author ?? "System"),
  );

  const updates: Record<string, unknown> = {
    stage: newStage,
    currentStage: newStage,
    status: nextStatus,
    stageHistory,
    timeline,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await docRef.update(updates);
  const updated = await docRef.get();
  return mapApplicationDoc(updated);
}
