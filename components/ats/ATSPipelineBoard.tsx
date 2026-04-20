"use client";

import { useMemo, useState, type DragEvent } from "react";
import type {
  CareerApplication,
  ApplicationStatus,
} from "@/lib/types/careers";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
} from "@/lib/types/careers";
import styles from "./ATSPipelineBoard.module.css";

interface Props {
  applications: CareerApplication[];
  onMove: (applicationId: string, nextStage: ApplicationStatus) => Promise<void>;
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
      APPLICATION_STATUS_ORDER.reduce((acc, status) => {
        acc[status] = [] as CareerApplication[];
        return acc;
      }, {} as Record<ApplicationStatus, CareerApplication[]>),
    [],
  );

  applications.forEach((application) => {
    const stage = application.stage || application.status || "received";
    if (!buckets[stage]) buckets[stage] = [];
    buckets[stage].push(application);
  });

  function handleDrop(event: DragEvent<HTMLDivElement>, stage: ApplicationStatus) {
    event.preventDefault();
    if (!draggingId) return;
    onMove(draggingId, stage).catch(() => {
      // ignore, error handled elsewhere
    });
    setDraggingId(null);
  }

  return (
    <div className={styles.pipelineBoard}>
      {APPLICATION_STATUS_ORDER.map((status) => (
        <div
          key={status}
          className={styles.pipelineColumn}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, status)}
        >
          <div className={styles.pipelineHeader}>
            <span>{APPLICATION_STATUS_LABELS[status]}</span>
            <span className={styles.pipelineCount}>
              {buckets[status]?.length ?? 0}
            </span>
          </div>
          <div className={styles.pipelineList}>
            {buckets[status]?.map((application) => (
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
