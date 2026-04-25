"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CareerApplication,
  CareerJob,
  ApplicationStage,
  ApplicationStatus,
} from "@/lib/types/careers";

const PAGE_SIZE = 20;

function formatDateRange(value: "all" | "7" | "30") {
  if (value === "7") {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString();
  }
  if (value === "30") {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }
  return undefined;
}

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

export function useApplicationsInbox() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<ApplicationStage | "">("");
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [jobId, setJobId] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "7" | "30">("all");

  const debouncedSearch = useDebouncedValue(search, 300);

  const dateFrom = useMemo(() => formatDateRange(dateRange), [dateRange]);

  const loadJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/careers/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs ?? []);
      }
    } catch {
      // ignore, jobs can be empty
    }
  }, []);

  const buildParams = useCallback(
    (offset: number) => {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (stage) params.set("stage", stage);
      if (status) params.set("status", status);
      if (jobId) params.set("jobId", jobId);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateRange !== "all") params.set("dateTo", new Date().toISOString());
      return params;
    },
    [dateFrom, dateRange, debouncedSearch, jobId, stage, status],
  );

  const fetchApplicationsPage = useCallback(
    async ({ append, offset }: { append: boolean; offset: number }) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        setHasMore(true);
      }

      try {
        const params = buildParams(offset);
        const res = await fetch(`/api/careers/applications?${params}`);
        if (!res.ok) {
          throw new Error("Failed to load applications.");
        }

        const data = await res.json();
        const loaded: CareerApplication[] = data.applications ?? [];

        setApplications((previous) => {
          if (!append) return loaded;

          const existingIds = new Set(previous.map((app) => app.id));
          const next = loaded.filter((app) => !existingIds.has(app.id));
          return [...previous, ...next];
        });
        setHasMore(loaded.length === PAGE_SIZE);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load applications.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildParams],
  );

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    void fetchApplicationsPage({ append: false, offset: 0 });
  }, [fetchApplicationsPage]);

  const refresh = useCallback(() => {
    void fetchApplicationsPage({ append: false, offset: 0 });
  }, [fetchApplicationsPage]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    void fetchApplicationsPage({ append: true, offset: applications.length });
  }, [applications.length, fetchApplicationsPage, hasMore, loading, loadingMore]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStage("");
    setStatus("");
    setJobId("");
    setDateRange("all");
  }, []);

  return {
    applications,
    jobs,
    loading,
    loadingMore,
    hasMore,
    error,
    filters: {
      search,
      stage,
      status,
      jobId,
      dateRange,
    },
    actions: {
      setSearch,
      setStage,
      setStatus,
      setJobId,
      setDateRange,
      refresh,
      loadMore,
      clearFilters,
    },
  };
}
