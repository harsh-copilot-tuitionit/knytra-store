"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import type { CareerJob } from "@/lib/types/careers";
import styles from "../CareersAdminPage.module.css";

export default function JobsPage() {
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/careers/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(data.jobs ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/careers/jobs/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  }

  function getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      open: styles.badgeOpen,
      draft: styles.badgeDraft,
      closed: styles.badgeClosed,
    };
    return map[status] ?? styles.badgeDraft;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderRow}>
          <div>
            <h1 className={styles.pageTitle}>Job Postings</h1>
            <p className={styles.pageSubtitle}>
              {jobs.length} total position{jobs.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/careers/admin/jobs/new"
            className={styles.btnPrimary}
          >
            <Plus size={14} /> New Position
          </Link>
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.emptyTable}>
            <p>Loading...</p>
          </div>
        ) : jobs.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <Link
                      href={`/careers/admin/jobs/${job.id}`}
                      className={styles.tableLink}
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td>{job.department}</td>
                  <td>{job.location}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {job.type.replace("-", " ")}
                  </td>
                  <td>
                    <span
                      className={`${styles.badge} ${getStatusBadge(job.status)}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      className={styles.listRemoveBtn}
                      onClick={() =>
                        void handleDelete(job.id, job.title)
                      }
                      title="Delete job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyTable}>
            <Briefcase size={40} style={{ opacity: 0.4 }} />
            <p>No job postings yet</p>
            <Link
              href="/careers/admin/jobs/new"
              className={styles.btnPrimary}
            >
              Create First Position
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
