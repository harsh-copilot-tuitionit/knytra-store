"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CareerApplication,
  CareerJob,
  ApplicationStage,
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
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<ApplicationStage | "">("");
  const [jobId, setJobId] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "7" | "30">("all");

  const debouncedSearch = useDebouncedValue(search, 300);

  const dateFrom = useMemo(() => formatDateRange(dateRange), [dateRange]);
  const requestIdRef = useRef(0);
  const [refreshToken, setRefreshToken] = useState(0);

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        search: debouncedSearch.trim(),
        stage,
        jobId,
        dateRange,
        dateFrom,
      }),
    [debouncedSearch, dateFrom, dateRange, jobId, stage],
  );
  const previousFilterKeyRef = useRef(filterKey);

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
      if (jobId) params.set("jobId", jobId);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateRange !== "all") params.set("dateTo", new Date().toISOString());
      return params;
    },
    [dateFrom, dateRange, debouncedSearch, jobId, stage],
  );

  const fetchApplicationsPage = useCallback(
    async ({ offset, pageNavigation }: { offset: number; pageNavigation: boolean }) => {
      const requestId = ++requestIdRef.current;
      setApplications([]);
      setTotal(0);
      if (pageNavigation) {
        setPageLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const startTime = Date.now();
      try {
        const params = buildParams(offset);
        const res = await fetch(`/api/careers/applications?${params}`);
        if (!res.ok) {
          throw new Error("Failed to load applications.");
        }

        const data = await res.json();
        const loaded: CareerApplication[] = data.applications ?? [];
        const totalCount: number = typeof data.total === "number" ? data.total : 0;

        const elapsed = Date.now() - startTime;
        if (pageNavigation && elapsed < 2000) {
          await new Promise((resolve) => window.setTimeout(resolve, 2000 - elapsed));
        }

        if (requestId !== requestIdRef.current) return;

        setApplications(loaded);
        setTotal(totalCount);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setApplications([]);
        setTotal(0);
        setError(err instanceof Error ? err.message : "Failed to load applications.");
      } finally {
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
        setPageLoading(false);
      }
    },
    [buildParams],
  );

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goToPage = useCallback(
    (nextPage: number) => {
      const safePage = Math.min(Math.max(1, nextPage), totalPages);
      if (safePage === page || loading || pageLoading) return;
      setPage(safePage);
    },
    [loading, page, pageLoading, totalPages],
  );

  const refresh = useCallback(() => {
    setPage(1);
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const filtersChanged = previousFilterKeyRef.current !== filterKey;
    previousFilterKeyRef.current = filterKey;

    const nextPage = filtersChanged ? 1 : page;
    if (filtersChanged && page !== 1) {
      setPage(1);
      return;
    }

    const offset = (nextPage - 1) * PAGE_SIZE;
    void fetchApplicationsPage({
      offset,
      pageNavigation: !filtersChanged && nextPage > 1,
    });
  }, [filterKey, fetchApplicationsPage, page, refreshToken]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setStage("");
    setJobId("");
    setDateRange("all");
    setPage(1);
    setRefreshToken((value) => value + 1);
  }, []);

  return {
    applications,
    jobs,
    loading,
    pageLoading,
    error,
    page,
    total,
    totalPages,
    pageSize: PAGE_SIZE,
    filters: {
      search,
      stage,
      jobId,
      dateRange,
    },
    actions: {
      setSearch,
      setStage,
      setJobId,
      setDateRange,
      setPage: goToPage,
      refresh,
      clearFilters,
    },
  };
}
