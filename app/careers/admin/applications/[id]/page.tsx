"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type {
  CareerApplication,
  ApplicationStage,
} from "@/lib/types/careers";
import {
  APPLICATION_STAGE_LABELS,
  APPLICATION_STAGE_ORDER,
} from "@/lib/types/careers";
import styles from "../../CareersAdminPage.module.css";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [app, setApp] = useState<CareerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStage, setNewStage] = useState("");
  const [stageNote, setStageNote] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/careers/applications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApp(data);
        setNewStage(data.currentStage ?? data.stage ?? "received");
      } else if (res.status === 404) {
        router.replace("/careers/admin/applications");
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStageUpdate() {
    if (!newStage || newStage === (app?.currentStage ?? app?.stage)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/careers/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: newStage,
          note: stageNote || undefined,
        }),
      });
      if (res.ok) {
        const { application: updated } = await res.json();
        setApp(updated);
        setStageNote("");
        setNewStage(updated.currentStage ?? updated.stage ?? "received");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote() {
    if (!note.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/careers/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (res.ok) {
        setNote("");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  function getBadgeClass(stage: string): string {
    const map: Record<string, string> = {
      received: styles.badgeReceived,
      screening: styles.badgeScreening,
      shortlisted: styles.badgeShortlisted,
      interview: styles.badgeInterview,
      assessment: styles.badgeAssessment,
      offer: styles.badgeOffer,
      hired: styles.badgeHired,
      rejected: styles.badgeRejected,
    };
    return map[stage] ?? styles.badgeReceived;
  }

  if (loading) {
    return (
      <div>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!app) return null;

  // Pipeline progress
  const currentStage: ApplicationStage =
    app.currentStage ??
    app.stage ?? "received";
  const currentIdx = APPLICATION_STAGE_ORDER.indexOf(currentStage);
  const isRejected = currentStage === "rejected";

  return (
    <div>
      <Link href="/careers/admin/applications" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to Applications
      </Link>

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderRow}>
          <div>
            <h1 className={styles.pageTitle}>{app.fullName}</h1>
            <p className={styles.pageSubtitle}>
              Applied for {app.role?.jobTitle ?? "—"}
            </p>
          </div>
          <span
            className={`${styles.badge} ${getBadgeClass(currentStage)}`}
            style={{ fontSize: 13, padding: "6px 14px" }}
          >
            {APPLICATION_STAGE_LABELS[currentStage] ?? currentStage}
          </span>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <div className={styles.pipeline}>
          {APPLICATION_STAGE_ORDER.map((s, i) => {
            let stepClass = styles.pipelineStep;
            if (isRejected) {
              stepClass += ` ${styles.pipelineStepRejected}`;
            } else if (i < currentIdx) {
              stepClass += ` ${styles.pipelineStepActive}`;
            } else if (i === currentIdx) {
              stepClass += ` ${styles.pipelineStepCurrent}`;
            }
            return <div key={s} className={stepClass} />;
          })}
        </div>
        <div className={styles.pipelineLabels}>
          {APPLICATION_STAGE_ORDER.map((s, i) => (
            <span
              key={s}
              className={`${styles.pipelineLabel} ${i <= currentIdx ? styles.pipelineLabelActive : ""}`}
              style={{ fontSize: 9 }}
            >
              {APPLICATION_STAGE_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.detailGrid}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Candidate Info</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Full Name</span>
              <span className={styles.infoValue}>{app.fullName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <a
                href={`mailto:${app.email}`}
                className={`${styles.infoValue} ${styles.infoLink}`}
              >
                {app.email}
              </a>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Phone</span>
              <a
                href={`tel:+91${app.phone}`}
                className={`${styles.infoValue} ${styles.infoLink}`}
              >
                {app.phone}
              </a>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>City</span>
              <span className={styles.infoValue}>{app.city || "—"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Role</span>
              <span className={styles.infoValue}>{app.role?.jobTitle ?? "—"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Applied</span>
              <span className={styles.infoValue}>
                {app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>

          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Background</h3>
            {app.isStudent ? (
              <div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Institute</span>
                  <span className={styles.infoValue}>
                    {app.studentDetails?.institute ?? "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>University</span>
                  <span className={styles.infoValue}>
                    {app.studentDetails?.university ?? "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Course</span>
                  <span className={styles.infoValue}>
                    {app.studentDetails?.course ?? "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Specialization</span>
                  <span className={styles.infoValue}>
                    {app.studentDetails?.specialization ?? "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Current Year</span>
                  <span className={styles.infoValue}>
                    {app.studentDetails?.currentYear ?? "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Year of Completion</span>
                  <span className={styles.infoValue}>
                    {app.studentDetails?.completionYear ?? "—"}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Highest Qualification</span>
                  <span className={styles.infoValue}>
                    {app.experienceDetails?.highestQualification ?? "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Current Status</span>
                  <span className={styles.infoValue}>
                    {app.experienceDetails?.currentStatus ?? "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Current / Last Company</span>
                  <span className={styles.infoValue}>
                    {app.experienceDetails?.company ?? "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Role</span>
                  <span className={styles.infoValue}>
                    {app.experienceDetails?.role ?? "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Experience</span>
                  <span className={styles.infoValue}>
                    {app.experienceDetails?.experience ?? "—"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Motivation</h3>
            <p className={styles.coverLetter}>
              {app.motivationAnswers?.whyJoinKnytra || app.motivationAnswers?.whyHRGrowth || "—"}
            </p>
            {app.motivationAnswers?.whyThisRole && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Why this role</span>
                <span className={styles.infoValue}>
                  {app.motivationAnswers.whyThisRole}
                </span>
              </div>
            )}
            {app.motivationAnswers?.relevantExperience && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Relevant experience</span>
                <span className={styles.infoValue}>
                  {app.motivationAnswers.relevantExperience}
                </span>
              </div>
            )}
          </div>

          {app.assessmentAnswers?.messageToCandidate ? (
            <div className={styles.detailCard}>
              <h3 className={styles.detailCardTitle}>Assessment</h3>
              <p className={styles.coverLetter}>
                {app.assessmentAnswers.messageToCandidate}
              </p>
            </div>
          ) : null}

          {app.customAnswers && Object.keys(app.customAnswers).length > 0 ? (
            <div className={styles.detailCard}>
              <h3 className={styles.detailCardTitle}>Additional Answers</h3>
              {Object.entries(app.customAnswers).map(([question, answer], index) => (
                <div className={styles.infoRow} key={index}>
                  <span className={styles.infoLabel}>{question}</span>
                  <span className={styles.infoValue}>{answer || "—"}</span>
                </div>
              ))}
            </div>
          ) : null}

          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Availability</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Available for full duration</span>
              <span className={styles.infoValue}>
                {app.availability?.availableDuration ? "Yes" : "No"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Performance-based internship</span>
              <span className={styles.infoValue}>
                {app.availability?.performanceBased ? "Yes" : "No"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Hybrid model comfortable</span>
              <span className={styles.infoValue}>
                {app.availability?.hybridModel ? "Yes" : "No"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Hours per day</span>
              <span className={styles.infoValue}>
                {app.availability?.hoursPerDay || "—"}
              </span>
            </div>
          </div>

          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Declarations</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Information correct</span>
              <span className={styles.infoValue}>
                {app.declaration?.infoCorrect ? "Yes" : "No"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Understands performance-based nature</span>
              <span className={styles.infoValue}>
                {app.declaration?.understandsPerformanceBased ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Timeline</h3>
            {app.timeline && app.timeline.length > 0 ? (
              <div className={styles.timelineList}>
                {[...app.timeline].reverse().map((entry, i) => (
                  <div key={i} className={styles.timelineEntry}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineEntryStatus}>
                        <span
                          className={`${styles.badge} ${getBadgeClass(entry.status)}`}
                          style={{ marginRight: 8 }}
                        >
                          {APPLICATION_STAGE_LABELS[entry.status as ApplicationStage] ?? entry.status}
                        </span>
                      </div>
                      {entry.note && (
                        <p className={styles.timelineEntryNote}>
                          {entry.note}
                        </p>
                      )}
                      <p className={styles.timelineEntryMeta}>
                        {entry.author} &middot; {new Date(entry.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--color-white-40)", fontSize: 14 }}>
                No timeline entries yet.
              </p>
            )}
          </div>
        </div>

        {/* Right column — Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
          {/* Update Stage */}
          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Update Stage</h3>
            <div className={styles.statusSelect}>
              <select
                className={styles.statusSelectControl}
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
              >
                {APPLICATION_STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {APPLICATION_STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
              <textarea
                className={styles.noteTextarea}
                placeholder="Add a note for this stage change..."
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
              />
              <button
                className={styles.btnPrimary}
                onClick={() => void handleStageUpdate()}
                disabled={saving || newStage === (app.currentStage ?? app.stage)}
                style={{ width: "100%" }}
              >
                {saving ? "Updating..." : "Update Stage"}
              </button>
            </div>
          </div>

          {/* Add Note */}
          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Internal Notes</h3>
            {app.notes && app.notes.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                {[...app.notes].reverse().map((n, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      padding: "10px 12px",
                      borderRadius: 4,
                    }}
                  >
                    <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                      {n.text}
                    </p>
                    <p className={styles.timelineEntryMeta}>
                      {n.author} &middot;{" "}
                      {new Date(n.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.noteInput}>
              <textarea
                className={styles.noteTextarea}
                placeholder="Add an internal note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button
              className={styles.btnSecondary}
              onClick={() => void handleAddNote()}
              disabled={saving || !note.trim()}
              style={{ width: "100%", marginTop: 8 }}
            >
              {saving ? "Saving..." : "Add Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
