"use client";

import { useMemo, useState, type DragEvent } from "react";
import type {
  CareerApplication,
  ApplicationStage,
  ApplicationStatus,
} from "@/lib/types/careers";
import {
  APPLICATION_STAGE_LABELS,
  APPLICATION_STAGE_ORDER,
} from "@/lib/types/careers";
import styles from "./ATSPipelineBoard.module.css";

interface Props {
  applications: CareerApplication[];
  onMove: (applicationId: string, nextStage: ApplicationStage) => Promise<void>;
  onView: (applicationId: string) => void;
}

export default function ATSPipelineBoard({
  applications,
  onMove,
  onView,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const buckets = useMemo(
    () =>
      APPLICATION_STAGE_ORDER.reduce((acc, stage) => {
        acc[stage] = [] as CareerApplication[];
        return acc;
      }, {} as Record<ApplicationStage, CareerApplication[]>),
    [],
  );

  applications.forEach((application) => {
    const stage =
      application.currentStage || application.stage || application.status || "received";
    if (!buckets[stage]) buckets[stage] = [];
    buckets[stage].push(application);
  });

  function handleDrop(event: DragEvent<HTMLDivElement>, stage: ApplicationStage) {
    event.preventDefault();
    if (!draggingId) return;
    onMove(draggingId, stage).catch(() => {
      // ignore, error handled elsewhere
    });
    setDraggingId(null);
  }

  return (
    <div className={styles.pipelineBoard}>
      {APPLICATION_STAGE_ORDER.map((stage) => (
        <div
          key={stage}
          className={styles.pipelineColumn}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, stage)}
        >
          <div className={styles.pipelineHeader}>
            <span>{APPLICATION_STAGE_LABELS[stage]}</span>
            <span className={styles.pipelineCount}>
              {buckets[stage]?.length ?? 0}
            </span>
          </div>
          <div className={styles.pipelineList}>
            {buckets[stage]?.map((application: CareerApplication) => (
              <button
                key={application.id}
                type="button"
                className={styles.pipelineCard}
                draggable
                onDragStart={() => setDraggingId(application.id)}
                onClick={() => onView(application.id)}
              >
                <div className={styles.cardTitle}>{application.fullName}</div>
                <div className={styles.cardMeta}>
                  <span>{application.role.jobTitle}</span>
                  <span>{application.email}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
