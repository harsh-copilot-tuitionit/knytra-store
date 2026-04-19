"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import type { CareerApplication, CareerJob, ApplicationStatus } from "@/lib/types/careers";
import { APPLICATION_STATUS_LABELS } from "@/lib/types/careers";
import styles from "../careersAdmin.module.css";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (jobFilter) params.set("jobId", jobFilter);

      const [appRes, jobRes] = await Promise.all([
        fetch(`/api/careers/applications?${params}`),
        fetch("/api/careers/jobs"),
      ]);

      if (appRes.ok) {
        const data = await appRes.json();
        setApplications(data.applications ?? []);
      }
      if (jobRes.ok) {
        const data = await jobRes.json();
        setJobs(data.jobs ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, jobFilter]);

  useEffect(() => {
    void load();
  }, [load]);

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
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Applications</h1>
        <p className={styles.pageSubtitle}>
          {applications.length} total application
          {applications.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableFilters}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            <option value="">All Positions</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.emptyTable}>
            <p>Loading...</p>
          </div>
        ) : applications.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Role</th>
                <th>Status</th>
                <th>Applied</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.fullName}</strong>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--color-white-40)",
                      }}
                    >
                      {app.email}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--color-white-40)",
                      }}
                    >
                      {app.phone}
                    </span>
                  </td>
                  <td>{app.city || "—"}</td>
                  <td>{app.role?.jobTitle ?? "—"}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${getBadgeClass(app.status)}`}
                    >
                      {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
                    </span>
                  </td>
                  <td>
                    {app.createdAt
                      ? new Date(app.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <Link
                      href={`/careers/admin/applications/${app.id}`}
                      className={styles.tableLink}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyTable}>
            <Users size={40} style={{ opacity: 0.4 }} />
            <p>No applications match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
