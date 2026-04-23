import type {
  CareerApplication,
  CareerJob,
  ApplicationStage,
  ApplicationStatus,
} from "@/lib/types/careers";
import { getApplications } from "./application-service";
import { getAllJobs, getJobById } from "./job-service";
import { APPLICATION_PIPELINE_STAGES, DEFAULT_APPLICATION_STATUS } from "./constants";

export async function getAnalyticsOverview() {
  const apps = await getApplications();
  const jobs = await getAllJobs(true);
  const stageCounts = apps.reduce<Record<ApplicationStage, number>>(
    (acc, app) => {
      const stage = app.stage ?? "received";
      acc[stage] = (acc[stage] ?? 0) + 1;
      return acc;
    },
    APPLICATION_PIPELINE_STAGES.reduce((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {} as Record<ApplicationStage, number>),
  );

  const statusCounts = apps.reduce<Record<ApplicationStatus, number>>(
    (acc, app) => {
      acc[app.status] = (acc[app.status] ?? 0) + 1;
      return acc;
    },
    Array.from(
      new Set([
        ...APPLICATION_PIPELINE_STAGES,
        DEFAULT_APPLICATION_STATUS,
        "active" as ApplicationStatus,
      ]),
    ).reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as Record<ApplicationStatus, number>),
  );

  return {
    totalApplications: apps.length,
    openJobs: jobs.filter((job) => job.status === "open").length,
    activeJobs: jobs.length,
    byStage: stageCounts,
    byStatus: statusCounts,
    recentApplications: apps.slice(0, 8),
  };
}

export async function getPipelineBoard(jobId?: string) {
  const apps = await getApplications({ jobId });
  const job = jobId ? await getJobById(jobId, true) : null;
  const pipelineStages: ApplicationStage[] =
    job?.pipelineStages ?? APPLICATION_PIPELINE_STAGES;

  return pipelineStages.map((stage) => ({
    stage,
    label: stage,
    applications: apps.filter((app) => app.stage === stage),
  }));
}
