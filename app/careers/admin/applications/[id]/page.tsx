"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type {
  CareerApplication,
  ApplicationStatus,
} from "@/lib/types/careers";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_ORDER,
} from "@/lib/types/careers";
import styles from "../../careersAdmin.module.css";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [app, setApp] = useState<CareerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/careers/applications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApp(data);
        setNewStatus(data.status);
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

  async function handleStatusUpdate() {
    if (!newStatus || newStatus === app?.status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/careers/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          statusNote: statusNote || undefined,
        }),
      });
      if (res.ok) {
        setStatusNote("");
        await load();
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

  function getBadgeClass(status: string): string {
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
    return map[status] ?? styles.badgeReceived;
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
  const currentIdx = APPLICATION_STATUS_ORDER.indexOf(
    app.status as ApplicationStatus,
  );
  const isRejected = app.status === "rejected";

  const allStatuses: ApplicationStatus[] = [
    "received",
    "screening",
    "shortlisted",
    "interview",
    "assessment",
    "offer",
    "hired",
    "rejected",
  ];

  return (
    <div>
      <Link href="/careers/admin/applications" className={styles.backLink}>
        <ArrowLeft size={14} /> Back to Applications
      </Link>

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderRow}>
          <div>
            <h1 className={styles.pageTitle}>{app.name}</h1>
            <p className={styles.pageSubtitle}>
              Applied for {app.jobTitle}
            </p>
          </div>
          <span
            className={`${styles.badge} ${getBadgeClass(app.status)}`}
            style={{ fontSize: 13, padding: "6px 14px" }}
          >
            {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
          </span>
        </div>
      </div>

      {/* Pipeline Progress */}
      <div style={{ marginBottom: "var(--sp-6)" }}>
        <div className={styles.pipeline}>
          {APPLICATION_STATUS_ORDER.map((s, i) => {
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
          {APPLICATION_STATUS_ORDER.map((s, i) => (
            <span
              key={s}
              className={`${styles.pipelineLabel} ${i <= currentIdx ? styles.pipelineLabelActive : ""}`}
              style={{ fontSize: 9 }}
            >
              {APPLICATION_STATUS_LABELS[s]}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.detailGrid}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-6)" }}>
          {/* Candidate info */}
          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Candidate Info</h3>
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
            {app.currentRole && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Current Role</span>
                <span className={styles.infoValue}>
                  {app.currentRole}
                </span>
              </div>
            )}
            {app.experience && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Experience</span>
                <span className={styles.infoValue}>
                  {app.experience}
                </span>
              </div>
            )}
            {app.linkedIn && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>LinkedIn</span>
                <a
                  href={app.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.infoValue} ${styles.infoLink}`}
                >
                  Profile
                </a>
              </div>
            )}
            {app.resumeUrl && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Resume</span>
                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.infoValue} ${styles.infoLink}`}
                >
                  View Resume
                </a>
              </div>
            )}
            {app.portfolioUrl && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Portfolio</span>
                <a
                  href={app.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.infoValue} ${styles.infoLink}`}
                >
                  View Portfolio
                </a>
              </div>
            )}
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

          {/* Cover Letter */}
          {app.coverLetter && (
            <div className={styles.detailCard}>
              <h3 className={styles.detailCardTitle}>Cover Letter</h3>
              <p className={styles.coverLetter}>{app.coverLetter}</p>
            </div>
          )}

          {/* Timeline */}
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
                          {APPLICATION_STATUS_LABELS[
                            entry.status as ApplicationStatus
                          ] ?? entry.status}
                        </span>
                      </div>
                      {entry.note && (
                        <p className={styles.timelineEntryNote}>
                          {entry.note}
                        </p>
                      )}
                      <p className={styles.timelineEntryMeta}>
                        {entry.author} &middot;{" "}
                        {new Date(entry.createdAt).toLocaleString("en-IN")}
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
          {/* Update Status */}
          <div className={styles.detailCard}>
            <h3 className={styles.detailCardTitle}>Update Status</h3>
            <div className={styles.statusSelect}>
              <select
                className={styles.statusSelectControl}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>
                    {APPLICATION_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <textarea
                className={styles.noteTextarea}
                placeholder="Add a note for this status change..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
              <button
                className={styles.btnPrimary}
                onClick={() => void handleStatusUpdate()}
                disabled={saving || newStatus === app.status}
                style={{ width: "100%" }}
              >
                {saving ? "Updating..." : "Update Status"}
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
