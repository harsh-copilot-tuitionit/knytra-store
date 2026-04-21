import { notFound } from "next/navigation";
import ApplicationFlow from "@/components/ApplicationFlow";
import { getJobBySlug } from "@/lib/ats/service";
import { normalizeApplicationConfig } from "@/lib/types/careers";

export const dynamic = "force-dynamic";

export default async function HrGrowthInternApplyPage() {
  const job = await getJobBySlug("hr-growth-intern");
  if (!job) {
    notFound();
  }

  return (
    <main>
      <ApplicationFlow
        jobId={job.id}
        jobSlug={job.slug}
        jobTitle={job.title}
        jobType={job.type}
        description={job.description}
        applicationConfig={normalizeApplicationConfig(job.applicationConfig)}
      />
    </main>
  );
}
