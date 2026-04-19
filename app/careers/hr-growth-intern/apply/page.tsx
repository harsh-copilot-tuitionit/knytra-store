import { notFound } from "next/navigation";
import ApplicationFlow from "@/components/ApplicationFlow";
import { getJobBySlug } from "@/lib/careers";
import type { CareerJob } from "@/lib/types/careers";

export const dynamic = "force-dynamic";

async function getHrGrowthInternJob(): Promise<CareerJob | null> {
  return await getJobBySlug("hr-growth-intern");
}

export default async function HrGrowthInternApplyPage() {
  const job = await getHrGrowthInternJob();
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
        applicationConfig={job.applicationConfig ?? {
          showStudentSection: false,
          showExperienceSection: false,
          showMotivationSection: false,
          showAssessmentSection: false,
          customQuestions: [],
        }}
      />
    </main>
  );
}
