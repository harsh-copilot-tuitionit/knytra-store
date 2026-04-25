"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, RefreshCw, Plus, Search } from "lucide-react";
import { useApplicationsInbox } from "@/hooks/ats/useApplicationsInbox";
import type { ApplicationStage, ApplicationStatus } from "@/lib/types/careers";
import {
  APPLICATION_STAGE_LABELS,
  APPLICATION_STAGE_ORDER,
  APPLICATION_STATUS_LABELS,
} from "@/lib/types/careers";
import pageStyles from "../CareersAdminPage.module.css";
import inboxStyles from "../ApplicationsInbox.module.css";

export default function ApplicationsPage() {
  const router = useRouter();
  const {
    applications,
    jobs,
    loading,
    loadingMore,
    hasMore,
    error,
    filters,
    actions,
  } = useApplicationsInbox();

  const stageOptions = useMemo(
    () => APPLICATION_STAGE_ORDER,
    [],
  );

  const statusOptions = useMemo<("new" | "active" | "hired" | "rejected")[]>(
    () => ["new", "active", "hired", "rejected"],
    [],
  );

  return (
    <div className={inboxStyles.inboxShell}>
      <div className={inboxStyles.inboxHeader}>
        <div className={inboxStyles.inboxTitleGroup}>
          <h1 className={inboxStyles.inboxTitle}>Applications</h1>
          <p className={inboxStyles.inboxSubtitle}>All candidates across roles</p>
        </div>

        <div className={inboxStyles.inboxActions}>
          <button type="button" className={pageStyles.btnSecondary} onClick={actions.refresh}>
            <RefreshCw size={16} /> Refresh
          </button>
          <Link href="/careers/admin/jobs/new" className={pageStyles.btnPrimary}>
            <Plus size={16} /> Create Job
          </Link>
        </div>
      </div>

      <div className={inboxStyles.filterBar}>
        <div className={inboxStyles.filterRow}>
          <label className={inboxStyles.filterSearchLabel}>
            <Search size={16} className={inboxStyles.filterSearchIcon} />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => actions.setSearch(event.target.value)}
              placeholder="Search name, email, job title"
              className={inboxStyles.filterSearchField}
              autoComplete="off"
            />
          </label>
          <select
            className={inboxStyles.filterSelect}
            value={filters.stage}
            onChange={(event) => actions.setStage(event.target.value as ApplicationStage)}
          >
            <option value="">All stages</option>
            {stageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {APPLICATION_STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
          <select
            className={inboxStyles.filterSelect}
            value={filters.status}
            onChange={(event) => actions.setStatus(event.target.value as ApplicationStatus)}
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {APPLICATION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <select
            className={inboxStyles.filterSelect}
            value={filters.jobId}
            onChange={(event) => actions.setJobId(event.target.value)}
          >
            <option value="">All positions</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <select
            className={inboxStyles.filterSelect}
            value={filters.dateRange}
            onChange={(event) => actions.setDateRange(event.target.value as "all" | "7" | "30")}
          >
            <option value="all">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>
        <button type="button" className={inboxStyles.clearButton} onClick={actions.clearFilters}>
          Clear filters
        </button>
      </div>

      {loading && (
        <div className={inboxStyles.skeletonList}>
          {[...Array(5)].map((_, index) => (
            <div key={index} className={inboxStyles.skeletonCard}>
              <div className={inboxStyles.skeletonLine + " " + inboxStyles.skeletonLarge} />
              <div className={inboxStyles.skeletonLine + " " + inboxStyles.skeletonSmall} />
            </div>
          ))}
        </div>
      )}

      {!loading && applications.length === 0 && (
        <div className={inboxStyles.emptyState}>
          <p className={inboxStyles.emptyStateTitle}>No applications found</p>
          <p className={inboxStyles.emptyStateText}>
            Try adjusting filters or search.
          </p>
        </div>
      )}

      {!loading && applications.length > 0 && (
        <div className={inboxStyles.applicationsList}>
          {applications.map((application) => {
            return (
              <button
                key={application.id}
                type="button"
                className={inboxStyles.applicationCard}
                onClick={() => router.push(`/careers/admin/applications/${application.id}`)}
              >
                <div className={inboxStyles.applicationMain}>
                  <div className={inboxStyles.applicationMeta}>
                    <span className={inboxStyles.candidateName}>{application.fullName}</span>
                    <span className={inboxStyles.candidateEmail}>{application.email}</span>
                  </div>
                  <div className={inboxStyles.applicationJobGroup}>
                    <span className={inboxStyles.applicationJobTitle}>
                      {application.role?.jobTitle ?? application.jobTitle}
                    </span>
                    <span className={inboxStyles.applicationDate}>
                      {application.createdAt
                        ? new Date(application.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
                <div className={inboxStyles.applicationChips}>
                  <span className={`${inboxStyles.applicationStage} ${inboxStyles.stageTag}`}>
                    {APPLICATION_STAGE_LABELS[application.currentStage] ?? application.currentStage}
                  </span>
                  <span className={`${inboxStyles.applicationStage} ${inboxStyles.statusTag}`}>
                    {APPLICATION_STATUS_LABELS[application.status] ?? application.status}
                  </span>
                </div>
                <span className={inboxStyles.applicationChevron} aria-hidden="true">
                  <ArrowRight size={20} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {!loading && hasMore && (
        <button type="button" className={inboxStyles.loadMoreButton} onClick={actions.loadMore} disabled={loadingMore}>
          {loadingMore ? "Loading more…" : "Load more"}
        </button>
      )}

      {error ? <p style={{ color: "var(--color-danger)", marginTop: "var(--sp-4)" }}>{error}</p> : null}
    </div>
  );
}
