import { notFound } from "next/navigation";
import ApplicationFlow from "@/components/ApplicationFlow";
import { getJobBySlug } from "@/lib/ats/service";
import type { CareerJob } from "@/lib/types/careers";
import { normalizeApplicationConfig } from "@/lib/types/careers";

export const dynamic = "force-dynamic";

async function getJobBySlugForPage(slug: string): Promise<CareerJob | null> {
  return await getJobBySlug(slug);
}

export default async function ApplyPage({ params }: { params: { slug: string } }) {
  const job = await getJobBySlugForPage(params.slug);
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
