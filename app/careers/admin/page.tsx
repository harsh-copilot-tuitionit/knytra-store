"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import type {
  CareerApplication,
  CareerJob,
} from "@/lib/types/careers";
import {
  APPLICATION_STATUS_LABELS,
} from "@/lib/types/careers";
import styles from "./careersAdmin.module.css";

export default function CareersAdminDashboard() {
  const [applications, setApplications] = useState<CareerApplication[]>(
    [],
  );
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [appRes, jobRes] = await Promise.all([
          fetch("/api/careers/applications"),
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
    }
    void load();
  }, []);

  const openJobs = jobs.filter((j) => j.status === "open");
  const received = applications.filter((a) => a.status === "received");
  const inPipeline = applications.filter(
    (a) =>
      a.status !== "received" &&
      a.status !== "hired" &&
      a.status !== "rejected",
  );
  const hired = applications.filter((a) => a.status === "hired");
  const recent = applications.slice(0, 8);

  function getBadgeClass(
    status: string,
  ): string {
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
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Recruitment Dashboard</h1>
        <p className={styles.pageSubtitle}>
          Overview of hiring activity at Knytra.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Applications</span>
            <Users size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{applications.length}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>New (Unreviewed)</span>
            <Clock size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{received.length}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>In Pipeline</span>
            <Briefcase size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{inPipeline.length}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Hired</span>
            <CheckCircle size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{hired.length}</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Open Positions</span>
            <Briefcase size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{openJobs.length}</div>
        </div>
      </div>

      {/* Recent Applications */}
      <div style={{ marginBottom: "var(--sp-8)" }}>
        <div className={styles.pageHeaderRow}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            Recent Applications
          </h2>
          <Link
            href="/careers/admin/applications"
            className={styles.btnSecondary}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.tableCard} style={{ marginTop: 16 }}>
          {recent.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.fullName}</strong>
                      <br />
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--color-white-40)",
                        }}
                      >
                        {app.email}
                      </span>
                    </td>
                    <td>{app.role?.jobTitle ?? "—"}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${getBadgeClass(app.status)}`}
                      >
                        {APPLICATION_STATUS_LABELS[app.status] ??
                          app.status}
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
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyTable}>
              <Users size={40} style={{ opacity: 0.4 }} />
              <p>No applications yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Open Jobs */}
      <div>
        <div className={styles.pageHeaderRow}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            Open Positions
          </h2>
          <Link
            href="/careers/admin/jobs"
            className={styles.btnSecondary}
          >
            Manage Jobs <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.tableCard} style={{ marginTop: 16 }}>
          {openJobs.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {openJobs.map((job) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyTable}>
              <Briefcase size={40} style={{ opacity: 0.4 }} />
              <p>No open positions</p>
              <Link
                href="/careers/admin/jobs/new"
                className={styles.btnPrimary}
              >
                Create First Job
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
