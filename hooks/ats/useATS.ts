"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CareerApplication,
  CareerJob,
  ApplicationStage,
} from "@/lib/types/careers";

interface ATSSummary {
  totalApplications: number;
  openJobs: number;
  activeJobs: number;
  byStage: Record<string, number>;
  byStatus: Record<string, number>;
}

export function useATS() {
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [summary, setSummary] = useState<ATSSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [appsRes, jobsRes, summaryRes] = await Promise.all([
        fetch("/api/careers/applications"),
        fetch("/api/careers/jobs"),
        fetch("/api/careers/ats/summary"),
      ]);

      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.applications ?? []);
      }

      if (jobsRes.ok) {
        const data = await jobsRes.json();
        setJobs(data.jobs ?? []);
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary ?? null);
      }
    } catch (err) {
      setError("Failed to load ATS data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const moveStage = useCallback(
    async (applicationId: string, nextStage: ApplicationStage) => {
      const res = await fetch(`/api/careers/applications/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: nextStage, author: "recruiter@knytra.in" }),
      });

      if (!res.ok) {
        throw new Error("Unable to move application.");
      }

      await load();
    },
    [load],
  );

  return {
    applications,
    jobs,
    summary,
    loading,
    error,
    reload: load,
    moveStage,
  };
}
