"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Briefcase,
  Sparkles,
  Activity,
} from "lucide-react";
import { useATS } from "@/hooks/ats/useATS";
import styles from "@/app/careers/admin/careersAdmin.module.css";
import dashboardStyles from "./ATSDashboard.module.css";

const PIPELINE_STAGES = [
  "received",
  "screening",
  "shortlisted",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
] as const;

const STAGE_LABELS: Record<string, string> = {
  received: "Received",
  screening: "Screening",
  shortlisted: "Shortlisted",
  interview: "Interview",
  assessment: "Assessment",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export default function ATSDashboard() {
  const { applications, jobs, summary, loading, reload, moveStage } = useATS();

  const totalCandidates = useMemo(
    () => new Set(applications.map((application) => application.candidateId)).size,
    [applications],
  );

  const recentApplications = useMemo(
    () =>
      [...applications]
        .sort((a, b) => (b.createdAt ?? "")?.localeCompare(a.createdAt ?? ""))
        .slice(0, 5),
    [applications],
  );

  const recentActivity = useMemo(() => {
    const feed = applications
      .flatMap((application) =>
        (application.timeline ?? []).map((entry) => ({
          ...entry,
          applicationId: application.id,
          candidateName: application.fullName,
          jobTitle: application.jobTitle,
        })),
      )
      .filter((entry) => entry.createdAt)
      .sort((a, b) => (b.createdAt! > a.createdAt! ? 1 : -1));

    return feed.slice(0, 5);
  }, [applications]);

  const jobApplicationCounts = useMemo(() => {
    return applications.reduce<Record<string, number>>((acc, application) => {
      acc[application.jobId] = (acc[application.jobId] ?? 0) + 1;
      return acc;
    }, {});
  }, [applications]);

  const pipelineBuckets = useMemo(() => {
    return PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = applications
        .filter((application) => (application.stage || application.status || "received") === stage)
        .slice(0, 2);
      return acc;
    }, {} as Record<string, typeof applications>);
  }, [applications]);

  const pipelineCounts = useMemo(
    () =>
      PIPELINE_STAGES.reduce((acc, stage) => {
        acc[stage] = applications.filter(
          (application) => (application.stage || application.status || "received") === stage,
        ).length;
        return acc;
      }, {} as Record<string, number>),
    [applications],
  );

  if (loading) {
    return <p>Loading ATS dashboard...</p>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Recruitment Dashboard</h1>
          <p className={styles.pageSubtitle}>
            A premium recruiter workspace to track roles, candidates, and hiring velocity.
          </p>
        </div>
        <div className={dashboardStyles.actionRow}>
          <button type="button" className={styles.btnPrimary} onClick={() => void reload()}>
            Refresh
          </button>
          <Link href="/careers/admin/applications" className={styles.btnSecondary}>
            View Applications
          </Link>
          <Link href="/careers/admin/applications" className={styles.btnSecondary}>
            View Pipeline
          </Link>
          <Link href="/careers/admin/jobs" className={styles.btnSecondary}>
            Job Workspace
          </Link>
          <Link href="/careers/admin/jobs/new" className={styles.btnSecondary}>
            Create Job
          </Link>
        </div>
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
            <span className={styles.statLabel}>Candidates In Pipeline</span>
            <Sparkles size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{totalCandidates}</div>
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
            <span className={styles.statLabel}>Interviews Pending</span>
            <Activity size={20} className={styles.statIcon} />
          </div>
          <div className={styles.statValue}>{pipelineCounts.interview ?? 0}</div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <section className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Recent Applications</h2>
              <p className={styles.panelSubtle}>Latest candidates who have entered the pipeline.</p>
            </div>
          </div>

          {recentApplications.length > 0 ? (
            <div className={dashboardStyles.recentList}>
              {recentApplications.map((application) => (
                <button
                  key={application.id}
                  type="button"
                  className={dashboardStyles.listRow}
                  onClick={() => window.location.assign(`/careers/admin/applications/${application.id}`)}
                >
                  <div>
                    <div className={dashboardStyles.rowName}>{application.fullName}</div>
                    <div className={dashboardStyles.rowMeta}>{application.jobTitle || application.role.jobTitle}</div>
                  </div>
                  <div className={dashboardStyles.rowInfo}>
                    <span className={dashboardStyles.rowDate}>
                      {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "—"}
                    </span>
                    <span className={styles.badge}>{application.stage ?? application.status}</span>
                    <span className={dashboardStyles.statusTag}>{application.status}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyTable}>
              <p>No recent applications found.</p>
            </div>
          )}
        </section>

        <section className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Recent Activity</h2>
              <p className={styles.panelSubtle}>Latest recruiter actions, notes, and candidate progress.</p>
            </div>
          </div>

          {recentActivity.length > 0 ? (
            <div className={dashboardStyles.timelineList}>
              {recentActivity.map((entry, index) => (
                <div key={`${entry.applicationId}-${index}`} className={dashboardStyles.timelineEntry}>
                  <span className={dashboardStyles.timelineDot} />
                  <div className={dashboardStyles.timelineContent}>
                    <div className={dashboardStyles.timelineLabel}>{STAGE_LABELS[entry.status] ?? entry.status}</div>
                    <p className={dashboardStyles.timelineNote}>{entry.note}</p>
                    <p className={dashboardStyles.timelineMeta}>
                      {entry.candidateName} • {entry.jobTitle} • {new Date(entry.createdAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyTable}>
              <p>No activity yet.</p>
            </div>
          )}
        </section>

        <section className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Open Roles Snapshot</h2>
              <p className={styles.panelSubtle}>Top roles with recent candidate demand.</p>
            </div>
            <Link href="/careers/admin/jobs" className={styles.btnSecondary}>
              Open Workspace
            </Link>
          </div>

          {jobs.length > 0 ? (
            <div className={dashboardStyles.roleList}>
              {jobs.slice(0, 6).map((job) => (
                <button
                  key={job.id}
                  type="button"
                  className={dashboardStyles.roleRow}
                  onClick={() => window.location.assign(`/careers/admin/jobs/${job.id}`)}
                >
                  <div className={dashboardStyles.roleInfo}>
                    <div className={dashboardStyles.roleTitle}>{job.title}</div>
                    <div className={dashboardStyles.roleMeta}>{`${job.department || "General"} • ${job.location || "Remote"}`}</div>
                  </div>
                  <div className={dashboardStyles.roleStats}>
                    <span>{jobApplicationCounts[job.id] ?? 0} applicants</span>
                    <span className={dashboardStyles.roleType}>{job.type.replace("-", " ")}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyTable}>
              <p>No open roles to display.</p>
            </div>
          )}
        </section>

        <section className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Pipeline Preview</h2>
              <p className={styles.panelSubtle}>Stage counts and top candidates per stage.</p>
            </div>
            <Link href="/careers/admin/applications" className={styles.btnSecondary}>
              View Pipeline
            </Link>
          </div>

          <div className={dashboardStyles.pipelineGrid}>
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage} className={dashboardStyles.pipelineTile}>
                <div className={dashboardStyles.pipelineTileHeader}>
                  <span className={dashboardStyles.pipelineTileLabel}>{STAGE_LABELS[stage]}</span>
                  <span className={dashboardStyles.pipelineTileCount}>{pipelineCounts[stage] ?? 0}</span>
                </div>
                <div className={dashboardStyles.pipelineTileCandidates}>
                  {pipelineBuckets[stage]?.length ? (
                    pipelineBuckets[stage].map((application) => (
                      <span key={application.id} className={dashboardStyles.candidateChip}>
                        {application.fullName}
                      </span>
                    ))
                  ) : (
                    <span className={dashboardStyles.pipelineEmpty}>No recent candidates</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
