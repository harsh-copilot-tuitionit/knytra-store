"use client";

import Link from "next/link";
import { ArrowRight, Users, Briefcase, CheckCircle, Clock } from "lucide-react";
import { useATS } from "@/hooks/ats/useATS";
import ATSPipelineBoard from "@/components/ats/ATSPipelineBoard";
import styles from "@/app/careers/admin/careersAdmin.module.css";

export default function ATSDashboard() {
  const { applications, jobs, summary, loading, reload, moveStage } = useATS();

  if (loading) {
    return <p>Loading ATS dashboard...</p>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Recruitment Dashboard</h1>
        <p className={styles.pageSubtitle}>
          A single ATS engine powering your jobs, applications, and candidate pipeline.
        </p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Applications</span>
            <Users size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{summary?.totalApplications ?? 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Open Positions</span>
            <Briefcase size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{summary?.openJobs ?? 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Active Jobs</span>
            <CheckCircle size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{summary?.activeJobs ?? 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Pipeline Stages</span>
            <Clock size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>
            {Object.values(summary?.byStage ?? {}).reduce((sum, value) => sum + value, 0)}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className={styles.pageHeaderRow}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 500 }}>
            Application Pipeline
          </h2>
          <div>
            <button type="button" className={styles.btnSecondary} onClick={() => void reload()}>
              Refresh
            </button>
            <Link href="/careers/admin/applications" className={styles.btnSecondary} style={{ marginLeft: 12 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <ATSPipelineBoard
        applications={applications}
        onMove={moveStage}
        onView={(id) => window.location.assign(`/careers/admin/applications/${id}`)}
      />

      <div style={{ marginTop: 24 }}>
        <div className={styles.pageHeaderRow}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 500 }}>
            Open Roles
          </h2>
          <Link href="/careers/admin/jobs" className={styles.btnSecondary}>
            Manage Jobs <ArrowRight size={14} />
          </Link>
        </div>
        <div className={styles.tableCard} style={{ marginTop: 16 }}>
          {jobs.length > 0 ? (
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
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link href={`/careers/admin/jobs/${job.id}`} className={styles.tableLink}>
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
              <p>No open positions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
